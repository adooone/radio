import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  statSync,
  unlinkSync,
  writeFileSync,
} from 'node:fs';
import { extname, join, relative, resolve } from 'node:path';
import {
  type NewAlbumData,
  createAlbum,
  deleteAlbum,
  findAlbumById,
  findAlbumsByOwner,
  findPublicAlbums,
  findPublicAlbumsWithFilters,
  updateAlbum,
  updateAlbumCover,
} from '@/db/albums/albums';
import { findSongsByAlbum } from '@/db/albums/songs';
import { formatDurationFromString } from '@/utils/audioMetadata';
import { env } from '@/utils/env';
import { getErrorMessage } from '@/utils/errorMessages';
import type {
  PersonnelItem,
  Production,
  RecordingDetails,
  ReleaseInfo,
  Visuals,
} from '@radio/types';
import { authService } from '../auth';

function parseAlbumJsonFields<T extends Record<string, unknown>>(album: T) {
  const a = album as T & {
    recordingDetails?: string | null;
    releaseInfo?: string | null;
    personnel?: string | null;
    production?: string | null;
    visuals?: string | null;
    additionalInfo?: string | null;
  };
  return {
    ...album,
    recordingDetails: safeParseJson<RecordingDetails>(a.recordingDetails),
    releaseInfo: safeParseJson<ReleaseInfo>(a.releaseInfo),
    personnel: safeParseJson<PersonnelItem[]>(a.personnel),
    production: safeParseJson<Production>(a.production),
    visuals: safeParseJson<Visuals>(a.visuals),
    additionalInfo: a.additionalInfo ?? null,
  };
}

