#!/usr/bin/env bun

import { type ChildProcess, spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { TelegramStreamConfig } from '../src/types/streaming';

// Colors for console output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
};

const log = (message: string) => {
  console.log(
    `${colors.green}[${new Date().toISOString()}] TELEGRAM-DAEMON:${colors.reset} ${message}`,
  );
};

const error = (message: string) => {
  console.error(
    `${colors.red}[${new Date().toISOString()}] TELEGRAM-DAEMON ERROR:${colors.reset} ${message}`,
  );
};

const warning = (message: string) => {
  console.warn(
    `${colors.yellow}[${new Date().toISOString()}] TELEGRAM-DAEMON WARNING:${colors.reset} ${message}`,
  );
};

const info = (message: string) => {
  console.info(
    `${colors.blue}[${new Date().toISOString()}] TELEGRAM-DAEMON INFO:${colors.reset} ${message}`,
  );
};

class TelegramStreamDaemon {
  private ffmpegProcess: ChildProcess | null = null;
  private isShuttingDown = false;
  private restartAttempts = 0;
  private maxRestartAttempts = 5;
  private restartDelay = 5000; // 5 seconds
  private dataDir = join(process.cwd(), 'data');
  private telegramConfigFile = join(this.dataDir, 'telegram-config.json');
  private statusFile = join(this.dataDir, 'telegram-stream-status.json');

  private streamHealth = {
    isConnected: false,
    lastConnectionTime: null as Date | null,
    totalFramesSent: 0,
    currentBitrate: 0,
    connectionErrors: 0,
    lastHealthCheck: null as Date | null,
  };

  private config: TelegramStreamConfig = {
    rtmpUrl: 'rtmps://dc4-1.rtmp.t.me/s/',
    streamKey: '2560136036:m6Xk01Qa3dDMq3Rs7cic-Q',
    inputUrl: 'rtmp://localhost:1935/live/test',
  };

  constructor() {
    this.setupSignalHandlers();
    this.loadConfig();
    this.updateStatus('initializing');
  }

  private setupSignalHandlers() {
    process.on('SIGINT', () => this.gracefulShutdown('SIGINT'));
    process.on('SIGTERM', () => this.gracefulShutdown('SIGTERM'));
    process.on('uncaughtException', (err) => {
      error(`Uncaught exception: ${err.message}`);
      this.gracefulShutdown('UNCAUGHT_EXCEPTION');
    });
    process.on('unhandledRejection', (reason) => {
      error(`Unhandled rejection: ${reason}`);
    });
  }

  private async loadConfig() {
    try {
      if (existsSync(this.telegramConfigFile)) {
        const configData = await readFile(this.telegramConfigFile, 'utf-8');
        this.config = { ...this.config, ...JSON.parse(configData) };
        log('Configuration loaded successfully');
      } else {
        log('Using default configuration');
      }
    } catch (err) {
      error(`Error loading config: ${err}`);
    }
  }

  private async updateStatus(
    status: 'initializing' | 'running' | 'stopped' | 'error',
    details?: unknown,
  ) {
    const statusData = {
      status,
      pid: process.pid,
      timestamp: new Date().toISOString(),
      ffmpegPid: this.ffmpegProcess?.pid || null,
      restartAttempts: this.restartAttempts,
      details,
      streamHealth: {
        ...this.streamHealth,
        lastConnectionTime:
          this.streamHealth.lastConnectionTime?.toISOString() || null,
        lastHealthCheck: new Date().toISOString(),
      },
    };

    try {
      await writeFile(this.statusFile, JSON.stringify(statusData, null, 2));
    } catch (err) {
      error(`Failed to update status file: ${err}`);
    }
  }

  private parseFFmpegOutput(output: string): void {
    // Debug logging to understand what we're parsing
    if (output.includes('bitrate=') || output.includes('frame=')) {
      log(`🔍 Parsing FFmpeg output: ${output.trim()}`);
    }

    if (
      output.includes('Stream mapping:') ||
      output.includes('Press [q] to stop')
    ) {
      if (!this.streamHealth.isConnected) {
        this.streamHealth.isConnected = true;
        this.streamHealth.lastConnectionTime = new Date();
        log('✅ Successfully connected to Telegram RTMP server');
      }
    }

    const frameMatch = output.match(/frame=\s*(\d+)/);
    if (frameMatch) {
      const frames = Number.parseInt(frameMatch[1], 10);
      if (frames > this.streamHealth.totalFramesSent) {
        this.streamHealth.totalFramesSent = frames;
        log(`📊 Updated frames sent: ${frames}`);
      }
    }

    const bitrateMatch = output.match(/bitrate=\s*([\d.]+)kbits\/s/);
    if (bitrateMatch) {
      const bitrate = Number.parseFloat(bitrateMatch[1]);
      this.streamHealth.currentBitrate = bitrate;
      log(`📊 Updated bitrate: ${bitrate} kbps`);
    }

    if (
      output.includes('Connection refused') ||
      output.includes('Network is unreachable') ||
      output.includes('Input/output error') ||
      output.includes('Server returned 4XX')
    ) {
      this.streamHealth.connectionErrors++;
      this.streamHealth.isConnected = false;
      warning(`Connection issue detected: ${output}`);
    }

    // Set connected status when we see active streaming data
    if (output.includes('fps=') && output.includes('bitrate=')) {
      if (!this.streamHealth.isConnected) {
        this.streamHealth.isConnected = true;
        this.streamHealth.lastConnectionTime = new Date();
        log('✅ Stream connection confirmed via fps/bitrate data');
      }
      this.streamHealth.lastHealthCheck = new Date();
    }

    // Also set connected when we have valid bitrate data
    if (bitrateMatch && this.streamHealth.currentBitrate > 0) {
      if (!this.streamHealth.isConnected) {
        this.streamHealth.isConnected = true;
        this.streamHealth.lastConnectionTime = new Date();
        log('✅ Stream connection confirmed via bitrate data');
      }
    }
  }

