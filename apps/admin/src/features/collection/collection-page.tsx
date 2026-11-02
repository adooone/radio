import type { Collection } from '@radio/types';
import { useState } from 'react';
import { CollectionModals } from './components';
import { AlbumBrowser } from './components/browser';
import { CollectionList } from './components/content/playlists';
import { AlbumPane } from './components/detail';
import { CollectionHeader } from './components/header';
import { useCollectionStore } from './store/collection-store';

export const CollectionPage = () => {
  const [selectedCollection, setSelectedCollection] =
    useState<Collection | null>(null);
  const { activeTab } = useCollectionStore();

  return (
    <div className="flex h-full flex-col">
      <CollectionHeader />
      <div className="grid min-h-0 flex-1 grid-cols-[2fr_1fr] gap-[var(--gutter)] px-[var(--gutter)]">
        {activeTab === 'albums' ? (
          <>
            <AlbumBrowser />
            <div className="min-h-0 overflow-y-auto pb-28 [scrollbar-width:none]">
              <AlbumPane />
            </div>
          </>
        ) : (
          <div className="col-span-2 min-h-0 overflow-y-auto pb-28 [scrollbar-width:none]">
            <CollectionList onCollectionClick={setSelectedCollection} />
          </div>
        )}
      </div>

      <CollectionModals
        selectedCollection={selectedCollection}
        onCloseCollection={() => setSelectedCollection(null)}
      />
    </div>
  );
};
