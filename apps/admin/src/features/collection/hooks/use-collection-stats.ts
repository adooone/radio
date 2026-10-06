import {
  calculateOverallCompleteness,
  extractGenresFromAlbums,
} from '@/features/collection/utils/album-helpers';
import type { Album } from '@radio/types';
import { useMemo } from 'react';

export const useCollectionStats = (albums: Album[] | undefined) => {
  const genreCounts = useMemo(() => {
    if (!albums) return new Map();
    return extractGenresFromAlbums(albums);
  }, [albums]);

  const overallCompleteness = useMemo(() => {
    if (!albums) return 0;
    return calculateOverallCompleteness(albums);
  }, [albums]);

  const lastUpdated = useMemo(() => {
    if (!albums || albums.length === 0) return undefined;
    const dates = albums.map((a) => new Date(a.updatedAt).getTime());
    const maxDate = Math.max(...dates);
    return new Date(maxDate).toISOString();
  }, [albums]);

  const publicCount = useMemo(
    () => albums?.filter((a) => a.isPublic).length || 0,
    [albums],
  );

  const getCompletenessVariant = (
    percentage: number,
  ): 'green' | 'yellow' | 'red' => {
    if (percentage > 80) return 'green';
    if (percentage >= 50) return 'yellow';
    return 'red';
  };

  return {
    genreCounts,
    overallCompleteness,
    lastUpdated,
    publicCount,
    totalCount: albums?.length || 0,
    getCompletenessVariant,
  };
};
