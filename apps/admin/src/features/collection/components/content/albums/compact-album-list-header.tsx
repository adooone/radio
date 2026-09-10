import { useCollectionStore } from '@/features/collection/store/collection-store';
import {
  IconButton,
  Popup,
  PopupItem,
  SortIcon,
  ArrowUpIcon,
  ArrowDownIcon,
} from '@dendelion/mojo-ui';

export const CompactAlbumListHeader = () => {
  const { sortBy, sortOrder, setSortBy, setSortOrder } = useCollectionStore();

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
        <Popup
          label={currentSortLabel}
          icon={<SortIcon size={14} />}
          size="small"
          variant="dark"
          rounded="half"
          align="right"
          buttonClassName="max-w-[200px]"
        >
          {sortOptions.map((option) => (
            <PopupItem
              key={option.value}
              selected={sortBy === option.value}
              onClick={() => setSortBy(option.value)}
            >
              {option.label}
            </PopupItem>
          ))}
        </Popup>

        <IconButton
          variant="dark"
          size="small"
          onClick={toggleSortOrder}
          aria-label={sortOrder === 'asc' ? 'За зростанням' : 'За спаданням'}
        >
          {sortOrder === 'asc' ? (
            <ArrowUpIcon size={16} />
          ) : (
            <ArrowDownIcon size={16} />
          )}
        </IconButton>
      </div>
    </div>
  );
};
