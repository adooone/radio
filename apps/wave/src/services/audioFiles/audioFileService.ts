import { existsSync, readFileSync, unlinkSync } from 'node:fs';
import {
  deleteAudioFile as deleteAudioFileFromDb,
  findAudioFileById,
} from '@/db/collections/audioFiles';
import { formatDurationFromString } from '@/utils/audioMetadata';
import { getErrorMessage } from '@/utils/errorMessages';
import { authService } from '../auth';

export class AudioFileService {
  private getMimeType(format: string): string {
    const mimeTypes: Record<string, string> = {
      mp3: 'audio/mpeg',
      wav: 'audio/wav',
      ogg: 'audio/ogg',
      aac: 'audio/aac',
      flac: 'audio/flac',
      m4a: 'audio/mp4',
    };
    return mimeTypes[format.toLowerCase()] || 'audio/mpeg';
  }

  async getAudioFileById(id: number) {
    const audioFile = await findAudioFileById(id);
    if (!audioFile) {
      throw new Error(getErrorMessage.resource('NOT_FOUND'));
    }
    // Format duration before returning
    return {
      ...audioFile,
      duration: formatDurationFromString(audioFile.duration) || null,
    };
  }

  async streamAudioFile(id: number) {
    const audioFile = await this.getAudioFileById(id);

    if (!existsSync(audioFile.path)) {
      throw new Error(getErrorMessage.file('NOT_FOUND', 'Audio file on disk'));
    }

    const buffer = readFileSync(audioFile.path);
    const mimeType = this.getMimeType(audioFile.format);

    return {
      buffer,
      mimeType,
      size: audioFile.size,
    };
  }

  async deleteAudioFile(id: number, accountId: number) {
    const audioFile = await this.getAudioFileById(id);
    await authService.requireOwnership(accountId, audioFile.uploadedBy);

    // Delete from database
    await deleteAudioFileFromDb(id);

    // Delete file from disk
    if (existsSync(audioFile.path)) {
      unlinkSync(audioFile.path);
    }
  }
}

export const audioFileService = new AudioFileService();
