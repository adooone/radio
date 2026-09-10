import { Panel } from '@dendelion/mojo-ui';
import { PlaylistsSidebar } from './views/playlists-sidebar';
import { AlbumsSidebar } from './views/albums-sidebar';
import { useCollectionStore } from '../../store/collection-store';
import { useCollectionData } from '../../hooks';

export const CollectionSidebar = () => {
  const { activeTab } = useCollectionStore();
  const { albumStats, playlistSummary } = useCollectionData();

  const isAlbumsTab = activeTab === 'albums';

  const statsData =
    activeTab === 'playlists'
      ? {
          totalCount: playlistSummary.totalCount,
          publicCount: playlistSummary.publicCount,
          lastUpdated: playlistSummary.lastUpdated,
        }
      : {
          totalCount: albumStats.totalCount,
          publicCount: albumStats.publicCount,
          lastUpdated: albumStats.lastUpdated,
        };

  return (
    <div className="w-80 flex-shrink-0 flex flex-col gap-4 h-full">
      <Panel
        content={
          <div className="flex flex-col gap-4 lg:h-full">
            {isAlbumsTab && (
              <AlbumsSidebar
                totalCount={statsData.totalCount}
                publicCount={statsData.publicCount}
                lastUpdated={statsData.lastUpdated}
                genreCounts={albumStats.genreCounts}
                overallCompleteness={albumStats.overallCompleteness}
                getCompletenessVariant={albumStats.getCompletenessVariant}
              />
            )}

            {!isAlbumsTab && (
              <PlaylistsSidebar
                totalCount={statsData.totalCount}
                publicCount={statsData.publicCount}
                lastUpdated={statsData.lastUpdated}
              />
            )}
          </div>
        }
        className="flex-1 flex flex-col lg:h-full"
        minHeight="h-full"
        decorated={false}
      />
    </div>
  );
};
