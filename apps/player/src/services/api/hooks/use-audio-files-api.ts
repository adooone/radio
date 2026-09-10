import type { AudioFile, PaginatedResponse } from '@radio/types';
import { useQuery } from '@tanstack/react-query';
import { radioApiClient } from '../clients/radio';

export const audioFileKeys = {
  all: ['audio-files'] as const,
  lists: () => [...audioFileKeys.all, 'list'] as const,
  list: (page: number, limit: number) =>
    [...audioFileKeys.lists(), { page, limit }] as const,
  details: () => [...audioFileKeys.all, 'detail'] as const,
  detail: (id: string) => [...audioFileKeys.details(), id] as const,
} as const;

export const useAudioFiles = (page = 1, limit = 20) => {
  return useQuery<PaginatedResponse<AudioFile>>({
    queryKey: audioFileKeys.list(page, limit),
    queryFn: async () => {
      const { data } = await radioApiClient.get('/api/audio/files', {
        params: { page, limit },
      });
      return data;
    },
  });
};

export const useAudioFile = (id: string) => {
  return useQuery<AudioFile>({
    queryKey: audioFileKeys.detail(id),
    queryFn: async () => {
      const { data } = await radioApiClient.get(`/api/audio/files/${id}`);
      return data;
    },
    enabled: !!id,
  });
};
