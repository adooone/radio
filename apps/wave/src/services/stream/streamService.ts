import { existsSync } from 'node:fs';
import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { rtmpService } from './rtmpService';

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
