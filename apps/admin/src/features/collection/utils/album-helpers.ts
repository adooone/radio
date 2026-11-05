import type { Album } from '@radio/types';

export type SortField =
  | 'dateAdded'
  | 'title'
  | 'artist'
  | 'year'
  | 'trackCount';
export type SortOrder = 'asc' | 'desc';

export type AlbumFilters = {
  yearMin?: number;
  yearMax?: number;
  genres?: string[];
  artist?: string;
  trackCountMin?: number;
  trackCountMax?: number;
};

const COMPLETENESS_FIELDS = 7;

export const calculateAlbumCompleteness = (album: Album): number => {
  let filledFields = 2;

  if (album.year) filledFields++;
  if (album.description) filledFields++;
  if (album.tags) filledFields++;
  if (album.cover) filledFields++;
  if (album.songCount && album.songCount > 0) filledFields++;

  return Math.round((filledFields / COMPLETENESS_FIELDS) * 100);
};

export const calculateOverallCompleteness = (albums: Album[]): number => {
  if (!albums || albums.length === 0) return 0;

  const total = albums.reduce(
    (sum, album) => sum + calculateAlbumCompleteness(album),
    0,
  );

  return Math.round(total / albums.length);
};

export const extractGenresFromAlbums = (
  albums: Album[],
): Map<string, number> => {
  const genreCounts = new Map<string, number>();

  for (const album of albums) {
    if (album.tags) {
      try {
        const tags = JSON.parse(album.tags);
        if (Array.isArray(tags)) {
          for (const tag of tags) {
            genreCounts.set(tag, (genreCounts.get(tag) || 0) + 1);
          }
        }
      } catch {
        // ignore
      }
    }
  }

  return genreCounts;
};

export const filterAlbums = (
  albums: Album[],
  filters: AlbumFilters,
  searchQuery: string,
): Album[] => {
  return albums.filter((album) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesTitle = album.title.toLowerCase().includes(query);
      const matchesArtist = album.artist.toLowerCase().includes(query);
      if (!matchesTitle && !matchesArtist) return false;
    }

    if (filters.yearMin && album.year && album.year < filters.yearMin) {
      return false;
    }

    if (filters.yearMax && album.year && album.year > filters.yearMax) {
      return false;
    }

    if (filters.genres && filters.genres.length > 0) {
      if (!album.tags) return false;
      try {
        const albumTags = JSON.parse(album.tags);
        const hasMatchingGenre = filters.genres.some((genre) =>
          albumTags.includes(genre),
        );
        if (!hasMatchingGenre) return false;
      } catch {
        return false;
      }
    }

    if (filters.artist && album.artist !== filters.artist) {
      return false;
    }

    if (
      filters.trackCountMin &&
      (!album.songCount || album.songCount < filters.trackCountMin)
    ) {
      return false;
    }

    if (
      filters.trackCountMax &&
      album.songCount &&
      album.songCount > filters.trackCountMax
    ) {
      return false;
    }

    return true;
  });
};

export const sortAlbums = (
  albums: Album[],
  sortBy: SortField,
  order: SortOrder,
): Album[] => {
  const sorted = [...albums];

  sorted.sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case 'dateAdded':
        comparison =
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        break;
      case 'title':
        comparison = a.title.localeCompare(b.title);
        break;
      case 'artist':
        comparison = a.artist.localeCompare(b.artist);
        break;
      case 'year':
        comparison = (a.year || 0) - (b.year || 0);
        break;
      case 'trackCount':
        comparison = (a.songCount || 0) - (b.songCount || 0);
        break;
    }

    return order === 'asc' ? comparison : -comparison;
  });

  return sorted;
};
