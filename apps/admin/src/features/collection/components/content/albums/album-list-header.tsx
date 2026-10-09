import { AlbumSearch } from '@/features/collection/components/filters/album-search';
import { useCollectionStore } from '@/features/collection/store/collection-store';
import { LampButton, LampIconButton, Menu } from '@dendelion/func-ui';
import {
  ArrowDownIcon,
  ArrowUpIcon,
  FilterIcon,
  SortIcon,
} from '@dendelion/mojo-ui';

export const AlbumListHeader = () => {
  const {
    searchQuery,
    setSearchQuery,
    sortBy,
    sortOrder,
    setSortBy,
    setSortOrder,
    toggleFiltersEnabled,
    hasActiveFilters,
    filtersEnabled,
  } = useCollectionStore();

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  const sortOptions: Array<{
    value: typeof sortBy;
    label: string;
  }> = [
    { value: 'title', label: 'Назва' },
    { value: 'artist', label: 'Виконавець' },
    { value: 'year', label: 'Рік' },
    { value: 'trackCount', label: 'Треки' },
    { value: 'dateAdded', label: 'Дата' },
  ];

  const currentSortLabel =
    sortOptions.find((opt) => opt.value === sortBy)?.label || 'Назва';

  return (
    <div className="flex items-center gap-3 w-full">
      <h3 className="text-lg font-semibold text-gray-200 whitespace-nowrap ml-3">
        Ваші альбоми
      </h3>

      <div className="flex-1" />

      <div className="flex items-center gap-2">
        <Menu
          trigger={
            <LampButton
              tone="yellow"
              size="sm"
              rounded="half"
              icon={<SortIcon size={14} />}
              className="max-w-[200px]"
            >
              {currentSortLabel}
            </LampButton>
          }
          align="end"
          items={sortOptions.map((option) => ({
            label: option.label,
            selected: sortBy === option.value,
            onSelect: () => setSortBy(option.value),
          }))}
        />

        <LampIconButton
          tone="dark"
          size="sm"
          onClick={toggleSortOrder}
          label={sortOrder === 'asc' ? 'За зростанням' : 'За спаданням'}
          icon={
            sortOrder === 'asc' ? (
              <ArrowUpIcon size={16} />
            ) : (
              <ArrowDownIcon size={16} />
            )
          }
        />

        <LampIconButton
          tone={hasActiveFilters() && filtersEnabled ? 'yellow' : 'dark'}
          size="sm"
          onClick={toggleFiltersEnabled}
          disabled={!hasActiveFilters()}
          label={filtersEnabled ? 'Вимкнути фільтри' : 'Увімкнути фільтри'}
          icon={<FilterIcon size={16} />}
        />

        <div className="w-64">
          <AlbumSearch value={searchQuery} onChange={setSearchQuery} />
        </div>
      </div>
    </div>
  );
};
