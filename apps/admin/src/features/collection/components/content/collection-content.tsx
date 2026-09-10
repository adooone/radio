import type { Collection } from '@radio/types';
import { Panel } from '@dendelion/mojo-ui';
import { CollectionList } from '@/features/collection/components/content/playlists';
import {
  AlbumList,
  AlbumListHeader,
  AlbumDetail,
  CompactAlbumList,
  CompactAlbumListHeader,
} from '@/features/collection/components/content/albums';
import { useCollectionStore } from '@/features/collection/store/collection-store';

type CollectionContentProps = {
  onCollectionClick: (collection: Collection) => void;
  showDetail?: boolean;
};

export const CollectionContent = ({
  onCollectionClick,
  showDetail = false,
}: CollectionContentProps) => {
  const { activeTab, selectedAlbum, setSelectedAlbum } = useCollectionStore();
  const isPlaylistsTab = activeTab === 'playlists';

  const handleCloseDetail = () => {
    setSelectedAlbum(null);
  };

  // Show detail view if requested and album is selected
  if (showDetail && selectedAlbum && !isPlaylistsTab) {
    return (
      <div className="flex-1 flex flex-col min-w-0 h-auto lg:h-full">
        <Panel
          content={<AlbumDetail album={selectedAlbum} />}
          className="flex-1 flex flex-col overflow-hidden h-auto lg:h-full"
          minHeight="h-full"
          title={selectedAlbum.title}
          decorated={false}
          onClose={handleCloseDetail}
        />
      </div>
    );
  }

  // When an album is selected, show compact list instead of regular list
  const showCompactList = selectedAlbum && !isPlaylistsTab;

  const content = isPlaylistsTab ? (
    <CollectionList onCollectionClick={onCollectionClick} />
  ) : showCompactList ? (
    <CompactAlbumList />
  ) : (
    <AlbumList />
  );

  const header = isPlaylistsTab ? undefined : showCompactList ? (
    <CompactAlbumListHeader />
  ) : (
    <AlbumListHeader />
  );

  return (
    <div className="flex-1 flex flex-col min-w-0 h-auto lg:h-full">
      <Panel
        header={header}
        content={content}
        className="flex-1 flex flex-col overflow-hidden h-auto lg:h-full"
        minHeight="h-full"
        decorated={false}
      />
    </div>
  );
};
