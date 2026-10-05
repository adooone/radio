import { useCollectionStore } from '@/features/collection/store/collection-store';
import { AlbumSearch } from './album-search';

export const SearchBar = () => {
  const { searchQuery, setSearchQuery } = useCollectionStore();
  return (
    <div className="flex items-center gap-2 w-full">
      <div className="flex-1">
        <AlbumSearch value={searchQuery} onChange={setSearchQuery} />
      </div>
    </div>
  );
};
