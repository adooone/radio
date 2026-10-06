import type { Album } from '@radio/types';
import { useState } from 'react';

type FilterBarProps = {
  filters: {
    search: string;
    artist: string;
    year: number | undefined;
    tags: string[];
    sortBy: 'date' | 'artist' | 'year' | 'title';
  };
  onFiltersChange: (filters: FilterBarProps['filters']) => void;
  albums: Album[];
};

const PREDEFINED_TAGS = [
  'Rock',
  'Pop',
  'Jazz',
  'Classical',
  'Electronic',
  'Hip-Hop',
  'Folk',
  'Blues',
  'Metal',
  'Indie',
];

export const FilterBar = ({
  filters,
  onFiltersChange,
  albums,
}: FilterBarProps) => {
  const [showFilters, setShowFilters] = useState(false);

  const uniqueArtists = Array.from(new Set(albums.map((a) => a.artist))).sort();

  const uniqueYears = Array.from(
    new Set(albums.map((a) => a.year).filter((y): y is number => y !== null)),
  ).sort((a, b) => b - a);

  const toggleTag = (tag: string) => {
    const newTags = filters.tags.includes(tag)
      ? filters.tags.filter((t) => t !== tag)
      : [...filters.tags, tag];
    onFiltersChange({ ...filters, tags: newTags });
  };

  return (
    <div className="bg-neutral-800/70 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-neutral-700/50">
      <div className="flex flex-col md:flex-row gap-4">
        <input
          type="text"
          placeholder="Search albums or artists..."
          value={filters.search}
          onChange={(e) =>
            onFiltersChange({ ...filters, search: e.target.value })
          }
          className="flex-1 px-4 py-3 border border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-500 bg-neutral-900/90 text-neutral-100 placeholder-neutral-400"
        />

        <button
          type="button"
          onClick={() => setShowFilters(!showFilters)}
          className="px-6 py-3 bg-neutral-700 text-neutral-200 rounded-lg hover:bg-neutral-600 transition-colors font-medium"
        >
          {showFilters ? 'Hide Filters' : 'Show Filters'}
        </button>

        <select
          value={filters.sortBy}
          onChange={(e) =>
            onFiltersChange({
              ...filters,
              sortBy: e.target.value as typeof filters.sortBy,
            })
          }
          className="px-4 py-3 border border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-500 bg-neutral-900/90 text-neutral-100"
        >
          <option value="date">Newest First</option>
          <option value="artist">Artist A-Z</option>
          <option value="year">Year (Newest)</option>
          <option value="title">Title A-Z</option>
        </select>
      </div>

      {showFilters && (
        <div className="mt-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="filter-artist"
                className="block text-sm font-medium text-neutral-300 mb-2"
              >
                Artist
              </label>
              <select
                id="filter-artist"
                value={filters.artist}
                onChange={(e) =>
                  onFiltersChange({ ...filters, artist: e.target.value })
                }
                className="w-full px-4 py-2 border border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-500 bg-neutral-900/90 text-neutral-100"
              >
                <option value="">All Artists</option>
                {uniqueArtists.map((artist) => (
                  <option key={artist} value={artist}>
                    {artist}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="filter-year"
                className="block text-sm font-medium text-neutral-300 mb-2"
              >
                Year
              </label>
              <select
                id="filter-year"
                value={filters.year || ''}
                onChange={(e) =>
                  onFiltersChange({
                    ...filters,
                    year: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
                className="w-full px-4 py-2 border border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-500 bg-neutral-900/90 text-neutral-100"
              >
                <option value="">All Years</option>
                {uniqueYears.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <span className="block text-sm font-medium text-neutral-300 mb-2">
              Genres
            </span>
            <div className="flex flex-wrap gap-2">
              {PREDEFINED_TAGS.map((tag) => (
                <button
                  type="button"
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    filters.tags.includes(tag)
                      ? 'bg-neutral-600 text-neutral-100'
                      : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {(filters.search ||
            filters.artist ||
            filters.year ||
            filters.tags.length > 0) && (
            <button
              type="button"
              onClick={() =>
                onFiltersChange({
                  search: '',
                  artist: '',
                  year: undefined,
                  tags: [],
                  sortBy: filters.sortBy,
                })
              }
              className="text-sm text-neutral-400 hover:text-neutral-200 font-medium"
            >
              Clear all filters
            </button>
          )}
        </div>
      )}
    </div>
  );
};
