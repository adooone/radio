import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { SetOnAirData } from '../on-air-api';
import { onAirApi } from '../on-air-api';

export const onAirKeys = {
  all: ['on-air'] as const,
  current: () => [...onAirKeys.all, 'current'] as const,
  turntable: () => [...onAirKeys.all, 'turntable'] as const,
};

export const useOnAir = () => {
  return useQuery({
    queryKey: onAirKeys.current(),
    queryFn: onAirApi.getOnAir,
  });
};

/** Polled, so the track position moves while the record plays. */
export const useTurntable = () => {
  return useQuery({
    queryKey: onAirKeys.turntable(),
    queryFn: onAirApi.getTurntable,
    refetchInterval: 5000,
  });
};

export const useSetOnAir = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SetOnAirData) => onAirApi.setOnAir(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: onAirKeys.all });
    },
  });
};

export const useClearOnAir = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: onAirApi.clearOnAir,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: onAirKeys.all });
    },
  });
};

export const useStopTurntable = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: onAirApi.stopTurntable,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: onAirKeys.all });
    },
  });
};
