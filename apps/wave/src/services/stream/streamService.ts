import { existsSync } from 'node:fs';
import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import type { TelegramStreamConfig } from '@/types/streaming';
import { rtmpService } from './rtmpService';
import { telegramStreamService } from './telegramStreamService';

export class StreamService {
  private dataDir = join(process.cwd(), 'data');

  constructor() {
    this.initializeDataDirectory();
  }

  private async initializeDataDirectory() {
    if (!existsSync(this.dataDir)) {
      await mkdir(this.dataDir, { recursive: true });
    }
  }

  async startTelegramStream(): Promise<{ success: boolean; message: string }> {
    return telegramStreamService.startTelegramStream();
  }

  async stopTelegramStream(): Promise<{ success: boolean; message: string }> {
    return telegramStreamService.stopTelegramStream();
  }

  async restartTelegramStream(): Promise<{
    success: boolean;
    message: string;
  }> {
    return telegramStreamService.restartTelegramStream();
  }

  async updateTelegramConfig(updates: Partial<TelegramStreamConfig>) {
    return telegramStreamService.updateTelegramConfig(updates);
  }

  async getTelegramConfig() {
    return telegramStreamService.getTelegramConfig();
  }

  async startRtmpServer(): Promise<{ success: boolean; message: string }> {
    return rtmpService.startRtmpServer();
  }

  async stopRtmpServer(): Promise<{ success: boolean; message: string }> {
    return rtmpService.stopRtmpServer();
  }

  async restartRtmpServer(): Promise<{ success: boolean; message: string }> {
    return rtmpService.restartRtmpServer();
  }
}

export const streamService = new StreamService();
