import type { RtmpServerConfig, TelegramStreamConfig } from '@radio/types';
import {
  type UseQueryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { streamControlApi } from '../stream-control-api';

// Telegram Stream Hooks
export const useTelegramConfig = (
  options?: Omit<UseQueryOptions<TelegramStreamConfig>, 'queryKey' | 'queryFn'>,
) => {
  return useQuery({
    queryKey: ['stream', 'telegram', 'config'],
    queryFn: streamControlApi.telegram.getConfig,
    staleTime: 30000, // Config doesn't change often
    ...options,
  });
};

export const useStartTelegramStream = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: streamControlApi.telegram.start,
    onSuccess: () => {
      // Invalidate and immediately refetch monitoring data
      queryClient.invalidateQueries({ queryKey: ['monitoring', 'data'] });
      queryClient.refetchQueries({ queryKey: ['monitoring', 'data'] });
    },
  });
};

export const useStopTelegramStream = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: streamControlApi.telegram.stop,
    onSuccess: () => {
      // Invalidate and immediately refetch monitoring data
      queryClient.invalidateQueries({ queryKey: ['monitoring', 'data'] });
      queryClient.refetchQueries({ queryKey: ['monitoring', 'data'] });
    },
  });
};

export const useRestartTelegramStream = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: streamControlApi.telegram.restart,
    onSuccess: () => {
      // Invalidate and immediately refetch monitoring data
      queryClient.invalidateQueries({ queryKey: ['monitoring', 'data'] });
      queryClient.refetchQueries({ queryKey: ['monitoring', 'data'] });
    },
  });
};

export const useUpdateTelegramConfig = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (config: Partial<TelegramStreamConfig>) =>
      streamControlApi.telegram.updateConfig(config),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['stream', 'telegram', 'config'],
      });
    },
  });
};

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
