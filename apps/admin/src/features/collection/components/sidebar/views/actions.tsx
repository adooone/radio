import { Button } from '@dendelion/mojo-ui';

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
        <Button
          variant="green"
          size="medium"
          title={isSyncing ? 'Оновлення...' : 'ОНОВИТИ'}
          onClick={onSyncMedia}
          disabled={isSyncing}
          className="w-full"
        />
      )}
      {activeTab === 'playlists' && onCreateCollection ? (
        <Button
          variant="green"
          size="medium"
          title="Додати плейлист"
          onClick={onCreateCollection}
          className="w-full"
        />
      ) : activeTab === 'albums' && onCreateAlbum ? null : null}
    </div>
  );
};
