import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import {
  type ServiceResponse,
  ServiceResponseHelper,
} from '../../utils/serviceResponse';

const execAsync = promisify(exec);

export class RtmpService {
  private containerName = 'rtmp-server';

  async isRtmpServerRunning(): Promise<boolean> {
    try {
      const { stdout } = await execAsync(
        `docker ps --filter "name=${this.containerName}" --format "{{.Status}}"`,
      );
      return stdout.trim().includes('Up');
    } catch (error) {
      console.error('Error checking RTMP server status:', error);
      return false;
    }
  }

  async startRtmpServer(): Promise<ServiceResponse> {
    try {
      const isRunning = await this.isRtmpServerRunning();

      if (isRunning) {
        return ServiceResponseHelper.stream.rtmp.alreadyRunning();
      }

      // Start the RTMP server using the existing script
      const { stdout } = await execAsync('bash scripts/start-rtmp.sh', {
        maxBuffer: 1024 * 1024, // 1MB buffer
      });

      return ServiceResponseHelper.stream.rtmp.startSuccess();
    } catch (error) {
      console.error('Error starting RTMP server:', error);
      return ServiceResponseHelper.stream.rtmp.startFailed(String(error));
    }
  }

  // Stop RTMP server
  async stopRtmpServer(): Promise<ServiceResponse> {
    try {
      const isRunning = await this.isRtmpServerRunning();

      if (!isRunning) {
        return ServiceResponseHelper.stream.rtmp.alreadyStopped();
      }

      // Stop the RTMP server container
      await execAsync(`docker stop ${this.containerName}`);

      return ServiceResponseHelper.stream.rtmp.stopSuccess();
    } catch (error) {
      console.error('Error stopping RTMP server:', error);
      return ServiceResponseHelper.stream.rtmp.stopFailed(String(error));
    }
  }

  // Restart RTMP server
  async restartRtmpServer(): Promise<ServiceResponse> {
    try {
      await this.stopRtmpServer();
      // Wait a moment for the container to fully stop
      await new Promise((resolve) => setTimeout(resolve, 2000));
      return await this.startRtmpServer();
    } catch (error) {
      console.error('Error restarting RTMP server:', error);
      return {
        success: false,
        message: `Failed to restart RTMP server: ${error}`,
      };
    }
  }
}

export const rtmpService = new RtmpService();
