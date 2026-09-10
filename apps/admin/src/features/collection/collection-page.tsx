import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PageLayout, VinylTabs, Panel } from '@dendelion/mojo-ui';
import {
  CollectionContent,
  CollectionSidebar,
  CollectionModals,
} from './components';
import {
  CompactAlbumList,
  CompactAlbumListHeader,
} from './components/content/albums';
import type { Collection } from '@radio/types';
import { useCollectionStore } from './store/collection-store';

export const CollectionPage = () => {
  const [selectedCollection, setSelectedCollection] =
    useState<Collection | null>(null);

  const { activeTab, setActiveTab, selectedAlbum } = useCollectionStore();

  const tabs = [
    { id: 'albums' as const, label: 'Альбоми' },
    { id: 'playlists' as const, label: 'Плейлисти' },
  ];

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId as 'playlists' | 'albums');
    setSelectedCollection(null);
  };

  // For albums tab: show master-detail layout
  // For playlists tab: keep modal behavior
  const isAlbumsTab = activeTab === 'albums';
  const showAlbumDetail = isAlbumsTab && selectedAlbum !== null;

  return (
    <PageLayout
      title="Колекція"
      headerRight={
        <VinylTabs
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />
      }
    >
      <div className="relative lg:h-[calc(100vh-12rem)] overflow-visible pb-16">
        <div
          className="relative h-full"
          style={{
            width: '100%',
            paddingTop: `${layout.padding}px`,
            paddingBottom: `${layout.padding}px`,
          }}
        >
          {/* Sidebar - slides out to the left */}
          <motion.div
            className="absolute left-0 top-0 bottom-0 overflow-hidden"
            style={{
              width: layout.sidebarWidth,
              willChange: 'transform',
            }}
            animate={
              showAlbumDetail
                ? animations.sidebar.slideOut
                : animations.sidebar.slideIn
            }
            transition={animations.transition}
          >
            <CollectionSidebar />
          </motion.div>

          {/* Album List - starts after sidebar, slides to sidebar position when detail opens */}
          <motion.div
            className="absolute top-0 bottom-0 overflow-hidden flex flex-col"
            style={{
              left: layout.listLeftPosition,
              width: `calc(100% - ${layout.sidebarWidth}px - ${layout.padding}px)`,
              willChange: 'transform',
            }}
            animate={
              showAlbumDetail
                ? animations.list.slideOut
                : animations.list.slideIn
            }
            transition={animations.transition}
          >
            <CollectionContent
              onCollectionClick={setSelectedCollection}
              showDetail={false}
            />
          </motion.div>

          {/* Compact Album List Panel - appears smoothly when detail is open */}
          <AnimatePresence>
            {showAlbumDetail && (
              <motion.div
                key="compact-album-panel"
                className="absolute top-0 bottom-0 overflow-hidden flex flex-col"
                style={{
                  left: layout.compactPanelLeftPosition,
                  width: layout.compactPanelWidth,
                  willChange: 'transform',
                  zIndex: animations.compactPanel.zIndex,
                }}
                initial={animations.compactPanel.initial}
                animate={animations.compactPanel.animate}
                exit={animations.compactPanel.exit}
                transition={animations.transition}
              >
                <Panel
                  header={<CompactAlbumListHeader />}
                  content={<CompactAlbumList />}
                  className="flex-1 flex flex-col overflow-hidden h-auto lg:h-full"
                  minHeight="h-full"
                  decorated={false}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Album Detail - slides in from right, positioned after compact panel */}
          <AnimatePresence mode="popLayout">
            {showAlbumDetail && (
              <motion.div
                key="album-detail"
                className="absolute top-0 bottom-0 overflow-hidden flex flex-col"
                style={{
                  left: layout.detailPanelLeftPosition,
                  right: 0,
                  width: 'auto',
                  willChange: 'transform',
                  zIndex: animations.detailPanel.zIndex,
                }}
                initial={animations.detailPanel.initial}
                animate={animations.detailPanel.animate}
                exit={animations.detailPanel.exit}
                transition={animations.transition}
              >
                <CollectionContent
                  onCollectionClick={setSelectedCollection}
                  showDetail={true}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <CollectionModals
        selectedCollection={selectedCollection}
        onCloseCollection={() => setSelectedCollection(null)}
      />
    </PageLayout>
  );
};

const layout = {
  sidebarWidth: 320,
  sidebarGap: 16,
  compactPanelWidth: 400,
  compactPanelGap: 16,
  padding: 24,

  get listLeftPosition() {
    return this.sidebarWidth + this.sidebarGap;
  },
  get compactPanelLeftPosition() {
    return 0;
  },
  get detailPanelLeftPosition() {
    return this.compactPanelWidth + this.compactPanelGap;
  },
  get detailHeightAdjustment() {
    return this.padding * 2;
  },
};

const animations = {
  transition: { duration: 0.2 },
  sidebar: {
    slideOut: { x: '-20%', opacity: 0, pointerEvents: 'none' as const },
    slideIn: { x: 0, opacity: 1, pointerEvents: 'auto' as const },
  },
  list: {
    slideOut: { x: '-20%', opacity: 0, pointerEvents: 'none' as const },
    slideIn: { x: 0, opacity: 1, pointerEvents: 'auto' as const },
  },
  compactPanel: {
    initial: { x: '50%', opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: '50%', opacity: 0 },
    zIndex: 5,
  },
  detailPanel: {
    initial: { x: '50%', opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: '50%', opacity: 0 },
    zIndex: 10,
  },
};
