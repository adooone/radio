import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { SetOnAirData } from '../on-air-api';
import { onAirApi } from '../on-air-api';

export const onAirKeys = {
  all: ['on-air'] as const,
  current: () => [...onAirKeys.all, 'current'] as const,
};

export const useOnAir = () => {
  return useQuery({
    queryKey: onAirKeys.current(),
    queryFn: onAirApi.getOnAir,
  });
};

export const useSetOnAir = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SetOnAirData) => onAirApi.setOnAir(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: onAirKeys.current() });
    },
  });
};

export const useClearOnAir = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: onAirApi.clearOnAir,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: onAirKeys.current() });
    },
  });
};
