import { TabPills } from '@/features/admin/ui';
import {
  type CollectionTab,
  useCollectionStore,
} from '../store/collection-store';

const TABS = [
  { id: 'albums', label: 'Альбоми' },
  { id: 'playlists', label: 'Плейлисти' },
];

/** Albums or playlists, in the corner level with the sign. */
export const CornerTabs = () => {
  const { activeTab, setActiveTab } = useCollectionStore();
  return (
    <TabPills
      tabs={TABS}
      active={activeTab}
      onChange={(id) => setActiveTab(id as CollectionTab)}
    />
  );
};
