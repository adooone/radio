import { Pill, SelectInput, TextInput } from '@/features/admin/ui';
import { useSyncMedia } from '@/services/api';
import { useOnAir } from '@/services/api/hooks/use-on-air-api';
import { useNotificationStore } from '@/stores/notification-store';
import { useEffect, useMemo, useState } from 'react';
import { useCollectionData } from '../hooks';
import { albumsCount, tracksCount } from '../lib/album-meta';
import { useCollectionStore } from '../store/collection-store';
import {
  type SortField,
  filterAlbums,
  sortAlbums,
} from '../utils/album-helpers';
import { AlbumRow } from './album-row';

const SORT_OPTIONS: Array<{ value: SortField; label: string }> = [
  { value: 'dateAdded', label: 'за датою' },
  { value: 'title', label: 'за назвою' },
  { value: 'artist', label: 'за виконавцем' },
  { value: 'year', label: 'за роком' },
  { value: 'trackCount', label: 'за треками' },
];

const SKELETON = ['s1', 's2', 's3', 's4', 's5', 's6'];

/**
 * The records, as the board draws them: the search pill with the
 * collection's count beside it, then the rows, the open one lit. Sync
 * with the media folder lives here too, as a quiet pill.
 */
export const AlbumBrowser = () => {
  const {
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    sortOrder,
    selectedAlbum,
    setSelectedAlbum,
  } = useCollectionStore();
  const { albums, albumsLoading, albumStats } = useCollectionData();
  const { data: onAir } = useOnAir();
  const syncMedia = useSyncMedia();
  const { addNotification } = useNotificationStore();

  // The field answers at once; the list follows 300 ms later.
  const [query, setQuery] = useState(searchQuery);
  useEffect(() => setQuery(searchQuery), [searchQuery]);
  useEffect(() => {
    const timer = setTimeout(() => setSearchQuery(query), 300);
    return () => clearTimeout(timer);
  }, [query, setSearchQuery]);

  const list = useMemo(
    () =>
      sortAlbums(
        filterAlbums(albums ?? [], {}, searchQuery),
        sortBy,
        sortOrder,
      ),
    [albums, searchQuery, sortBy, sortOrder],
  );
  const trackTotal = (albums ?? []).reduce(
    (sum, album) => sum + (album.songCount ?? 0),
    0,
  );

  const sync = () =>
    syncMedia.mutate(undefined, {
      onSuccess: (data) => {
        const parts: string[] = [];
        if (data.albumsCreated > 0)
          parts.push(`нових альбомів: ${data.albumsCreated}`);
        if (data.albumsUpdated > 0)
          parts.push(`оновлено: ${data.albumsUpdated}`);
        if (data.albumsMarkedOffline > 0)
          parts.push(`офлайн: ${data.albumsMarkedOffline}`);
        if (data.tracksCreated > 0)
          parts.push(`нових треків: ${data.tracksCreated}`);
        if (data.tracksUpdated > 0)
          parts.push(`треків оновлено: ${data.tracksUpdated}`);
        const message = parts.length > 0 ? parts.join(', ') : 'без змін';
        addNotification({
          type: data.errors.length > 0 ? 'warning' : 'success',
          title: 'Медіатеку синхронізовано',
          message:
            data.errors.length > 0
              ? `${message}; помилок: ${data.errors.length}`
              : message,
        });
      },
      onError: (error) => {
        addNotification({
          type: 'error',
          title: 'Синхронізація не вдалася',
          message: error instanceof Error ? error.message : 'Невідома помилка',
        });
      },
    });

  return (
    <>
      <div className="flex items-center gap-3.5 pb-3">
        <TextInput
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Пошук у колекції…"
          aria-label="Пошук у колекції"
          className="min-w-0 flex-1"
        />
        <SelectInput
          fit
          aria-label="Сортування"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortField)}
          className="shrink-0 py-2 text-[11px] font-semibold uppercase tracking-[0.12em]"
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </SelectInput>
        <Pill
          tone="ghost"
          size="sm"
          onClick={sync}
          disabled={syncMedia.isPending}
        >
          {syncMedia.isPending ? 'Оновлення…' : 'Оновити'}
        </Pill>
      </div>
      <p className="type-label pb-4 tabular-nums text-cream/60">
        {albumsCount(albums?.length ?? 0)} · {tracksCount(trackTotal)} · каталог{' '}
        {Math.round(albumStats.overallCompleteness)} %
      </p>

      <div
        data-scroll-restoration-id="collection-albums"
        className="work-scroll flex flex-col gap-2.5"
      >
        {albumsLoading ? (
          SKELETON.map((key) => (
            <div
              key={key}
              className="h-[72px] animate-pulse rounded-[18px] bg-cream/5"
            />
          ))
        ) : !albums?.length ? (
          <p className="type-body py-8 text-center text-cream/45">
            Колекція порожня — натисніть «Оновити», щоб прочитати теку медіа.
          </p>
        ) : list.length === 0 ? (
          <p className="type-body py-8 text-center text-cream/45">
            Нічого не знайдено.
          </p>
        ) : (
          list.map((album) => (
            <AlbumRow
              key={album.id}
              album={album}
              selected={selectedAlbum?.id === album.id}
              onAir={onAir?.albumId === album.id}
              onClick={() =>
                setSelectedAlbum(selectedAlbum?.id === album.id ? null : album)
              }
            />
          ))
        )}
      </div>
    </>
  );
};
