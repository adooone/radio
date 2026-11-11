import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { SetOnAirData } from '../on-air-api';
import { onAirApi } from '../on-air-api';

export const onAirKeys = {
  all: ['on-air'] as const,
  current: () => [...onAirKeys.all, 'current'] as const,
  turntable: () => [...onAirKeys.all, 'turntable'] as const,
  rotation: () => [...onAirKeys.all, 'rotation'] as const,
};

export const useOnAir = () => {
  return useQuery({
    queryKey: onAirKeys.current(),
    queryFn: onAirApi.getOnAir,
    refetchInterval: 10000,
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

/** The station's shuffle: on / off, what comes next. Polled like the turntable. */
export const useRotation = () => {
  return useQuery({
    queryKey: onAirKeys.rotation(),
    queryFn: onAirApi.getRotation,
    refetchInterval: 5000,
  });
};

const useOnAirMutation = <T>(mutationFn: (arg: T) => Promise<unknown>) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: onAirKeys.all });
    },
  });
};

export const useSetRotation = () =>
  useOnAirMutation((enabled: boolean) => onAirApi.setRotation(enabled));

export const useSkipRotation = () =>
  useOnAirMutation<void>(() => onAirApi.skipRotation());

export const usePlayNext = () =>
  useOnAirMutation((songId: number) => onAirApi.playNext(songId));
