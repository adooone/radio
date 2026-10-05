import { exec } from 'node:child_process';
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { promisify } from 'node:util';
import type { LogData, LogEntry } from '@radio/types';
import { getErrorMessage } from '../../utils/errorMessages';
import type {
  MonitoringData,
  RtmpServiceStats,
  SystemHealth,
  TelegramServiceStats,
} from './types';

const execAsync = promisify(exec);

export class MonitoringService {
  private dataDir = process.env.DATA_DIR || './data';
  private telegramStatusFile = join(
    this.dataDir,
    'telegram-stream-status.json',
  );
  private telegramConfigFile = join(this.dataDir, 'telegram-config.json');

  async getSystemHealth(): Promise<SystemHealth> {
    const [telegramStats, rtmpStats] = await Promise.allSettled([
      this.getTelegramServiceStats(),
      this.getRtmpServiceStats(),
    ]);

    return {
      telegram:
        telegramStats.status === 'fulfilled' ? telegramStats.value : null,
      rtmp: rtmpStats.status === 'fulfilled' ? rtmpStats.value : null,
      timestamp: new Date().toISOString(),
    };
  }

  async getMonitoringData(): Promise<MonitoringData> {
    const systemHealth = await this.getSystemHealth();

    return {
      services: {
        telegram: systemHealth.telegram,
        rtmp: systemHealth.rtmp,
      },
      timestamp: systemHealth.timestamp,
      uptime: process.uptime(),
    };
  }

  async getTelegramServiceStats(): Promise<TelegramServiceStats | null> {
    try {
      // Get PM2 process info
      const pm2Info = await this.getTelegramPM2Info();

      // Get daemon status from file
      const daemonStatus = await this.getTelegramDaemonStatus();

      // Get masked stream key
      const streamKey = await this.getMaskedStreamKey();

      return {
        isRunning: pm2Info.isRunning || daemonStatus?.status === 'running',
        pm2Status:
          pm2Info.isRunning &&
          pm2Info.pid &&
          pm2Info.status &&
          pm2Info.cpu !== null &&
          pm2Info.memory !== null &&
          pm2Info.uptime !== null
            ? {
                pid: pm2Info.pid,
                status: pm2Info.status,
                cpu: pm2Info.cpu,
                memory: pm2Info.memory,
                uptime: pm2Info.uptime,
              }
            : null,
        daemonStatus: daemonStatus
          ? {
              status: daemonStatus.status,
              pid: daemonStatus.pid,
              ffmpegPid: daemonStatus.ffmpegPid,
              restartAttempts: daemonStatus.restartAttempts,
              lastUpdate: daemonStatus.timestamp,
              streamHealth: daemonStatus.streamHealth,
            }
          : null,
        lastHealthCheck: new Date().toISOString(),
        streamKey,
      };
    } catch (error) {
      console.error('Error getting Telegram service stats:', error);
      return null;
    }
  }

