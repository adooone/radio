import { SortIcon } from '@/components/icons';
import { LampButton, Menu } from '@dendelion/func-ui';
import { useCollectionStore } from '../../store/collection-store';
import { CompactAlbumList } from '../content/albums';
import { AlbumSearch } from '../filters/album-search';

const SORT_OPTIONS: Array<{
  value: 'title' | 'artist' | 'year' | 'trackCount' | 'dateAdded';
  label: string;
}> = [
  { value: 'title', label: 'Назва' },
  { value: 'artist', label: 'Виконавець' },
  { value: 'year', label: 'Рік' },
  { value: 'trackCount', label: 'Треки' },
  { value: 'dateAdded', label: 'Дата' },
];

export const AlbumBrowser = () => {
  const { searchQuery, setSearchQuery, sortBy, setSortBy } =
    useCollectionStore();

  const currentSortLabel =
    SORT_OPTIONS.find((option) => option.value === sortBy)?.label ?? 'Назва';

  return (
    <section className="flex min-h-0 flex-col gap-4">
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <AlbumSearch value={searchQuery} onChange={setSearchQuery} />
        </div>
        <Menu
          trigger={
            <LampButton
              tabIndex={-1}
              tone="dark"
              size="sm"
              rounded="half"
              icon={<SortIcon size={14} />}
            >
              {currentSortLabel}
            </LampButton>
          }
          align="end"
          items={SORT_OPTIONS.map((option) => ({
            label: option.label,
            selected: sortBy === option.value,
            onSelect: () => setSortBy(option.value),
          }))}
        />
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto [scrollbar-width:none]">
        <CompactAlbumList />
      </div>
    </section>
  );
};
