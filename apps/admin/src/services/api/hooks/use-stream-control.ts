import type { RtmpServerConfig } from '@radio/types';
import {
  type UseQueryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { streamControlApi } from '../stream-control-api';

// RTMP Server Hooks
export const useStartRtmpServer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: streamControlApi.rtmp.start,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['monitoring', 'data'] });
    },
  });
};

export const useStopRtmpServer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: streamControlApi.rtmp.stop,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['monitoring', 'data'] });
    },
  });
};

export const useRestartRtmpServer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: streamControlApi.rtmp.restart,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['monitoring', 'data'] });
    },
  });
};

// RTMP Configuration Hooks
export const useRtmpConfig = (
  options?: Omit<UseQueryOptions<RtmpServerConfig>, 'queryKey' | 'queryFn'>,
) => {
  return useQuery({
    queryKey: ['stream', 'rtmp', 'config'],
    queryFn: streamControlApi.rtmp.getConfig,
    staleTime: 30000, // Config doesn't change often
    ...options,
  });
};

export const useUpdateRtmpConfig = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (config: Partial<RtmpServerConfig>) =>
      streamControlApi.rtmp.updateConfig(config),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['stream', 'rtmp', 'config'],
      });
    },
  });
};
