import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { albumApi } from '../album-api';

export const albumKeys = {
  all: ['albums'] as const,
  lists: () => [...albumKeys.all, 'list'] as const,
  list: (filters: string) => [...albumKeys.lists(), { filters }] as const,
  details: () => [...albumKeys.all, 'detail'] as const,
  detail: (id: number) => [...albumKeys.details(), id] as const,
  userAlbums: () => [...albumKeys.all, 'user'] as const,
  publicAlbums: () => [...albumKeys.all, 'public'] as const,
};

export const usePublicAlbums = (
  filters?: {
    artist?: string;
    year?: number;
    tags?: string;
    search?: string;
  },
  limit = 50,
  offset = 0,
  options?: { enabled?: boolean },
) => {
  return useQuery({
    queryKey: [...albumKeys.publicAlbums(), { filters, limit, offset }],
    queryFn: () => albumApi.getPublicAlbums(filters, limit, offset),
    ...options,
  });
};

export const useUserAlbums = (limit = 50, offset = 0) => {
  return useQuery({
    queryKey: [...albumKeys.userAlbums(), { limit, offset }],
    queryFn: () => albumApi.getUserAlbums(limit, offset),
  });
};

export const useAlbum = (id: number) => {
  return useQuery({
    queryKey: albumKeys.detail(id),
    queryFn: () => albumApi.getAlbumById(id),
    enabled: !!id,
  });
};

export const albumPhotosKeys = {
  all: ['album-photos'] as const,
  list: (albumId: number) => [...albumPhotosKeys.all, albumId] as const,
};

export const useAlbumPhotos = (
  albumId: number,
  options?: { enabled?: boolean },
) => {
  return useQuery({
    queryKey: albumPhotosKeys.list(albumId),
    queryFn: () => albumApi.getAlbumPhotos(albumId),
    enabled: !!albumId && (options?.enabled ?? true),
  });
};

export const useCreateAlbum = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: albumApi.createAlbum,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: albumKeys.userAlbums() });
      queryClient.invalidateQueries({ queryKey: albumKeys.publicAlbums() });
    },
  });
};

export const useUpdateAlbum = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: { id: number; data: Parameters<typeof albumApi.updateAlbum>[1] }) =>
      albumApi.updateAlbum(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: albumKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: albumKeys.userAlbums() });
      queryClient.invalidateQueries({ queryKey: albumKeys.publicAlbums() });
    },
  });
};

export const useDeleteAlbum = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: albumApi.deleteAlbum,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: albumKeys.userAlbums() });
      queryClient.invalidateQueries({ queryKey: albumKeys.publicAlbums() });
    },
  });
};

export const useUploadCoverArt = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, file }: { id: number; file: File }) =>
      albumApi.uploadCoverArt(id, file),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: albumKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: albumKeys.userAlbums() });
    },
  });
};

export const useAddSongToAlbum = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      albumId,
      data,
    }: {
      albumId: number;
      data: Parameters<typeof albumApi.addSongToAlbum>[1];
    }) => albumApi.addSongToAlbum(albumId, data),
    onSuccess: (_, { albumId }) => {
      queryClient.invalidateQueries({ queryKey: albumKeys.detail(albumId) });
    },
  });
};

export const useUpdateSong = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: Parameters<typeof albumApi.updateSong>[1];
    }) => albumApi.updateSong(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: albumKeys.all });
    },
  });
};

export const useDeleteSong = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: albumApi.deleteSong,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: albumKeys.all });
    },
  });
};

export const useReorderSongs = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      albumId,
      songs,
    }: {
      albumId: number;
      songs: Array<{ id: number; trackNumber: number }>;
    }) => albumApi.reorderSongs(albumId, songs),
    onSuccess: (_, { albumId }) => {
      queryClient.invalidateQueries({ queryKey: albumKeys.detail(albumId) });
    },
  });
};

export const useSyncMedia = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (baseDir?: string) => albumApi.syncMedia(baseDir),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: albumKeys.userAlbums() });
      queryClient.invalidateQueries({ queryKey: albumKeys.publicAlbums() });
    },
  });
};

export const useTogglePublished = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isPublished }: { id: number; isPublished: boolean }) =>
      albumApi.updateAlbum(id, { isPublic: isPublished }),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: albumKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: albumKeys.userAlbums() });
      queryClient.invalidateQueries({ queryKey: albumKeys.publicAlbums() });
    },
  });
};
