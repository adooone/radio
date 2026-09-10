import type { Album } from '@radio/types';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:6870';

const api = axios.create({
  baseURL: API_URL,
});

type AlbumWithSongs = Album & {
  songs: Array<{
    id: number;
    albumId: number;
    audioFileId: number;
    trackNumber: number;
    title: string;
    artist: string | null;
    duration: string;
    format: string;
    createdAt: string;
  }>;
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

    const response = await api.get<{ success: boolean; data: Album[] }>(
      `/api/albums/public?${params.toString()}`,
    );
    return response.data.data;
  },

  getAlbumById: async (id: number): Promise<AlbumWithSongs> => {
    const response = await api.get<{ success: boolean; data: AlbumWithSongs }>(
      `/api/albums/${id}`,
    );
    return response.data.data;
  },

  getCoverArtUrl: (id: number): string => {
    return `${API_URL}/api/albums/${id}/cover`;
  },

  getAudioStreamUrl: (audioFileId: number): string => {
    return `${API_URL}/api/audio-files/${audioFileId}/stream`;
  },
};

export type { AlbumWithSongs };

