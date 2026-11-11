import type { OnAirState, RotationState, TurntableState } from '@radio/types';
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

  getTurntable: async (): Promise<TurntableState> => {
    const response = await waveApiClient.get<ApiResponse<TurntableState>>(
      '/api/stream/turntable',
    );
    return response.data.data;
  },

  /** Stops the sound; the record stays marked on air. */
  stopTurntable: async (): Promise<void> => {
    await waveApiClient.delete<ApiResponse<void>>('/api/stream/turntable');
  },

  getRotation: async (): Promise<RotationState> => {
    const response = await waveApiClient.get<ApiResponse<RotationState>>(
      '/api/stream/rotation',
    );
    return response.data.data;
  },

  /** The station's shuffle on or off. */
  setRotation: async (enabled: boolean): Promise<RotationState> => {
    const response = await waveApiClient.put<ApiResponse<RotationState>>(
      '/api/stream/rotation',
      { enabled },
    );
    return response.data.data;
  },

  skipRotation: async (): Promise<RotationState> => {
    const response = await waveApiClient.post<ApiResponse<RotationState>>(
      '/api/stream/rotation/skip',
    );
    return response.data.data;
  },

  /** Plays the song after the current track. */
  playNext: async (songId: number): Promise<RotationState> => {
    const response = await waveApiClient.post<ApiResponse<RotationState>>(
      '/api/stream/rotation/next',
      { songId },
    );
    return response.data.data;
  },
};

export type { SetOnAirData };
