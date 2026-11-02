import { Split } from '@/features/admin/split';
import { useState } from 'react';
import {
  AlbumBrowser,
  AlbumDetail,
  CornerTabs,
  PlaylistBrowser,
  PlaylistDetail,
  PlaylistForm,
} from './components';
import { useCollectionStore } from './store/collection-store';

const Hint = ({ children }: { children: string }) => (
  <p className="type-body text-cream/45">{children}</p>
);

/** «Колекція»: the records or the playlists on the left, the open one on the slab. */
export const CollectionPage = () => {
  const { activeTab, selectedAlbum, selectedPlaylist } = useCollectionStore();
  const [creatingPlaylist, setCreatingPlaylist] = useState(false);

  const slab =
    activeTab === 'albums' ? (
      selectedAlbum ? (
        <AlbumDetail album={selectedAlbum} />
      ) : (
        <Hint>Оберіть альбом зі списку, щоб побачити його деталі.</Hint>
      )
    ) : creatingPlaylist ? (
      <PlaylistForm onDone={() => setCreatingPlaylist(false)} />
    ) : selectedPlaylist ? (
      <PlaylistDetail playlist={selectedPlaylist} />
    ) : (
      <Hint>Оберіть плейлист зі списку або створіть новий.</Hint>
    );

  return (
    <Split
      corner={<CornerTabs />}
      left={
        activeTab === 'albums' ? (
          <AlbumBrowser />
        ) : (
          <PlaylistBrowser onCreate={() => setCreatingPlaylist(true)} />
        )
      }
      right={<div className="slab-scroll">{slab}</div>}
    />
  );
};
