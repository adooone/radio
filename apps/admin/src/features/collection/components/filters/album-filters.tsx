import type {
  AlbumFilters,
  SortField,
  SortOrder,
} from '@/features/collection/utils/album-helpers';
import type { Album } from '@radio/types';

type AlbumFiltersProps = {
  albums: Album[];
  filters: AlbumFilters;
  onFiltersChange: (filters: AlbumFilters) => void;
  sortBy: SortField;
  sortOrder: SortOrder;
  onSortChange: (sortBy: SortField, sortOrder: SortOrder) => void;
};

export const AlbumFiltersComponent = ({
  albums,
  filters,
  onFiltersChange,
  sortBy,
  sortOrder,
  onSortChange,
}: AlbumFiltersProps) => {
  const availableYears = Array.from(
    new Set(albums.map((a) => a.year).filter((y): y is number => y !== null)),
  ).sort((a, b) => a - b);

  const availableArtists = Array.from(
    new Set(albums.map((a) => a.artist)),
  ).sort();

  const handleReset = () => {
    onFiltersChange({});
    onSortChange('dateAdded', 'desc');
  };

  const hasActiveFilters =
    filters.yearMin ||
    filters.yearMax ||
    filters.artist ||
    (filters.genres && filters.genres.length > 0) ||
    filters.trackCountMin ||
    filters.trackCountMax;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide">
          Фільтри
        </h3>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleReset}
            className="text-xs text-gray-400 hover:text-gray-300 transition-colors"
          >
            Скинути
          </button>
        )}
      </div>

      <div className="space-y-3">
        <div className="space-y-2">
          <label htmlFor="artist-filter" className="text-xs text-gray-400">
            Виконавець
          </label>
          <select
            id="artist-filter"
            value={filters.artist || ''}
            onChange={(e) =>
              onFiltersChange({
                ...filters,
                artist: e.target.value || undefined,
              })
            }
            className="w-full px-3 py-1.5 bg-gray-800/50 border border-gray-700 rounded text-sm text-gray-200 focus:outline-none focus:border-gray-600"
          >
            <option value="">Всі</option>
            {availableArtists.map((artist) => (
              <option key={artist} value={artist}>
                {artist}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label htmlFor="year-min-filter" className="text-xs text-gray-400">
            Рік
          </label>
          <div className="grid grid-cols-2 gap-2">
            <select
              id="year-min-filter"
              value={filters.yearMin || ''}
              onChange={(e) =>
                onFiltersChange({
                  ...filters,
                  yearMin: e.target.value ? Number(e.target.value) : undefined,
                })
              }
              className="w-full px-3 py-1.5 bg-gray-800/50 border border-gray-700 rounded text-sm text-gray-200 focus:outline-none focus:border-gray-600"
            >
              <option value="">Від</option>
              {availableYears.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
            <select
              value={filters.yearMax || ''}
              onChange={(e) =>
                onFiltersChange({
                  ...filters,
                  yearMax: e.target.value ? Number(e.target.value) : undefined,
                })
              }
              className="w-full px-3 py-3 bg-gray-800/50 border border-gray-700 rounded text-sm text-gray-200 focus:outline-none focus:border-gray-600"
            >
              <option value="">До</option>
              {availableYears.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="track-count-min" className="text-xs text-gray-400">
            Кількість треків
          </label>
          <div className="grid grid-cols-2 gap-2">
            <input
              id="track-count-min"
              type="number"
              min="0"
              placeholder="Від"
              value={filters.trackCountMin || ''}
              onChange={(e) =>
                onFiltersChange({
                  ...filters,
                  trackCountMin: e.target.value
                    ? Number(e.target.value)
                    : undefined,
                })
              }
              className="w-full px-3 py-1.5 bg-gray-800/50 border border-gray-700 rounded text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-gray-600"
            />
            <input
              type="number"
              min="0"
              placeholder="До"
              value={filters.trackCountMax || ''}
              onChange={(e) =>
                onFiltersChange({
                  ...filters,
                  trackCountMax: e.target.value
                    ? Number(e.target.value)
                    : undefined,
                })
              }
              className="w-full px-3 py-1.5 bg-gray-800/50 border border-gray-700 rounded text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-gray-600"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="sort-by-filter" className="text-xs text-gray-400">
            Сортування
          </label>
          <div className="flex gap-2">
            <select
              id="sort-by-filter"
              value={sortBy}
              onChange={(e) =>
                onSortChange(e.target.value as SortField, sortOrder)
              }
              className="flex-1 px-3 py-1.5 bg-gray-800/50 border border-gray-700 rounded text-sm text-gray-200 focus:outline-none focus:border-gray-600"
            >
              <option value="dateAdded">Дата додавання</option>
              <option value="title">Назва</option>
              <option value="artist">Виконавець</option>
              <option value="year">Рік</option>
              <option value="trackCount">Треки</option>
            </select>
            <button
              type="button"
              onClick={() =>
                onSortChange(sortBy, sortOrder === 'asc' ? 'desc' : 'asc')
              }
              className="px-3 py-1.5 bg-gray-800/50 border border-gray-700 rounded hover:bg-gray-800 transition-colors"
              aria-label="Змінити порядок сортування"
              title="Змінити порядок сортування"
            >
              <svg
                className={`w-4 h-4 text-gray-300 transition-transform ${
                  sortOrder === 'desc' ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 15l7-7 7 7"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
