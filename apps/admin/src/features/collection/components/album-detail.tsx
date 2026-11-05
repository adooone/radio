import { Chip } from '@/features/admin/ui';
import { useAlbum, useDeleteAlbum } from '@/services/api';
import {
  useClearOnAir,
  useOnAir,
  useSetOnAir,
} from '@/services/api/hooks/use-on-air-api';
import { Button } from '@dendelion/func-ui';
import type { Album, Song } from '@radio/types';
import { useEffect, useState } from 'react';
import { albumMetaLine, albumStateLine, albumTags } from '../lib/album-meta';
import { useCollectionStore } from '../store/collection-store';
import { AlbumForm } from './album-form';
import { AlbumNotes } from './album-notes';
import { AlbumSleeve } from './album-sleeve';
import { CoverDropzone } from './cover-dropzone';
import { FolderPhotos } from './folder-photos';
import { SessionPhotos } from './session-photos';
import { SongRows } from './song-rows';

type AlbumWithSongs = Album & { songs?: Song[] };
type Mode = 'view' | 'edit' | 'cover';

/**
 * The open record on the slab: its sleeve, its lines, the session photos,
 * what to do with it, then the notes, the folder photos and the tracks.
 * Editing and a new cover swap into the same place — no modals.
 */
export const AlbumDetail = ({ album }: { album: Album }) => {
  const { data, isLoading } = useAlbum(album.id);
  const full = (data ?? album) as AlbumWithSongs;
  const [mode, setMode] = useState<Mode>('view');
  const [error, setError] = useState<string | null>(null);
  const deleteAlbum = useDeleteAlbum();
  const { data: onAir } = useOnAir();
  const setOnAir = useSetOnAir();
  const clearOnAir = useClearOnAir();
  const { setSelectedAlbum } = useCollectionStore();

  // biome-ignore lint/correctness/useExhaustiveDependencies: a new record opens in view mode
  useEffect(() => {
    setMode('view');
    setError(null);
  }, [album.id]);

  const albumOnAir = onAir?.albumId === album.id && onAir.songId === undefined;
  const tags = albumTags(full);

  const remove = async () => {
    if (!confirm(`Видалити альбом «${album.title}» разом з усіма треками?`)) {
      return;
    }
    try {
      await deleteAlbum.mutateAsync(album.id);
      setSelectedAlbum(null);
    } catch (err) {
      console.error('Failed to delete album:', err);
      setError('Не вдалося видалити альбом.');
    }
  };

  if (mode === 'edit') {
    return <AlbumForm album={full} onDone={() => setMode('view')} />;
  }
  if (mode === 'cover') {
    return <CoverDropzone albumId={album.id} onDone={() => setMode('view')} />;
  }

  return (
    <div className="flex flex-col gap-5">
      <AlbumSleeve album={full} className="max-w-[300px]" />

      <div className="flex flex-col gap-1.5">
        <h2 className="font-serif text-[26px] font-extrabold leading-[1.15] text-cream">
          {full.title}
        </h2>
        <p className="font-sans text-[13px] text-cream/60">
          {albumMetaLine(full, full.songs)}
        </p>
        <p className="font-sans text-[13px] text-cream/60">
          {albumStateLine(full)}
        </p>
      </div>

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Chip key={tag} tone="cream">
              {tag}
            </Chip>
          ))}
        </div>
      )}
      {full.description && (
        <p className="type-body text-cream/70">{full.description}</p>
      )}

      <SessionPhotos albumId={album.id} folderSlug={full.folderSlug} />

      <div className="flex flex-col gap-2.5 pt-1">
        {albumOnAir ? (
          <div className="flex items-center gap-3">
            <Chip tone="red" dot="live">
              в ефірі
            </Chip>
            <Button
              variant="danger"
              size="sm"
              disabled={clearOnAir.isPending}
              onClick={() => clearOnAir.mutate()}
            >
              Зняти з ефіру
            </Button>
          </div>
        ) : (
          <Button
            variant="danger"
            disabled={setOnAir.isPending}
            onClick={() => setOnAir.mutate({ albumId: album.id })}
          >
            Поставити в ефір
          </Button>
        )}
        <div className="flex gap-2.5">
          <Button
            variant="ghost"
            size="sm"
            className="flex-1"
            onClick={() => setMode('edit')}
          >
            Редагувати
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="flex-1"
            onClick={() => setMode('cover')}
          >
            Обкладинка
          </Button>
        </div>
      </div>

      {isLoading ? (
        <p className="type-body text-cream/45">Завантаження…</p>
      ) : (
        <>
          <AlbumNotes album={full} />
          <FolderPhotos albumId={album.id} folderSlug={full.folderSlug} />
          <SongRows albumId={album.id} songs={full.songs ?? []} />
        </>
      )}

      {error && <p className="font-sans text-xs text-accent">{error}</p>}
      <button
        type="button"
        onClick={remove}
        disabled={deleteAlbum.isPending}
        className="type-label self-start pb-2 text-cream/45 transition-colors hover:text-accent"
      >
        {deleteAlbum.isPending ? 'Видалення…' : 'Видалити альбом'}
      </button>
    </div>
  );
};