  private buildFFmpegCommand(): string[] {
    return [
      'ffmpeg',
      '-i',
      this.config.inputUrl, // Audio input from RTMP
      '-vn', // Disable video completely
      '-c:a',
      'copy', // Copy audio stream without re-encoding (minimal CPU)
      '-f',
      'flv',
      `${this.config.rtmpUrl}${this.config.streamKey}`,
    ];
  }

  private async startFFmpeg(): Promise<void> {
    if (this.ffmpegProcess) {
      warning('FFmpeg process already exists, stopping it first');
      this.stopFFmpeg();
    }

    // Reset stream health for new connection attempt
    this.streamHealth = {
      isConnected: false,
      lastConnectionTime: null,
      totalFramesSent: 0,
      currentBitrate: 0,
      connectionErrors: 0,
      lastHealthCheck: null,
    };

    return new Promise((resolve, reject) => {
      const commandArgs = this.buildFFmpegCommand();
      const [command, ...args] = commandArgs;
      log(`Starting FFmpeg command: ${commandArgs.join(' ')}`);

      this.ffmpegProcess = spawn(command, args, {
        stdio: ['ignore', 'pipe', 'pipe'],
      });

      this.ffmpegProcess.on('spawn', () => {
        log(`FFmpeg process started with PID: ${this.ffmpegProcess?.pid}`);
        this.restartAttempts = 0; // Reset restart attempts on successful start
        this.updateStatus('running');
        resolve();
      });

      this.ffmpegProcess.on('error', (err) => {
        error(`FFmpeg spawn error: ${err.message}`);
        this.updateStatus('error', { error: err.message });
        reject(err);
      });

      this.ffmpegProcess.on('exit', (code, signal) => {
        const exitReason = signal ? `signal ${signal}` : `code ${code}`;
        log(`FFmpeg process exited with ${exitReason}`);

        this.ffmpegProcess = null;

        if (!this.isShuttingDown) {
          if (code === 0) {
            log('FFmpeg exited normally');
            this.updateStatus('stopped');
          } else {
            error(`FFmpeg exited with non-zero code: ${code}`);
            this.updateStatus('error', { exitCode: code, signal });
            this.scheduleRestart();
          }
        }
      });

      // Log FFmpeg output and parse for stream health
      this.ffmpegProcess.stdout?.on('data', (data) => {
        const output = data.toString().trim();
        if (output) {
          info(`FFmpeg stdout: ${output}`);
          this.parseFFmpegOutput(output);
        }
      });

      this.ffmpegProcess.stderr?.on('data', (data) => {
        const output = data.toString().trim();
        if (output) {
          this.parseFFmpegOutput(output);

          // FFmpeg sends most of its output to stderr, including normal operation logs
          if (output.includes('error') || output.includes('Error')) {
            error(`FFmpeg stderr: ${output}`);
          } else {
            info(`FFmpeg stderr: ${output}`);
          }
        }
      });

      // Set a timeout for spawn
      setTimeout(() => {
        if (!this.ffmpegProcess?.pid) {
          reject(new Error('FFmpeg failed to start within timeout'));
        }
      }, 10000);
    });
  }

  private stopFFmpeg(): void {
    if (this.ffmpegProcess) {
      log(`Stopping FFmpeg process (PID: ${this.ffmpegProcess.pid})`);
      this.ffmpegProcess.kill('SIGTERM');

      // Force kill after 5 seconds if it doesn't stop gracefully
      setTimeout(() => {
        if (this.ffmpegProcess) {
          warning('Force killing FFmpeg process');
          this.ffmpegProcess.kill('SIGKILL');
        }
      }, 5000);
    }
  }

