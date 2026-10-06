import type { StreamInfo } from '@radio/types';
import { useQuery } from '@tanstack/react-query';
import { radioApiClient } from '../clients/radio';

export const streamKeys = {
  all: ['stream'] as const,
  info: () => [...streamKeys.all, 'info'] as const,
  status: () => [...streamKeys.all, 'status'] as const,
} as const;

interface StreamStatus {
  isLive: boolean;
  listeners: number;
  bitrate: number;
  uptime: number;
  lastUpdate: string;
}

export const useStreamInfo = () => {
  return useQuery<StreamInfo>({
    queryKey: streamKeys.info(),
    queryFn: async () => {
      const { data } = await radioApiClient.get('/api/stream/info');
      return data;
    },
    refetchInterval: 30000, // Refetch every 30 seconds for live data
  });
};

export const useStreamStatus = () => {
  return useQuery<StreamStatus>({
    queryKey: streamKeys.status(),
    queryFn: async () => {
      const { data } = await radioApiClient.get('/api/stream/status');
      return data;
    },
    refetchInterval: 10000, // Refetch every 10 seconds for real-time status
  });
};
