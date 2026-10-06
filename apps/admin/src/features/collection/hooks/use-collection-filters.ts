import type { AlbumFilters } from '@/features/collection/utils/album-helpers';
import { useMemo } from 'react';

export const useCollectionFilters = (filters: AlbumFilters) => {
  const hasActiveFilters = useMemo(
    () =>
      Boolean(
        filters.yearMin ||
          filters.yearMax ||
          filters.artist ||
          (filters.genres && filters.genres.length > 0) ||
          filters.trackCountMin ||
          filters.trackCountMax,
      ),
    [filters],
  );

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.yearMin || filters.yearMax) count++;
    if (filters.artist) count++;
    if (filters.genres && filters.genres.length > 0)
      count += filters.genres.length;
    if (filters.trackCountMin || filters.trackCountMax) count++;
    return count;
  }, [filters]);

  return {
    hasActiveFilters,
    activeFilterCount,
  };
};
