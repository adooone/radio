import {
  usePublicAlbums,
  useUserAlbums,
  useUserCollections,
} from '@/services/api';
import { useMemo } from 'react';
import { useCollectionStats } from './use-collection-stats';

type AlbumsQuery = ReturnType<typeof useUserAlbums>;
type CollectionsQuery = ReturnType<typeof useUserCollections>;

type CollectionSummary = {
  totalCount: number;
  publicCount: number;
  lastUpdated?: string;
};

type CollectionData = {
  albums: AlbumsQuery['data'];
  albumsLoading: boolean;
  albumsError: AlbumsQuery['error'];
  collections: CollectionsQuery['data'];
  collectionsLoading: boolean;
  collectionsError: CollectionsQuery['error'];
  refetchAlbums: AlbumsQuery['refetch'];
  albumStats: ReturnType<typeof useCollectionStats>;
  playlistSummary: CollectionSummary;
};

const getLatestUpdate = (items: { updatedAt: string }[]) => {
  if (items.length === 0) return undefined;
  const latest = Math.max(
    ...items.map((item) => new Date(item.updatedAt).getTime()),
  );
  return new Date(latest).toISOString();
};

export const useCollectionData = (): CollectionData => {
  const {
    data: collections,
    isLoading: collectionsLoading,
    error: collectionsError,
  } = useUserCollections();

  const {
    data: userAlbums,
    isLoading: albumsLoading,
    isFetching: albumsFetching,
    error: albumsError,
    refetch: refetchAlbums,
  } = useUserAlbums();

  const { data: publicAlbums } = usePublicAlbums(undefined, 50, 0, {
    enabled:
      !albumsLoading &&
      !albumsFetching &&
      (!userAlbums || userAlbums.length === 0),
  });

  const albums =
    userAlbums && userAlbums.length > 0
      ? userAlbums
      : (publicAlbums ?? userAlbums ?? undefined);

  const albumStats = useCollectionStats(albums);

  const playlistSummary = useMemo<CollectionSummary>(() => {
    const list = collections ?? [];
    const publicCount = list.filter((item) => item.isPublic).length;
    const lastUpdated = list.length > 0 ? getLatestUpdate(list) : undefined;
    return {
      totalCount: list.length,
      publicCount,
      lastUpdated,
    };
  }, [collections]);

  return {
    albums,
    albumsLoading: albumsLoading || albumsFetching,
    albumsError,
    collections,
    collectionsLoading,
    collectionsError,
    refetchAlbums,
    albumStats,
    playlistSummary,
  };
};
