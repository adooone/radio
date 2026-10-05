import type {
  RtmpServerConfig,
  StreamControlResponse,
  TelegramStreamConfig,
} from '@radio/types';
import { waveApiClient } from './clients/http-client';

export const streamControlApi = {
  // Telegram Stream Control
  telegram: {
    start: async (): Promise<StreamControlResponse> => {
      const response = await waveApiClient.post<{
        success: boolean;
        data: StreamControlResponse;
      }>('/api/stream/telegram/start');
      return response.data.data;
    },

    stop: async (): Promise<StreamControlResponse> => {
      const response = await waveApiClient.post<{
        success: boolean;
        data: StreamControlResponse;
      }>('/api/stream/telegram/stop');
      return response.data.data;
    },

    restart: async (): Promise<StreamControlResponse> => {
      const response = await waveApiClient.post<{
        success: boolean;
        data: StreamControlResponse;
      }>('/api/stream/telegram/restart');
      return response.data.data;
    },

    getConfig: async (): Promise<TelegramStreamConfig> => {
      const response = await waveApiClient.get<{
        success: boolean;
        data: { config: TelegramStreamConfig };
      }>('/api/stream/telegram/config');

      if (!response.data.success || !response.data.data?.config) {
        throw new Error('Failed to fetch Telegram config');
      }

      return response.data.data.config;
    },

    updateConfig: async (
      config: Partial<TelegramStreamConfig>,
    ): Promise<StreamControlResponse> => {
      const response = await waveApiClient.put<{
        success: boolean;
        data: StreamControlResponse;
      }>('/api/stream/telegram/config', config);
      return response.data.data;
    },
  },

  // RTMP Server Control
  rtmp: {
    start: async (): Promise<StreamControlResponse> => {
      const response = await waveApiClient.post<{
        success: boolean;
        data: StreamControlResponse;
      }>('/api/stream/rtmp/start');
      return response.data.data;
    },

    stop: async (): Promise<StreamControlResponse> => {
      const response = await waveApiClient.post<{
        success: boolean;
        data: StreamControlResponse;
      }>('/api/stream/rtmp/stop');
      return response.data.data;
    },

    restart: async (): Promise<StreamControlResponse> => {
      const response = await waveApiClient.post<{
        success: boolean;
        data: StreamControlResponse;
      }>('/api/stream/rtmp/restart');
      return response.data.data;
    },

    getConfig: async (): Promise<RtmpServerConfig> => {
      const response = await waveApiClient.get<{
        success: boolean;
        data: { config: RtmpServerConfig };
      }>('/api/stream/rtmp/config');

      if (!response.data.success || !response.data.data?.config) {
        throw new Error('Failed to fetch RTMP config');
      }

      return response.data.data.config;
    },

    updateConfig: async (
      config: Partial<RtmpServerConfig>,
    ): Promise<StreamControlResponse> => {
      const response = await waveApiClient.put<{
        success: boolean;
        data: StreamControlResponse;
      }>('/api/stream/rtmp/config', config);
      return response.data.data;
    },
  },
};
