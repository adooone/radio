import { Chip } from '@/features/admin/ui';
import { useDeleteCollection, useUserCollections } from '@/services/api';
import { Button } from '@dendelion/func-ui';
import type { Collection } from '@radio/types';
import clsx from 'clsx';
import { useState } from 'react';
import { plural } from '../lib/album-meta';
import { useCollectionStore } from '../store/collection-store';

const playlistsCount = (n: number) =>
  plural(n, ['плейлист', 'плейлисти', 'плейлистів']);

const Row = ({
  playlist,
  selected,
  deleting,
  onOpen,
  onDelete,
}: {
  playlist: Collection;
  selected: boolean;
  deleting: boolean;
  onOpen: () => void;
  onDelete: () => void;
}) => (
  <div
    className={clsx(
      'flex items-center gap-4 rounded-[18px] border px-[18px] py-3 transition-colors',
      selected
        ? 'border-lamp/35 bg-lamp/[0.07]'
        : 'border-cream/[0.08] hover:border-cream/20',
      deleting && 'opacity-50',
    )}
  >
    <button
      type="button"
      onClick={onOpen}
      aria-pressed={selected}
      className="flex min-w-0 flex-1 cursor-pointer flex-col gap-0.5 text-left"
    >
      <span className="truncate font-serif text-[17px] font-semibold text-cream">
        {playlist.name}
      </span>
      {playlist.description && (
        <span className="truncate font-sans text-xs text-cream/60">
          {playlist.description}
        </span>
      )}
    </button>
    <Chip tone={playlist.isPublic ? 'lit' : 'quiet'}>
      {playlist.isPublic ? 'публічний' : 'приватний'}
    </Chip>
    <span className="type-meta shrink-0 text-cream/60">
      {new Date(playlist.createdAt).toLocaleDateString('uk-UA')}
    </span>
    <button
      type="button"
      onClick={onDelete}
      disabled={deleting}
      aria-label="Видалити плейлист"
      className="shrink-0 px-1 text-cream/45 transition-colors hover:text-accent"
    >
      ✕
    </button>
  </div>
);

/** The playlists as rows, with the one lit pill that makes a new one. */
export const PlaylistBrowser = ({ onCreate }: { onCreate: () => void }) => {
  const { data: playlists, isLoading, error } = useUserCollections();
  const deletePlaylist = useDeleteCollection();
  const { selectedPlaylist, setSelectedPlaylist } = useCollectionStore();
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const remove = async (playlist: Collection) => {
    if (!confirm(`Видалити плейлист «${playlist.name}»?`)) return;
    setDeletingId(playlist.id);
    try {
      await deletePlaylist.mutateAsync(playlist.id);
      if (selectedPlaylist?.id === playlist.id) setSelectedPlaylist(null);
    } catch (err) {
      console.error('Failed to delete collection:', err);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      <div className="flex items-center gap-3.5 pb-5">
        <span className="type-label tabular-nums text-cream/60">
          {playlistsCount(playlists?.length ?? 0)}
        </span>
        <span className="flex-1" />
        <Button variant="lit" size="sm" onClick={onCreate}>
          + Новий плейлист
        </Button>
      </div>

      <div className="work-scroll flex flex-col gap-2.5">
        {isLoading ? (
          ['s1', 's2', 's3'].map((key) => (
            <div
              key={key}
              className="h-[66px] animate-pulse rounded-[18px] bg-cream/5"
            />
          ))
        ) : error ? (
          <p className="type-body text-accent">
            Не вдалося завантажити плейлисти.
          </p>
        ) : !playlists?.length ? (
          <p className="type-body py-8 text-center text-cream/45">
            Плейлистів ще немає.
          </p>
        ) : (
          playlists.map((playlist) => (
            <Row
              key={playlist.id}
              playlist={playlist}
              selected={selectedPlaylist?.id === playlist.id}
              deleting={deletingId === playlist.id}
              onOpen={() =>
                setSelectedPlaylist(
                  selectedPlaylist?.id === playlist.id ? null : playlist,
                )
              }
              onDelete={() => remove(playlist)}
            />
          ))
        )}
      </div>
    </>
  );
};
