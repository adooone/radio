import { LampButton } from '@dendelion/func-ui';

type CollectionActionsProps = {
  activeTab: 'playlists' | 'albums';
  onCreateCollection?: () => void;
  onCreateAlbum?: () => void;
  onSyncMedia?: () => void;
  isSyncing?: boolean;
};

export const CollectionActions = ({
  activeTab,
  onCreateCollection,
  onCreateAlbum,
  onSyncMedia,
  isSyncing = false,
}: CollectionActionsProps) => {
  return (
    <div className="w-full flex flex-col gap-2">
      {activeTab === 'albums' && onSyncMedia && (
        <LampButton
          tone="green"
          size="md"
          onClick={onSyncMedia}
          disabled={isSyncing}
          className="w-full"
        >
          {isSyncing ? 'Оновлення...' : 'ОНОВИТИ'}
        </LampButton>
      )}
      {activeTab === 'playlists' && onCreateCollection ? (
        <LampButton
          tone="green"
          size="md"
          onClick={onCreateCollection}
          className="w-full"
        >
          Додати плейлист
        </LampButton>
      ) : activeTab === 'albums' && onCreateAlbum ? null : null}
    </div>
  );
};