  async getRtmpServiceStats(): Promise<RtmpServiceStats | null> {
    try {
      const containerName = 'rtmp-server';

      // Check if container is running
      const { stdout: statusOutput } = await execAsync(
        `docker ps --filter "name=${containerName}" --format "{{.Status}}"`,
      );
      const isRunning = statusOutput.trim().includes('Up');

      if (!isRunning) {
        return {
          isRunning: false,
          containerName,
          status: 'stopped',
          stats: null,
          lastHealthCheck: new Date().toISOString(),
        };
      }

      // Get container stats
      const containerStats = await this.getRtmpContainerStats(containerName);

      // Get RTMP server statistics (if available via nginx-rtmp-module stats)
      const rtmpStats = await this.getRtmpServerStats(containerName);

      return {
        isRunning: true,
        containerName,
        status: statusOutput.trim(),
        stats: {
          container: containerStats,
          rtmp: rtmpStats,
        },
        lastHealthCheck: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error getting RTMP service stats:', error);
      return null;
    }
  }

  private async getTelegramPM2Info(): Promise<{
    isRunning: boolean;
    pid: number | null;
    status: string | null;
    cpu: number | null;
    memory: number | null;
    uptime: number | null;
  }> {
    try {
      const { stdout } = await execAsync('pm2 jlist');
      const processes = JSON.parse(stdout) as Array<{
        name: string;
        pid?: number;
        pm2_env?: {
          status?: string;
          pm_uptime?: number;
        };
        monit?: {
          cpu?: number;
          memory?: number;
        };
      }>;
      const telegramProcess = processes.find(
        (p) => p.name === 'radio.telegram',
      );

      if (!telegramProcess) {
        return {
          isRunning: false,
          pid: null,
          status: null,
          cpu: null,
          memory: null,
          uptime: null,
        };
      }

      return {
        isRunning: telegramProcess.pm2_env?.status === 'online',
        pid: telegramProcess.pid || null,
        status: telegramProcess.pm2_env?.status || null,
        cpu: telegramProcess.monit?.cpu || null,
        memory: telegramProcess.monit?.memory || null,
        uptime: telegramProcess.pm2_env?.pm_uptime || null,
      };
    } catch (error) {
      return {
        isRunning: false,
        pid: null,
        status: null,
        cpu: null,
        memory: null,
        uptime: null,
      };
    }
  }

  private async getTelegramDaemonStatus(): Promise<{
    status: 'initializing' | 'running' | 'stopped' | 'error';
    pid: number | null;
    timestamp: string | null;
    ffmpegPid: number | null;
    restartAttempts: number;
    details?: unknown;
    streamHealth?: {
      isConnected: boolean;
      lastConnectionTime: string | null;
      totalFramesSent: number;
      currentBitrate: number;
      connectionErrors: number;
      lastHealthCheck: string | null;
    };
  } | null> {
    try {
      if (!existsSync(this.telegramStatusFile)) {
        return null;
      }

      const statusData = await readFile(this.telegramStatusFile, 'utf-8');
      return JSON.parse(statusData);
    } catch (error) {
      console.error('Error reading telegram daemon status:', error);
      return null;
    }
  }

  private async getRtmpContainerStats(containerName: string): Promise<{
    cpuPercent: number;
    memoryUsage: number;
    memoryLimit: number;
    memoryPercent: number;
    networkIn: number;
    networkOut: number;
  } | null> {
    try {
      const { stdout } = await execAsync(
        `docker stats ${containerName} --no-stream --format "{{.CPUPerc}},{{.MemUsage}},{{.MemPerc}},{{.NetIO}}"`,
      );

      const [cpuPercent, memUsage, memPercent, netIO] = stdout
        .trim()
        .split(',');

      // Parse memory usage (e.g., "123.4MiB / 1.944GiB")
      const memParts = memUsage.split(' / ');
      const memoryUsage = this.parseMemoryValue(memParts[0]);
      const memoryLimit = this.parseMemoryValue(memParts[1]);

      // Parse network I/O (e.g., "5.54GB / 8.02GB")
      const netParts = netIO.split(' / ');
      const networkIn = Number.parseFloat(netParts[0].replace('GB', ''));
      const networkOut = Number.parseFloat(netParts[1].replace('GB', ''));

      return {
        cpuPercent: Number.parseFloat(cpuPercent.replace('%', '')),
        memoryUsage,
        memoryLimit,
        memoryPercent: Number.parseFloat(memPercent.replace('%', '')),
        networkIn, // Already in GB
        networkOut, // Already in GB
      };
    } catch (error) {
      console.error('Error getting container stats:', error);
      return null;
    }
  }

  private async getRtmpServerStats(containerName: string): Promise<{
    activePublishers: number;
    totalConnections: number;
    applications: Array<{
      name: string;
      streams: Array<{
        name: string;
        bandwidth: number;
        clients: number;
      }>;
    }>;
  } | null> {
    try {
      // Get nginx-rtmp-module statistics from the correct endpoint
      const { stdout } = await execAsync(
        `docker exec ${containerName} curl -s http://localhost:8069/rtmp_stats 2>/dev/null || echo ''`,
      );

      if (!stdout.trim()) {
        // Return default data if stats endpoint is not available
        return {
          activePublishers: 0,
          totalConnections: 0,
          applications: [
            {
              name: 'live',
              streams: [],
            },
          ],
        };
      }

      // Parse nginx-rtmp stats XML
      return this.parseRtmpStatsXml(stdout);
    } catch (error) {
      console.error('Error getting RTMP server stats:', error);
      return null;
    }
  }

  private parseRtmpStatsXml(xmlData: string): {
    activePublishers: number;
    totalConnections: number;
    applications: Array<{
      name: string;
      streams: Array<{
        name: string;
        bandwidth: number;
        clients: number;
      }>;
    }>;
  } {
    try {
      // Extract basic stats using regex patterns
      const nacceptedMatch = xmlData.match(/<naccepted>(\d+)<\/naccepted>/);
      const totalConnections = nacceptedMatch
        ? Number.parseInt(nacceptedMatch[1], 10)
        : 0;

      // Extract applications
      const applications: Array<{
        name: string;
        streams: Array<{
          name: string;
          bandwidth: number;
          clients: number;
        }>;
      }> = [];

      // Find all application blocks
      const applicationMatches = xmlData.matchAll(
        /<application>(.*?)<\/application>/gs,
      );

      for (const appMatch of applicationMatches) {
        const appContent = appMatch[1];
        const nameMatch = appContent.match(/<name>(.*?)<\/name>/);
        const appName = nameMatch ? nameMatch[1] : 'unknown';

        // Extract live streams
        const liveMatch = appContent.match(/<live>(.*?)<\/live>/s);
        const streams: Array<{
          name: string;
          bandwidth: number;
          clients: number;
        }> = [];

        if (liveMatch) {
          const liveContent = liveMatch[1];

          // Extract stream information
          const streamMatches = liveContent.matchAll(
            /<stream>(.*?)<\/stream>/gs,
          );

          for (const streamMatch of streamMatches) {
            const streamContent = streamMatch[1];
            const streamNameMatch = streamContent.match(/<name>(.*?)<\/name>/);
            const bandwidthMatch = streamContent.match(
              /<bw_out>(\d+)<\/bw_out>/,
            );
            const clientsMatch = streamContent.match(
              /<nclients>(\d+)<\/nclients>/,
            );

            streams.push({
              name: streamNameMatch ? streamNameMatch[1] : 'unknown',
              bandwidth: bandwidthMatch
                ? Number.parseInt(bandwidthMatch[1], 10)
                : 0,
              clients: clientsMatch ? Number.parseInt(clientsMatch[1], 10) : 0,
            });
          }
        }

        applications.push({
          name: appName,
          streams,
        });
      }

      // Count active publishers (streams with bandwidth > 0)
      const activePublishers = applications.reduce(
        (count, app) =>
          count + app.streams.filter((stream) => stream.bandwidth > 0).length,
        0,
      );

      return {
        activePublishers,
        totalConnections,
        applications,
      };
    } catch (error) {
      console.error('Error parsing RTMP stats XML:', error);
      // Return default data on parse error
      return {
        activePublishers: 0,
        totalConnections: 0,
        applications: [
          {
            name: 'live',
            streams: [],
          },
        ],
      };
    }
  }

  private parseMemoryValue(value: string): number {
    const num = Number.parseFloat(value);
    if (value.includes('GiB')) return num * 1024 * 1024 * 1024;
    if (value.includes('MiB')) return num * 1024 * 1024;
    if (value.includes('KiB')) return num * 1024;
    if (value.includes('GB')) return num * 1000 * 1000 * 1000;
    if (value.includes('MB')) return num * 1000 * 1000;
    if (value.includes('kB')) return num * 1000;
    return num;
  }

  async getLogs(source = 'all', lines = 100): Promise<LogData> {
    try {
      const logEntries: LogEntry[] = [];

      if (source === 'all' || source === 'telegram') {
        const telegramLogs = await this.getServiceLogs('telegram', lines);
        logEntries.push(...telegramLogs.entries);
      }

      if (source === 'all' || source === 'rtmp') {
        const rtmpLogs = await this.getServiceLogs('rtmp', lines);
        logEntries.push(...rtmpLogs.entries);
      }

      if (source === 'all' || source === 'wave') {
        const waveLogs = await this.getServiceLogs('wave', lines);
        logEntries.push(...waveLogs.entries);
      }

      // Sort by timestamp (oldest first for chronological display)
      logEntries.sort(
        (a, b) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
      );

      return {
        entries: logEntries.slice(0, lines),
        totalLines: logEntries.length,
        source,
        lastUpdated: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error getting logs:', error);
      return {
        entries: [],
        totalLines: 0,
        source,
        lastUpdated: new Date().toISOString(),
      };
    }
  }

  async getServiceLogs(service: string, lines = 100): Promise<LogData> {
    try {
      let logEntries: LogEntry[] = [];

      switch (service) {
        case 'telegram':
          logEntries = await this.getTelegramLogs(lines);
          break;
        case 'rtmp':
          logEntries = await this.getRtmpLogs(lines);
          break;
        case 'wave':
          logEntries = await this.getWaveLogs(lines);
          break;
        default:
          throw new Error(
            getErrorMessage.monitoring('UNKNOWN_SERVICE', service),
          );
      }

      return {
        entries: logEntries,
        totalLines: logEntries.length,
        source: service,
        lastUpdated: new Date().toISOString(),
      };
    } catch (error) {
      console.error(`Error getting ${service} logs:`, error);
      return {
        entries: [],
        totalLines: 0,
        source: service,
        lastUpdated: new Date().toISOString(),
      };
    }
  }

  private async getTelegramLogs(lines: number): Promise<LogEntry[]> {
    try {
      // Get logs from both stdout and stderr files to ensure chronological ordering
      // PM2 separates logs into different files, so we need to combine them
      const [stdoutResult, stderrResult] = await Promise.allSettled([
        execAsync(`pm2 logs radio.telegram --lines ${lines} --nostream --out`),
        execAsync(`pm2 logs radio.telegram --lines ${lines} --nostream --err`),
      ]);

      let combinedLogs = '';

      if (stdoutResult.status === 'fulfilled') {
        combinedLogs += stdoutResult.value.stdout;
      }

      if (stderrResult.status === 'fulfilled') {
        combinedLogs += stderrResult.value.stdout;
      }

      return this.parsePM2Logs(combinedLogs, 'telegram');
    } catch (error) {
      console.error('Error getting Telegram logs:', error);
      return [];
    }
  }

  private async getRtmpLogs(lines: number): Promise<LogEntry[]> {
    try {
      // Get Docker logs for RTMP container
      const { stdout } = await execAsync(
        `docker logs rtmp-server --tail ${lines} 2>&1`,
      );
      return this.parseDockerLogs(stdout, 'rtmp');
    } catch (error) {
      console.error('Error getting RTMP logs:', error);
      return [];
    }
  }

  private async getWaveLogs(lines: number): Promise<LogEntry[]> {
    try {
      // Get logs from both stdout and stderr files to ensure chronological ordering
      // PM2 separates logs into different files, so we need to combine them
      const [stdoutResult, stderrResult] = await Promise.allSettled([
        execAsync(`pm2 logs radio.wave --lines ${lines} --nostream --out`),
        execAsync(`pm2 logs radio.wave --lines ${lines} --nostream --err`),
      ]);

      let combinedLogs = '';

      if (stdoutResult.status === 'fulfilled') {
        combinedLogs += stdoutResult.value.stdout;
      }

      if (stderrResult.status === 'fulfilled') {
        combinedLogs += stderrResult.value.stdout;
      }

      return this.parsePM2Logs(combinedLogs, 'wave');
    } catch (error) {
      console.error('Error getting Wave logs:', error);
      return [];
    }
  }

  private parsePM2Logs(logOutput: string, source: string): LogEntry[] {
    const entries: LogEntry[] = [];
    const lines = logOutput.split('\n').filter((line) => line.trim());

    for (const line of lines) {
      try {
        // Skip PM2 header lines
        if (
          line.includes('[TAILING]') ||
          line.includes('Tailing last') ||
          (line.includes('last') && line.includes('lines:'))
        ) {
          continue;
        }

        // Clean ANSI color codes from the line
        const cleanLine = this.stripAnsiCodes(line);

        // Try multiple PM2 log formats
        let match = null;
        let timestamp = '';
        let level = '';
        let message = '';
        let serviceAndLevel = '';

        // Format 1: 9|radio.te | 2025-09-07 13:12:24 +00:00: [2025-09-07T13:12:24.164Z] TELEGRAM-DAEMON INFO: message
        match = cleanLine.match(
          /^\d+\|[^|]+\| (\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2} [+-]\d{2}:\d{2}): \[([^\]]+)\] ([^:]+): ([^:]+): (.+)$/,
        );
        if (match) {
          [, timestamp, , serviceAndLevel, , message] = match;
          // Extract level from serviceAndLevel (e.g., "TELEGRAM-DAEMON WARNING" -> "WARNING")
          level = serviceAndLevel.split(' ').pop() || 'info';
        } else {
          // Format 2: 2025-09-07 13:11:14 +00:00: [2025-09-07T13:11:14.154Z] TELEGRAM-DAEMON INFO: message (without PM2 prefix)
          match = cleanLine.match(
            /^(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2} [+-]\d{2}:\d{2}): \[([^\]]+)\] ([^:]+): ([^:]+): (.+)$/,
          );
          if (match) {
            [, timestamp, , serviceAndLevel, , message] = match;
            // Extract level from serviceAndLevel (e.g., "TELEGRAM-DAEMON WARNING" -> "WARNING")
            level = serviceAndLevel.split(' ').pop() || 'info';
          } else {
            // Format 3: [timestamp] [level] message (original format)
            match = cleanLine.match(/^\[([^\]]+)\] \[([^\]]+)\] (.+)$/);
            if (match) {
              [, timestamp, level, message] = match;
            } else {
              // Format 4: timestamp message (simple format)
              match = cleanLine.match(
                /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d+Z)\s+(.+)$/,
              );
              if (match) {
                [, timestamp, message] = match;
                level = 'info';
              } else {
                // Format 5: Simple timestamp message (from error logs)
                match = cleanLine.match(
                  /^(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2} [+-]\d{2}:\d{2}): (.+)$/,
                );
                if (match) {
                  [, timestamp, message] = match;
                  level = this.detectLogLevel(message);
                } else {
                  // Fallback for lines that don't match any expected format
                  entries.push({
                    timestamp: new Date().toISOString(),
                    level: 'info',
                    message: this.stripAnsiCodes(line.trim()),
                    source,
                  });
                  continue;
                }
              }
            }
          }
        }

        entries.push({
          timestamp: this.parseTimestamp(timestamp),
          level: this.normalizeLogLevel(level),
          message: this.stripAnsiCodes(message.trim()),
          source,
        });
      } catch (error) {
        // Skip malformed log entries
      }
    }

    // Sort entries by timestamp to ensure chronological order
    // This is important because PM2 might return logs from different streams
    // in a non-chronological order
    entries.sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
    );

    return entries;
  }

  private parseDockerLogs(logOutput: string, source: string): LogEntry[] {
    const entries: LogEntry[] = [];
    const lines = logOutput.split('\n').filter((line) => line.trim());

    for (const line of lines) {
      try {
        // Docker log format: timestamp message
        const match = line.match(
          /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d+Z)\s+(.+)$/,
        );
        if (match) {
          const [, timestamp, message] = match;
          entries.push({
            timestamp,
            level: this.detectLogLevel(message),
            message: message.trim(),
            source,
          });
        } else {
          // Fallback for lines that don't match the expected format
          entries.push({
            timestamp: new Date().toISOString(),
            level: 'info',
            message: line.trim(),
            source,
          });
        }
      } catch (error) {
        // Skip malformed log entries
      }
    }

    return entries;
  }

  private parseTimestamp(timestamp: string): string {
    try {
      // Try to parse various timestamp formats
      const date = new Date(timestamp);
      if (!Number.isNaN(date.getTime())) {
        return date.toISOString();
      }
      return new Date().toISOString();
    } catch (error) {
      return new Date().toISOString();
    }
  }

  private normalizeLogLevel(
    level: string,
  ): 'error' | 'warn' | 'info' | 'debug' {
    const normalized = level.toLowerCase();
    if (normalized.includes('error') || normalized.includes('err'))
      return 'error';
    if (normalized.includes('warning') || normalized.includes('warn'))
      return 'warn';
    if (normalized.includes('debug')) return 'debug';
    return 'info';
  }

  private detectLogLevel(message: string): 'error' | 'warn' | 'info' | 'debug' {
    const lowerMessage = message.toLowerCase();
    if (
      lowerMessage.includes('error') ||
      lowerMessage.includes('failed') ||
      lowerMessage.includes('exception')
    ) {
      return 'error';
    }
    if (lowerMessage.includes('warning') || lowerMessage.includes('warn')) {
      return 'warn';
    }
    if (lowerMessage.includes('debug')) {
      return 'debug';
    }
    return 'info';
  }

  private stripAnsiCodes(str: string): string {
    // Remove ANSI escape sequences (color codes, etc.)
    const escapeChar = String.fromCharCode(27);
    return str.replace(new RegExp(`${escapeChar}\\[[0-9;]*m`, 'g'), '');
  }

  private async getMaskedStreamKey(): Promise<string | undefined> {
    try {
      if (!existsSync(this.telegramConfigFile)) {
        return undefined;
      }

      const configData = await readFile(this.telegramConfigFile, 'utf-8');
      const config = JSON.parse(configData);

      if (!config.streamKey || typeof config.streamKey !== 'string') {
        return undefined;
      }

      const streamKey = config.streamKey;
      if (streamKey.length <= 4) {
        return streamKey; // If key is too short, return as is
      }

      // Show compact format: "••••••••c-Q" instead of "**********************c-Q"
      const lastFour = streamKey.slice(-4);
      return `••••••••${lastFour}`;
    } catch (error) {
      console.error('Error reading telegram config for stream key:', error);
      return undefined;
    }
  }
}

export const monitoringService = new MonitoringService();
