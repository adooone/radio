import { Tabs } from '@dendelion/func-ui';
import {
  type CollectionTab,
  useCollectionStore,
} from '../store/collection-store';

const TABS = [
  { value: 'albums', label: 'Альбоми' },
  { value: 'playlists', label: 'Плейлисти' },
];

/** Albums or playlists, in the corner level with the sign. */
export const CornerTabs = () => {
  const { activeTab, setActiveTab } = useCollectionStore();
  return (
    <Tabs
      variant="ghost"
      size="sm"
      items={TABS}
      value={activeTab}
      onChange={(value) => setActiveTab(value as CollectionTab)}
    />
  );
};
