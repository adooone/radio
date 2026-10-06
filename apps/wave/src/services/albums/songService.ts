import {
  type NewSongData,
  createSong,
  deleteSong,
  findSongById,
  findSongsByAlbum,
  reorderSongs,
  updateSong,
} from '@/db/albums/songs';
import { findAudioFileById } from '@/db/collections/audioFiles';
import { formatDurationFromString } from '@/utils/audioMetadata';
import { env } from '@/utils/env';
import { getErrorMessage } from '@/utils/errorMessages';
import { authService } from '../auth';
import { albumService } from './albumService';

export class SongService {
  /**
   * Computes audioUrl dynamically for tracks based on MEDIA_BASE_URL, album folderSlug, and track fileSlug.
   * Format: ${MEDIA_BASE_URL}/${folderSlug}/${fileSlug}.m4a
   */
  private computeAudioUrl(
    folderSlug: string | null,
    fileSlug: string | null,
  ): string | null {
    if (!folderSlug || !fileSlug) {
      return null;
    }
    // Normalize MEDIA_BASE_URL to remove trailing slashes
    const normalizedBaseUrl = env.mediaBaseUrl.replace(/\/+$/, '');
    return `${normalizedBaseUrl}/${folderSlug}/${fileSlug}.m4a`;
  }

  async getSongById(id: number) {
    const song = await findSongById(id);
    if (!song) {
      throw new Error('Song not found');
    }
    return song;
  }

  async getSongsByAlbum(albumId: number) {
    const album = await albumService.getAlbumById(albumId);
    const songs = await findSongsByAlbum(albumId);

    // Add computed audioUrl and format duration for each song
    return songs.map((song) => ({
      ...song,
      audioUrl: this.computeAudioUrl(album.folderSlug, song.fileSlug),
      duration: formatDurationFromString(song.duration) || null,
    }));
  }

  async addSongToAlbum(
    albumId: number,
    accountId: number,
    audioFileId: number,
    data: { trackNumber: number; title: string; artist?: string },
  ) {
    const album = await albumService.getAlbumById(albumId);
    await authService.requireOwnership(accountId, album.ownerId);

    const audioFile = await findAudioFileById(audioFileId);
    if (!audioFile) {
      throw new Error('Audio file not found');
    }

    const songData: NewSongData = {
      albumId,
      audioFileId,
      trackNumber: data.trackNumber,
      title: data.title,
      artist: data.artist,
      duration: audioFile.duration,
      format: audioFile.format,
    };

    return createSong(songData);
  }

  async updateSong(
    id: number,
    accountId: number,
    data: Partial<Omit<NewSongData, 'albumId' | 'audioFileId'>>,
  ) {
    const song = await this.getSongById(id);
    const album = await albumService.getAlbumById(song.albumId);
    await authService.requireOwnership(accountId, album.ownerId);

    await updateSong(id, data);
  }

  async deleteSong(id: number, accountId: number) {
    const song = await this.getSongById(id);
    const album = await albumService.getAlbumById(song.albumId);
    await authService.requireOwnership(accountId, album.ownerId);

    await deleteSong(id);
  }

  async reorderSongs(
    albumId: number,
    accountId: number,
    songOrders: Array<{ id: number; trackNumber: number }>,
  ) {
    const album = await albumService.getAlbumById(albumId);
    await authService.requireOwnership(accountId, album.ownerId);

    await reorderSongs(albumId, songOrders);
  }
}

export const songService = new SongService();
