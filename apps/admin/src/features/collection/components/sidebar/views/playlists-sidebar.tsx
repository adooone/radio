import { useCollectionStore } from '@/features/collection/store/collection-store';
import { CollectionStats } from '../stats/collection-stats';
import { CollectionActions } from './actions';

type PlaylistsSidebarProps = {
  totalCount: number;
  publicCount: number;
  lastUpdated?: string;
};

export const PlaylistsSidebar = ({
  totalCount,
  publicCount,
  lastUpdated,
}: PlaylistsSidebarProps) => {
  const { setShowCreateCollectionModal } = useCollectionStore();
  return (
    <>
      <CollectionStats
        activeTab="playlists"
        totalCount={totalCount}
        publicCount={publicCount}
        lastUpdated={lastUpdated}
      />

      <div className="mt-auto pt-4 border-t border-gray-700">
        <CollectionActions
          activeTab="playlists"
          onCreateCollection={() => setShowCreateCollectionModal(true)}
        />
      </div>
    </>
  );
};
