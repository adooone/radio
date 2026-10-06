import { useQuery } from '@tanstack/react-query';
import { albumApi } from '../album-api';

export const albumKeys = {
  all: ['albums'] as const,
  lists: () => [...albumKeys.all, 'list'] as const,
  list: (filters: string) => [...albumKeys.lists(), { filters }] as const,
  details: () => [...albumKeys.all, 'detail'] as const,
  detail: (id: number) => [...albumKeys.details(), id] as const,
  publicAlbums: () => [...albumKeys.all, 'public'] as const,
} as const;

export const usePublicAlbums = (
  filters?: {
    artist?: string;
    year?: number;
    tags?: string;
    search?: string;
  },
  limit = 50,
  offset = 0,
) => {
  return useQuery({
    queryKey: [...albumKeys.publicAlbums(), { filters, limit, offset }],
    queryFn: () => albumApi.getPublicAlbums(filters, limit, offset),
  });
};

export const useAlbum = (id: number) => {
  return useQuery({
    queryKey: albumKeys.detail(id),
    queryFn: () => albumApi.getAlbumById(id),
    enabled: !!id,
  });
};
