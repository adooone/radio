import { VinylTabs } from '@/components';
import { useSyncMedia } from '@/services/api';
import { useNotificationStore } from '@/stores/notification-store';
import { LampButton } from '@dendelion/func-ui';
import { useCollectionData } from '../../hooks';
import { useCollectionStore } from '../../store/collection-store';

const TABS = [
  { id: 'albums', label: 'Альбоми' },
  { id: 'playlists', label: 'Плейлисти' },
];

type ChipProps = {
  label: string;
  value: string | number;
};

const Chip = ({ label, value }: ChipProps) => (
  <div className="flex items-baseline gap-2 rounded-full bg-cream/5 px-3 py-1.5 ring-1 ring-cream/10">
    <span className="font-sans text-[10px] font-semibold uppercase tracking-[0.14em] text-cream/45">
      {label}
    </span>
    <span className="font-sans text-sm font-semibold text-cream">{value}</span>
  </div>
);

export const CollectionHeader = () => {
  const { activeTab, setActiveTab, setShowCreateCollectionModal } =
    useCollectionStore();
  const { albums, albumStats, playlistSummary } = useCollectionData();
  const syncMedia = useSyncMedia();
  const { addNotification } = useNotificationStore();

  const trackCount = (albums ?? []).reduce(
    (sum, album) => sum + (album.songCount ?? 0),
    0,
  );

  const handleSyncMedia = () => {
    syncMedia.mutate(undefined, {
      onSuccess: (data) => {
        const parts: string[] = [];
        if (data.albumsCreated > 0)
          parts.push(`${data.albumsCreated} albums created`);
        if (data.albumsUpdated > 0)
          parts.push(`${data.albumsUpdated} albums updated`);
        if (data.albumsMarkedOffline > 0)
          parts.push(`${data.albumsMarkedOffline} marked offline`);
        if (data.tracksCreated > 0)
          parts.push(`${data.tracksCreated} tracks added`);
        if (data.tracksUpdated > 0)
          parts.push(`${data.tracksUpdated} tracks updated`);

        const message =
          parts.length > 0 ? parts.join(', ') : 'No changes detected';

        addNotification({
          type: data.errors.length > 0 ? 'warning' : 'success',
          title: 'Media sync complete',
          message:
            data.errors.length > 0
              ? `${message}. ${data.errors.length} error(s) occurred.`
              : message,
        });
      },
      onError: (error) => {
        addNotification({
          type: 'error',
          title: 'Media sync failed',
          message:
            error instanceof Error
              ? error.message
              : 'An unexpected error occurred',
        });
      },
    });
  };

  return (
    <header className="flex flex-wrap items-center gap-3 px-[var(--gutter)] pt-[calc(var(--gutter)*0.8+4.5rem)] pb-4">
      <VinylTabs
        tabs={TABS}
        activeTab={activeTab}
        onTabChange={(id) => setActiveTab(id as 'albums' | 'playlists')}
      />

      {activeTab === 'albums' ? (
        <>
          <Chip label="Альбоми" value={albumStats.totalCount} />
          <Chip label="Треки" value={trackCount} />
          <Chip
            label="Повнота даних"
            value={`${Math.round(albumStats.overallCompleteness)}%`}
          />
        </>
      ) : (
        <>
          <Chip label="Плейлисти" value={playlistSummary.totalCount} />
          <Chip label="Публічні" value={playlistSummary.publicCount} />
        </>
      )}

      <div className="flex-1" />

      {activeTab === 'albums' ? (
        <LampButton
          tone="green"
          size="sm"
          onClick={handleSyncMedia}
          disabled={syncMedia.isPending}
        >
          {syncMedia.isPending ? 'Оновлення...' : 'ОНОВИТИ'}
        </LampButton>
      ) : (
        <LampButton
          tone="green"
          size="sm"
          onClick={() => setShowCreateCollectionModal(true)}
        >
          Додати плейлист
        </LampButton>
      )}
    </header>
  );
};
