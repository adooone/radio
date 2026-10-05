import { exec } from 'node:child_process';
import { existsSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { promisify } from 'node:util';
import type { TelegramStreamConfig } from '../../types/streaming';
import {
  type ServiceResponse,
  ServiceResponseHelper,
} from '../../utils/serviceResponse';

const execAsync = promisify(exec);

export class TelegramStreamService {
  private dataDir = join(process.cwd(), 'data');
  private telegramConfigFile = join(this.dataDir, 'telegram-config.json');
  private statusFile = join(this.dataDir, 'telegram-stream-status.json');

  // Default Telegram stream configuration
  private telegramConfig: TelegramStreamConfig = {
    rtmpUrl: 'rtmps://dc4-1.rtmp.t.me/s/',
    streamKey: '2560136036:m6Xk01Qa3dDMq3Rs7cic-Q',
    inputUrl: 'rtmp://localhost:1935/live/test',
  };

  constructor() {
    this.loadTelegramConfig();
  }

  // Load Telegram configuration from file
  private async loadTelegramConfig(): Promise<void> {
    try {
      if (existsSync(this.telegramConfigFile)) {
        const configData = await readFile(this.telegramConfigFile, 'utf-8');
        this.telegramConfig = {
          ...this.telegramConfig,
          ...JSON.parse(configData),
        };
      }
    } catch (error) {
      console.error('Error loading Telegram config:', error);
    }
  }

  // Save Telegram configuration to file
  private async saveTelegramConfig(): Promise<void> {
    try {
      await writeFile(
        this.telegramConfigFile,
        JSON.stringify(this.telegramConfig, null, 2),
      );
    } catch (error) {
      console.error('Error saving Telegram config:', error);
    }
  }

  // Get daemon status from status file
  private async getDaemonStatus(): Promise<{
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
      if (!existsSync(this.statusFile)) {
        return null;
      }

      const statusData = await readFile(this.statusFile, 'utf-8');
      return JSON.parse(statusData);
    } catch (error) {
      console.error('Error reading daemon status:', error);
      return null;
    }
  }

  // Check if Telegram stream is running via PM2
  async isTelegramStreamRunning(): Promise<boolean> {
    try {
      // First check PM2 status
      const { stdout } = await execAsync('pm2 jlist');
      const processes = JSON.parse(stdout);
      const telegramProcess = processes.find(
        (proc: { name: string; pm2_env: { status: string } }) =>
          proc.name === 'radio.telegram',
      );

      if (!telegramProcess || telegramProcess.pm2_env.status !== 'online') {
        return false;
      }

      // Check daemon status file for more accurate information
      const daemonStatus = await this.getDaemonStatus();
      if (
        daemonStatus &&
        daemonStatus.status === 'running' &&
        daemonStatus.ffmpegPid
      ) {
        // Verify FFmpeg process is still alive
        try {
          const { stdout: ffmpegCheck } = await execAsync(
            `ps -p ${daemonStatus.ffmpegPid}`,
          );
          return ffmpegCheck.includes(daemonStatus.ffmpegPid.toString());
        } catch {
          return false;
        }
      }

      return false;
    } catch (error) {
      console.error('Error checking PM2 telegram stream status:', error);
      return false;
    }
  }

  async getPM2ProcessInfo(): Promise<{
    status: string;
    pid: number | null;
    uptime: number | null;
    memory: number | null;
    cpu: number | null;
  }> {
    try {
      const { stdout } = await execAsync('pm2 jlist');
      const processes = JSON.parse(stdout);
      const telegramProcess = processes.find(
        (proc: {
          name: string;
          pm2_env: { status: string; pm_uptime?: number };
          pid?: number;
          monit?: { memory: number; cpu: number };
        }) => proc.name === 'radio.telegram',
      );

      if (!telegramProcess) {
        return {
          status: 'not_found',
          pid: null,
          uptime: null,
          memory: null,
          cpu: null,
        };
      }

      return {
        status: telegramProcess.pm2_env.status,
        pid: telegramProcess.pid || null,
        uptime: telegramProcess.pm2_env.pm_uptime || null,
        memory: telegramProcess.monit?.memory || null,
        cpu: telegramProcess.monit?.cpu || null,
      };
    } catch (error) {
      console.error('Error getting PM2 process info:', error);
      return {
        status: 'error',
        pid: null,
        uptime: null,
        memory: null,
        cpu: null,
      };
    }
  }

  // Start Telegram stream using PM2
  async startTelegramStream(): Promise<ServiceResponse> {
    try {
      const isRunning = await this.isTelegramStreamRunning();
      if (isRunning) {
        return ServiceResponseHelper.stream.telegram.alreadyRunning();
      }

      // Check if RTMP server is running first
      const rtmpStatus = await this.checkRtmpServerStatus();
      if (!rtmpStatus.isRunning) {
        return ServiceResponseHelper.stream.telegram.rtmpDependency();
      }

      console.log('Starting Telegram stream with PM2...');

      // Start the PM2 process
      const { stdout, stderr } = await execAsync(
        'pm2 start ecosystem.config.js --only radio.telegram --env production',
      );

      if (stderr && !stderr.includes('already exists')) {
        console.error('PM2 error:', stderr);
        return ServiceResponseHelper.stream.telegram.startFailed(stderr);
      }

      // Wait a moment for the process to start and check status
      await new Promise((resolve) => setTimeout(resolve, 3000));

      // Check if it's actually running with FFmpeg
      const isNowRunning = await this.isTelegramStreamRunning();
      if (isNowRunning) {
        return ServiceResponseHelper.stream.telegram.startSuccess();
      }

      // If not running, check if daemon is waiting for RTMP
      const daemonStatus = await this.getDaemonStatus();
      if (
        daemonStatus?.status === 'error' &&
        (daemonStatus.details as { waiting?: boolean })?.waiting
      ) {
        return ServiceResponseHelper.stream.telegram.daemonWaiting();
      }

      return ServiceResponseHelper.stream.telegram.startFailed(
        'failed to start',
      );
    } catch (error) {
      console.error('Error starting Telegram stream:', error);
      return ServiceResponseHelper.stream.telegram.startFailed(String(error));
    }
  }

  // Check RTMP server status
  private async checkRtmpServerStatus(): Promise<{ isRunning: boolean }> {
    try {
      // Check if Docker container is running
      const { stdout } = await execAsync(
        'docker ps --filter "name=rtmp-server" --format "{{.Status}}"',
      );
      const isRunning = stdout.trim().startsWith('Up');
      return { isRunning };
    } catch (error) {
      console.error('Error checking RTMP server status:', error);
      return { isRunning: false };
    }
  }

  // Stop Telegram stream using PM2
  async stopTelegramStream(): Promise<ServiceResponse> {
    try {
      const isRunning = await this.isTelegramStreamRunning();
      if (!isRunning) {
        return ServiceResponseHelper.stream.telegram.notRunning();
      }

      console.log('Stopping Telegram stream via PM2...');

      // Stop the PM2 process
      const { stdout, stderr } = await execAsync('pm2 stop radio.telegram');

      if (stderr) {
        console.error('PM2 error:', stderr);
        return ServiceResponseHelper.stream.telegram.stopFailed(stderr);
      }

      return ServiceResponseHelper.stream.telegram.stopSuccess();
    } catch (error) {
      console.error('Error stopping Telegram stream:', error);
      return ServiceResponseHelper.stream.telegram.stopFailed(String(error));
    }
  }

  // Restart Telegram stream using PM2
  async restartTelegramStream(): Promise<ServiceResponse> {
    try {
      console.log('Restarting Telegram stream via PM2...');

      // Use PM2 restart command
      const { stdout, stderr } = await execAsync('pm2 restart radio.telegram');

      if (stderr && !stderr.includes('Process successfully restarted')) {
        console.error('PM2 restart stderr:', stderr);
        return ServiceResponseHelper.stream.telegram.restartFailed(stderr);
      }

      console.log('PM2 restart stdout:', stdout);

      // Wait a moment for the process to fully restart
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const isRunning = await this.isTelegramStreamRunning();
      if (!isRunning) {
        return ServiceResponseHelper.stream.telegram.restartFailed(
          'failed to start after restart',
        );
      }

      return ServiceResponseHelper.stream.telegram.restartSuccess();
    } catch (error) {
      console.error('Error restarting Telegram stream:', error);
      return ServiceResponseHelper.stream.telegram.restartFailed(String(error));
    }
  }

  async updateTelegramConfig(
    updates: Partial<TelegramStreamConfig>,
  ): Promise<ServiceResponse<TelegramStreamConfig>> {
    try {
      this.telegramConfig = { ...this.telegramConfig, ...updates };
      await this.saveTelegramConfig();

      return ServiceResponseHelper.stream.telegram.configUpdated(
        this.telegramConfig,
      );
    } catch (error) {
      console.error('Error updating Telegram config:', error);
      return ServiceResponseHelper.stream.telegram.configUpdateFailed(
        String(error),
      );
    }
  }

  // Get Telegram stream configuration
  async getTelegramConfig(): Promise<TelegramStreamConfig> {
    return this.telegramConfig;
  }
}

export const telegramStreamService = new TelegramStreamService();
