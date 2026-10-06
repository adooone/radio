import type { ApiResponse, LogData, MonitoringData } from '@radio/types';
import { waveApiClient } from './clients/http-client';

export const monitoringApi = {
  getMonitoringData: async (): Promise<MonitoringData> => {
    const response =
      await waveApiClient.get<ApiResponse<MonitoringData>>('/api/monitoring');

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to fetch monitoring data');
    }

    return response.data.data;
  },

  getLogs: async (source = 'all', lines = 100): Promise<LogData> => {
    const response = await waveApiClient.get<ApiResponse<LogData>>(
      `/api/monitoring/logs?source=${source}&lines=${lines}`,
    );

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to fetch logs');
    }

    return response.data.data;
  },

  getServiceLogs: async (service: string, lines = 100): Promise<LogData> => {
    const response = await waveApiClient.get<ApiResponse<LogData>>(
      `/api/monitoring/logs/${service}?lines=${lines}`,
    );

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to fetch service logs');
    }

    return response.data.data;
  },
};
