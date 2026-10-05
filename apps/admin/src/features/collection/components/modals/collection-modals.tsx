import type { Collection } from '@radio/types';
import { useCollectionStore } from '../../store/collection-store';
import { AlbumDetail } from '../content/albums';
import { CollectionDetail } from '../content/playlists';
import { CreateAlbumModal, CreateCollectionModal, DetailModal } from './index';

type CollectionModalsProps = {
  selectedCollection: Collection | null;
  onCloseCollection: () => void;
};

export const CollectionModals = ({
  selectedCollection,
  onCloseCollection,
}: CollectionModalsProps) => {
  const {
    activeTab,
    selectedAlbum,
    showCreateAlbumModal,
    showEditAlbumModal,
    showCreateCollectionModal,
    setSelectedAlbum,
    setShowCreateAlbumModal,
    setShowEditAlbumModal,
    setShowCreateCollectionModal,
  } = useCollectionStore();

  return (
    <>
      {activeTab === 'playlists' && (
        <DetailModal
          title={selectedCollection?.name || ''}
          onClose={onCloseCollection}
          isOpen={!!selectedCollection}
        >
          {selectedCollection && (
            <CollectionDetail collection={selectedCollection} />
          )}
        </DetailModal>
      )}

      {/* Album detail is now shown inline in master-detail layout, not as modal */}

      <CreateCollectionModal
        isOpen={showCreateCollectionModal}
        onClose={() => setShowCreateCollectionModal(false)}
        onSuccess={() => setShowCreateCollectionModal(false)}
      />

      <CreateAlbumModal
        isOpen={showCreateAlbumModal}
        onClose={() => setShowCreateAlbumModal(false)}
        onSuccess={() => setShowCreateAlbumModal(false)}
      />

      {showEditAlbumModal && selectedAlbum && (
        <DetailModal
          title={`Редагувати: ${selectedAlbum.title}`}
          onClose={() => {
            setShowEditAlbumModal(false);
            setSelectedAlbum(null);
          }}
          isOpen={showEditAlbumModal}
        >
          <AlbumDetail album={selectedAlbum} />
        </DetailModal>
      )}
    </>
  );
};