  private scheduleRestart(): void {
    if (this.isShuttingDown) {
      return;
    }

    this.restartAttempts++;

    if (this.restartAttempts > this.maxRestartAttempts) {
      error(
        `Max restart attempts (${this.maxRestartAttempts}) reached. Giving up.`,
      );
      this.updateStatus('error', { reason: 'max_restart_attempts_reached' });
      return;
    }

    log(
      `Scheduling restart attempt ${this.restartAttempts}/${this.maxRestartAttempts} in ${this.restartDelay}ms`,
    );

    setTimeout(async () => {
      if (!this.isShuttingDown) {
        // Check if RTMP server is still running before attempting restart
        const rtmpRunning = await this.checkRtmpServerStatus();
        if (!rtmpRunning) {
          warning('RTMP server is not running, skipping restart attempt');
          this.updateStatus('error', {
            error: 'RTMP server not available',
            waiting: true,
          });
          return;
        }

        try {
          await this.startFFmpeg();
        } catch (err) {
          error(
            `Restart attempt ${this.restartAttempts} failed: ${err instanceof Error ? err.message : String(err)}`,
          );
        }
      }
    }, this.restartDelay);
  }

  private async gracefulShutdown(reason: string): Promise<void> {
    if (this.isShuttingDown) {
      return;
    }

    log(`Received ${reason}, shutting down gracefully...`);
    this.isShuttingDown = true;

    this.updateStatus('stopped', { reason });
    this.stopFFmpeg();

    // Wait a bit for FFmpeg to stop
    setTimeout(() => {
      log('Telegram stream daemon stopped');
      process.exit(0);
    }, 2000);
  }

  private async checkRtmpServerStatus(): Promise<boolean> {
    try {
      const { spawn } = await import('node:child_process');
      return new Promise((resolve) => {
        const dockerCheck = spawn('docker', [
          'ps',
          '--filter',
          'name=rtmp-server',
          '--format',
          '{{.Status}}',
        ]);

        let output = '';
        dockerCheck.stdout.on('data', (data) => {
          output += data.toString();
        });

        dockerCheck.on('close', (code) => {
          const isRunning = output.trim().startsWith('Up');
          resolve(isRunning);
        });

        dockerCheck.on('error', () => {
          resolve(false);
        });
      });
    } catch {
      return false;
    }
  }

  async start(): Promise<void> {
    log('Starting Telegram stream daemon');

    try {
      // Check if RTMP server is running before starting
      const rtmpRunning = await this.checkRtmpServerStatus();
      if (!rtmpRunning) {
        warning('RTMP server is not running. Waiting for it to start...');
        this.updateStatus('error', {
          error: 'RTMP server not available',
          waiting: true,
        });

        // Wait and check periodically for RTMP server
        const checkInterval = setInterval(async () => {
          if (this.isShuttingDown) {
            clearInterval(checkInterval);
            return;
          }

          const isRtmpRunning = await this.checkRtmpServerStatus();
          if (isRtmpRunning) {
            log('RTMP server is now available, starting FFmpeg...');
            clearInterval(checkInterval);
            try {
              await this.startFFmpeg();
            } catch (err) {
              error(
                `Failed to start FFmpeg after RTMP became available: ${err instanceof Error ? err.message : String(err)}`,
              );
            }
          } else {
            info('Still waiting for RTMP server...');
          }
        }, 10000); // Check every 10 seconds

        // Keep the process alive while waiting
        setInterval(() => {
          if (!this.isShuttingDown && !this.ffmpegProcess) {
            // Only attempt restart if RTMP is available
            this.checkRtmpServerStatus().then((isRunning) => {
              if (isRunning) {
                warning(
                  'RTMP is running but FFmpeg process not found, attempting restart',
                );
                this.scheduleRestart();
              }
            });
          }
        }, 30000); // Check every 30 seconds

        return;
      }

      await this.startFFmpeg();
      log('✅ Telegram stream daemon started successfully');

      // Keep the process alive
      setInterval(() => {
        // Health check - ensure FFmpeg is still running
        if (!this.isShuttingDown && !this.ffmpegProcess) {
          warning('FFmpeg process not found, attempting restart');
          this.scheduleRestart();
        }
      }, 30000); // Check every 30 seconds

      // Periodic status update to ensure monitoring service gets fresh data
      setInterval(() => {
        if (!this.isShuttingDown && this.ffmpegProcess) {
          // Update status with current stream health data
          this.updateStatus('running', {
            streamHealth: this.streamHealth,
            lastUpdate: new Date().toISOString(),
          });
        }
      }, 5000); // Update every 5 seconds
    } catch (err) {
      error(
        `Failed to start daemon: ${err instanceof Error ? err.message : String(err)}`,
      );
      this.updateStatus('error', {
        error: err instanceof Error ? err.message : String(err),
      });
      process.exit(1);
    }
  }
}

// Main execution
const daemon = new TelegramStreamDaemon();
daemon.start().catch((err) => {
  error(
    `Failed to start daemon: ${err instanceof Error ? err.message : String(err)}`,
  );
  process.exit(1);
});