function safeParseJson<T>(raw: string | null | undefined): T | null {
  if (raw == null || raw === '') return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export class AlbumService {
  private coversDir: string;

  constructor() {
    this.coversDir = join(process.cwd(), 'data', 'uploads', 'covers');
    this.ensureCoversDir();
  }

  private ensureCoversDir() {
    if (!existsSync(this.coversDir)) {
      mkdirSync(this.coversDir, { recursive: true });
    }
  }

  private generateCoverFileName(albumId: number, extension: string): string {
    const timestamp = Date.now();
    return `cover_${albumId}_${timestamp}.${extension}`;
  }

  private getMimeType(extension: string): string {
    const mimeTypes: Record<string, string> = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      webp: 'image/webp',
      gif: 'image/gif',
    };
    return mimeTypes[extension.toLowerCase()] || 'image/jpeg';
  }

  private static readonly IMAGE_EXTENSIONS = new Set([
    '.jpg',
    '.jpeg',
    '.png',
    '.webp',
    '.gif',
  ]);

  private isImageFile(filename: string): boolean {
    return AlbumService.IMAGE_EXTENSIONS.has(extname(filename).toLowerCase());
  }

  private collectImagesFromDir(dirPath: string, prefix: string): string[] {
    const result: string[] = [];
    if (!existsSync(dirPath) || !statSync(dirPath).isDirectory()) {
      return result;
    }
    const entries = readdirSync(dirPath);
    for (const entry of entries) {
      const fullPath = join(dirPath, entry);
      if (statSync(fullPath).isFile() && this.isImageFile(entry)) {
        result.push(prefix ? `${prefix}/${entry}` : entry);
      }
    }
    return result;
  }

  async getPublicAlbums(limit: number, offset: number) {
    const albums = await findPublicAlbums(limit, offset);
    return albums.map((album) =>
      parseAlbumJsonFields({
        ...album,
        coverImageUrl: this.computeCoverImageUrl(
          album.folderSlug,
          album.cover,
          album.id,
        ),
      }),
    );
  }

  async getPublicAlbumsWithFilters(
    filters: {
      artist?: string;
      year?: number;
      tags?: string[];
      search?: string;
    },
    limit: number,
    offset: number,
  ) {
    const albums = await findPublicAlbumsWithFilters(filters, limit, offset);
    return albums.map((album) =>
      parseAlbumJsonFields({
        ...album,
        coverImageUrl: this.computeCoverImageUrl(
          album.folderSlug,
          album.cover,
          album.id,
        ),
      }),
    );
  }

  async getUserAlbums(accountId: number, limit: number, offset: number) {
    const albums = await findAlbumsByOwner(accountId, limit, offset);
    return albums.map((album) =>
      parseAlbumJsonFields({
        ...album,
        coverImageUrl: this.computeCoverImageUrl(
          album.folderSlug,
          album.cover,
          album.id,
        ),
      }),
    );
  }

  async getAlbumById(id: number) {
    const album = await findAlbumById(id);
    if (!album) {
      throw new Error(getErrorMessage.collection('NOT_FOUND', id));
    }
    return parseAlbumJsonFields({
      ...album,
      coverImageUrl: this.computeCoverImageUrl(
        album.folderSlug,
        album.cover,
        album.id,
      ),
    });
  }

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

  /**
   * Computes coverImageUrl dynamically for albums.
   * - If cover is a relative path (starts with "img/"), compute from MEDIA_BASE_URL
   * - If cover is set but not a relative path, it's an uploaded cover - use cover endpoint
   * - If cover is null, fallback to default media folder cover (img/cover.webp)
   */
  private computeCoverImageUrl(
    folderSlug: string | null,
    cover: string | null,
    albumId?: number,
  ): string | null {
    // If cover is set and is a relative path from media folder
    if (cover?.startsWith('img/')) {
      if (!folderSlug) {
        return null;
      }
      const normalizedBaseUrl = env.mediaBaseUrl.replace(/\/+$/, '');
      return `${normalizedBaseUrl}/${folderSlug}/${cover}`;
    }

    // If cover is set but not a relative path, it's an uploaded cover
    // Use the cover endpoint to serve it
    if (cover && !cover.startsWith('img/') && albumId) {
      // For uploaded covers, use the API endpoint
      // For uploaded covers, construct API endpoint URL
      // Extract origin from mediaBaseUrl
      try {
        const url = new URL(env.mediaBaseUrl);
        return `${url.origin}/api/albums/${albumId}/cover`;
      } catch {
        // Fallback if mediaBaseUrl is not a full URL
        return `/api/albums/${albumId}/cover`;
      }
    }

    // Fallback: if cover is null but folderSlug exists, use default media folder cover
    if (!cover && folderSlug) {
      const normalizedBaseUrl = env.mediaBaseUrl.replace(/\/+$/, '');
      return `${normalizedBaseUrl}/${folderSlug}/img/cover.webp`;
    }

    return null;
  }

  async getAlbumWithSongs(id: number) {
    const album = await this.getAlbumById(id);
    const songs = await findSongsByAlbum(id);

    // Add computed audioUrl and format duration for each song
    const songsWithAudioUrl = songs.map((song) => ({
      ...song,
      position: song.position ?? null,
      audioUrl: this.computeAudioUrl(album.folderSlug, song.fileSlug),
      duration: formatDurationFromString(song.duration) || null,
    }));

    return { ...album, songs: songsWithAudioUrl };
  }

  async createAlbum(accountId: number, data: Omit<NewAlbumData, 'ownerId'>) {
    const albumData: NewAlbumData = {
      ...data,
      ownerId: accountId,
    };
    return createAlbum(albumData);
  }

  async updateAlbum(
    id: number,
    accountId: number,
    data: Partial<NewAlbumData>,
  ) {
    const album = await this.getAlbumById(id);
    await authService.requireOwnership(accountId, album.ownerId);
    await updateAlbum(id, data);
  }

  async deleteAlbum(id: number, accountId: number) {
    const album = await this.getAlbumById(id);
    await authService.requireOwnership(accountId, album.ownerId);

    // Delete uploaded cover file if it exists and is not from media folder
    if (
      album.cover &&
      !album.cover.startsWith('img/') &&
      existsSync(album.cover)
    ) {
      unlinkSync(album.cover);
    }

    await deleteAlbum(id);
  }

  async uploadCoverArt(albumId: number, accountId: number, file: File) {
    const album = await this.getAlbumById(albumId);
    await authService.requireOwnership(accountId, album.ownerId);

    const extension = file.name.split('.').pop() || 'jpg';
    const fileName = this.generateCoverFileName(albumId, extension);
    const filePath = join(this.coversDir, fileName);

    // Delete old uploaded cover file if it exists
    if (
      album.cover &&
      !album.cover.startsWith('img/') &&
      existsSync(album.cover)
    ) {
      unlinkSync(album.cover);
    }

    const buffer = await file.arrayBuffer();
    writeFileSync(filePath, new Uint8Array(buffer));

    // Save file path to cover field
    await updateAlbumCover(albumId, filePath);

    return {
      cover: filePath,
      fileName,
    };
  }

  async getCoverArt(albumId: number) {
    const album = await this.getAlbumById(albumId);

    // If cover is from media folder, we need to read from media root
    if (album.cover?.startsWith('img/')) {
      if (!album.folderSlug) {
        throw new Error('Cover art not found');
      }
      const coverPath = join(env.mediaRootPath, album.folderSlug, album.cover);
      if (!existsSync(coverPath)) {
        throw new Error('Cover art not found');
      }
      const buffer = readFileSync(coverPath);
      const extension = album.cover.split('.').pop() || 'webp';
      const mimeType = this.getMimeType(extension);
      return {
        buffer,
        mimeType,
        size: buffer.length,
      };
    }

    // If cover is an uploaded file path
    if (album.cover && !album.cover.startsWith('img/')) {
      if (!existsSync(album.cover)) {
        throw new Error('Cover art not found');
      }
      const buffer = readFileSync(album.cover);
      const extension = album.cover.split('.').pop() || 'jpg';
      const mimeType = this.getMimeType(extension);
      return {
        buffer,
        mimeType,
        size: buffer.length,
      };
    }

    throw new Error('Cover art not found');
  }

  /**
   * Lists all image files in the album folder (root and img/ subdirectory).
   * Only works for albums with folderSlug (media folder albums).
   */
  async listAlbumPhotos(albumId: number): Promise<string[]> {
    const album = await this.getAlbumById(albumId);
    if (!album.folderSlug) {
      return [];
    }
    const albumPath = join(env.mediaRootPath, album.folderSlug);
    if (!existsSync(albumPath) || !statSync(albumPath).isDirectory()) {
      return [];
    }
    const photos: string[] = [];
    photos.push(...this.collectImagesFromDir(albumPath, ''));
    photos.push(...this.collectImagesFromDir(join(albumPath, 'img'), 'img'));
    return photos.sort();
  }

  /**
   * Serves a specific photo from the album folder.
   * Filename must be a simple filename or img/filename (no path traversal).
   */
  async getAlbumPhoto(
    albumId: number,
    filename: string,
  ): Promise<{ buffer: Buffer; mimeType: string; size: number }> {
    if (filename.includes('..') || /^[\\/]/.test(filename)) {
      throw new Error('Invalid filename');
    }
    const album = await this.getAlbumById(albumId);
    if (!album.folderSlug) {
      throw new Error('Album has no media folder');
    }
    const albumDir = resolve(env.mediaRootPath, album.folderSlug);
    const photoPath = resolve(albumDir, filename);
    const rel = relative(albumDir, photoPath);
    if (rel.startsWith('..') || rel.includes('..')) {
      throw new Error('Invalid path');
    }
    if (!existsSync(photoPath) || !statSync(photoPath).isFile()) {
      throw new Error('Photo not found');
    }
    const buffer = readFileSync(photoPath);
    const extension = extname(filename).slice(1) || 'jpg';
    const mimeType = this.getMimeType(extension);
    return {
      buffer,
      mimeType,
      size: buffer.length,
    };
  }

  async checkAlbumAccess(
    album: { isPublic: boolean | number | null; ownerId: number },
    accountId?: number,
  ) {
    if (album.isPublic) {
      return true;
    }

    if (!accountId) {
      throw new Error(getErrorMessage.auth('UNAUTHORIZED'));
    }

    if (album.ownerId !== accountId) {
      throw new Error(getErrorMessage.auth('FORBIDDEN'));
    }

    return true;
  }
}

export const albumService = new AlbumService();
