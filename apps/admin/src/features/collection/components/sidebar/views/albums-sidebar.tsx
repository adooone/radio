import { ProgressBar } from '@dendelion/mojo-ui';
import { CollectionStats } from '../stats/collection-stats';
import { CollectionActions } from './actions';
import { useCollectionStore } from '@/features/collection/store/collection-store';
import { GenreStats } from '../stats/genre-stats';
import { useSyncMedia } from '@/services/api';
import { useNotificationStore } from '@/stores/notification-store';

type AlbumsSidebarProps = {
  genreCounts: Map<string, number>;
  totalCount: number;
  publicCount: number;
  lastUpdated?: string;
  overallCompleteness: number;
  getCompletenessVariant: (percentage: number) => 'green' | 'yellow' | 'red';
};

export const AlbumsSidebar = ({
  genreCounts,
  totalCount,
  publicCount,
  lastUpdated,
  overallCompleteness,
  getCompletenessVariant,
}: AlbumsSidebarProps) => {
  const { filters, setFilters, setShowCreateAlbumModal } = useCollectionStore();
  const syncMedia = useSyncMedia();
  const { addNotification } = useNotificationStore();

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

  const handleGenreClick = (genre: string) => {
    setFilters((prev) => ({
      ...prev,
      genres: prev.genres?.includes(genre)
        ? prev.genres.filter((g) => g !== genre)
        : [...(prev.genres || []), genre],
    }));
  };

  return (
    <div className="flex flex-col h-full justify-between gap-6 w-full">
      <GenreStats
        genreCounts={genreCounts}
        onGenreClick={handleGenreClick}
        selectedGenres={filters.genres || ([] as string[])}
      />

      <div>
        <div className="w-full">
          <ProgressBar
            value={overallCompleteness}
            variant={getCompletenessVariant(overallCompleteness)}
            size="medium"
            label="Повнота даних"
            lampCount={20}
            className="w-full pb-4"
          />
          <CollectionStats
            activeTab="albums"
            totalCount={totalCount}
            publicCount={publicCount}
            lastUpdated={lastUpdated}
          />
        </div>

        <div className="pt-4 w-full">
          <CollectionActions
            activeTab="albums"
            onCreateAlbum={() => setShowCreateAlbumModal(true)}
            onSyncMedia={handleSyncMedia}
            isSyncing={syncMedia.isPending}
          />
        </div>
      </div>
    </div>
  );
};
