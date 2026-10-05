import type { ApiResponse } from '@radio/types';
import { waveApiClient } from './clients/http-client';

export interface StatsResponse {
  totals: {
    albums: number;
    tracks: number;
    totalDuration: number; // in seconds
  };
  extremes: {
    longestTrack: { title: string; duration: string } | null;
    shortestTrack: { title: string; duration: string } | null;
  };
  vinylStats: {
    byRpmSpeed: Array<{ rpmSpeed: string; count: number }>;
    byCondition: Array<{ condition: string; count: number }>;
    byDecade: Array<{ decade: number; count: number }>;
  };
  health: {
    published: number;
    unpublished: number;
    missingCover: number;
    missingReleaseYear: number;
    missingEquipment: number;
  };
  recent: Array<{
    id: number;
    title: string;
    artist: string;
    digitizationDate: string | null;
    createdAt: string | null;
  }>;
}

export const statsApi = {
  getStats: async (): Promise<StatsResponse> => {
    const response =
      await waveApiClient.get<ApiResponse<StatsResponse>>('/api/admin/stats');

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to fetch stats');
    }

    return response.data.data;
  },
};
