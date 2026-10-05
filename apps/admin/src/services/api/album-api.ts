import type { Album, Song } from '@radio/types';
import { waveApiClient } from './clients/http-client';

type ApiResponse<T> = {
  success: boolean;
  data: T;
  message?: string;
};

type CreateAlbumData = {
  title: string;
  artist: string;
  year?: number;
  description?: string;
  tags?: string;
  isPublic?: boolean;
  isPublished?: boolean;
  releaseYear?: number;
  rpmSpeed?: string;
  vinylCondition?: string;
  digitizationDate?: string;
  equipmentUsed?: string;
};

type AlbumWithSongs = Album & {
  songs: (Song & {
    audioFilePath?: string;
    audioFileName?: string;
  })[];
};

type CreateSongData = {
  audioFileId: number;
  trackNumber: number;
  title: string;
  artist?: string;
};

export type SyncMediaResult = {
  albumsCreated: number;
  albumsUpdated: number;
  albumsMarkedOffline: number;
  tracksCreated: number;
  tracksUpdated: number;
  errors: string[];
};

export const albumApi = {
  getPublicAlbums: async (
    filters?: {
      artist?: string;
      year?: number;
      tags?: string;
      search?: string;
    },
    limit = 50,
    offset = 0,
  ): Promise<Album[]> => {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
    });

    if (filters?.artist) params.append('artist', filters.artist);
    if (filters?.year) params.append('year', filters.year.toString());
    if (filters?.tags) params.append('tags', filters.tags);
    if (filters?.search) params.append('search', filters.search);

    const response = await waveApiClient.get<ApiResponse<Album[]>>(
      `/api/albums/public?${params.toString()}`,
    );
    return response.data.data;
  },

  getUserAlbums: async (limit = 50, offset = 0): Promise<Album[]> => {
    const response = await waveApiClient.get<ApiResponse<Album[]>>(
      `/api/albums/my?limit=${limit}&offset=${offset}`,
    );
    return response.data.data;
  },

  getAlbumById: async (id: number): Promise<AlbumWithSongs> => {
    const response = await waveApiClient.get<ApiResponse<AlbumWithSongs>>(
      `/api/albums/${id}`,
    );
    return response.data.data;
  },

  createAlbum: async (data: CreateAlbumData): Promise<{ id: number }> => {
    const response = await waveApiClient.post<ApiResponse<{ id: number }>>(
      '/api/albums',
      data,
    );
    return response.data.data;
  },

  updateAlbum: async (
    id: number,
    data: Partial<CreateAlbumData>,
  ): Promise<void> => {
    await waveApiClient.put<ApiResponse<void>>(`/api/albums/${id}`, data);
  },

  deleteAlbum: async (id: number): Promise<void> => {
    await waveApiClient.delete<ApiResponse<void>>(`/api/albums/${id}`);
  },

  uploadCoverArt: async (
    id: number,
    file: File,
  ): Promise<{ cover: string; fileName: string }> => {
    const formData = new FormData();
    formData.append('cover', file);

    const response = await waveApiClient.post<
      ApiResponse<{ cover: string; fileName: string }>
    >(`/api/albums/${id}/cover`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  },

  getCoverArtUrl: (id: number): string => {
    return `${waveApiClient.defaults.baseURL}/api/albums/${id}/cover`;
  },

  getAlbumPhotos: async (id: number): Promise<string[]> => {
    const response = await waveApiClient.get<ApiResponse<{ photos: string[] }>>(
      `/api/albums/${id}/photos`,
    );
    return response.data.data.photos;
  },

  getAlbumPhoto: async (id: number, filename: string): Promise<Blob> => {
    const response = await waveApiClient.get(
      `/api/albums/${id}/photos/${encodeURIComponent(filename)}`,
      { responseType: 'blob' },
    );
    return response.data as Blob;
  },

  addSongToAlbum: async (
    albumId: number,
    data: CreateSongData,
  ): Promise<{ id: number }> => {
    const response = await waveApiClient.post<ApiResponse<{ id: number }>>(
      `/api/albums/${albumId}/songs`,
      data,
    );
    return response.data.data;
  },

  updateSong: async (
    id: number,
    data: Partial<Omit<CreateSongData, 'audioFileId'>>,
  ): Promise<void> => {
    await waveApiClient.put<ApiResponse<void>>(`/api/albums/songs/${id}`, data);
  },

  deleteSong: async (id: number): Promise<void> => {
    await waveApiClient.delete<ApiResponse<void>>(`/api/albums/songs/${id}`);
  },

  reorderSongs: async (
    albumId: number,
    songs: Array<{ id: number; trackNumber: number }>,
  ): Promise<void> => {
    await waveApiClient.put<ApiResponse<void>>(
      `/api/albums/${albumId}/songs/reorder`,
      { songs },
    );
  },

  syncMedia: async (baseDir?: string): Promise<SyncMediaResult> => {
    const response = await waveApiClient.post<ApiResponse<SyncMediaResult>>(
      '/api/albums/sync-media',
      baseDir ? { baseDir } : {},
    );
    return response.data.data;
  },
};

export type { CreateAlbumData, AlbumWithSongs, CreateSongData };
