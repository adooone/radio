import type { OnAirState } from '@radio/types';
import { waveApiClient } from './clients/http-client';

type ApiResponse<T> = {
  success: boolean;
  data: T;
};

type SetOnAirData = {
  albumId: number;
  songId?: number;
};

export const onAirApi = {
  getOnAir: async (): Promise<OnAirState | null> => {
    const response =
      await waveApiClient.get<ApiResponse<OnAirState | null>>(
        '/api/stream/on-air',
      );
    return response.data.data;
  },

  setOnAir: async (data: SetOnAirData): Promise<OnAirState> => {
    const response = await waveApiClient.put<ApiResponse<OnAirState>>(
      '/api/stream/on-air',
      data,
    );
    return response.data.data;
  },

  clearOnAir: async (): Promise<void> => {
    await waveApiClient.delete<ApiResponse<void>>('/api/stream/on-air');
  },
};

export type { SetOnAirData };
