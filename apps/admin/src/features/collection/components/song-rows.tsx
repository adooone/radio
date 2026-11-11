import { collectionApi, useDeleteSong } from '@/services/api';
import {
  useOnAir,
  usePlayNext,
  useRotation,
  useSetOnAir,
} from '@/services/api/hooks/use-on-air-api';
import { useNowPlayingStore } from '@/stores/now-playing-store';
import { Button, Stamp } from '@dendelion/func-ui';
import { LampIconButton } from '@dendelion/func-ui';
import type { Song } from '@radio/types';
import clsx from 'clsx';
import { useState } from 'react';

const PlayIcon = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 14 14"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M3.5 1.8c0-.6.65-.97 1.17-.67l8 4.7a.78.78 0 0 1 0 1.34l-8 4.7a.78.78 0 0 1-1.17-.67V1.8Z" />
  </svg>
);

const PauseIcon = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 14 14"
    fill="currentColor"
    aria-hidden="true"
  >
    <rect x="2.5" y="1.5" width="3.2" height="11" rx="1" />
    <rect x="8.3" y="1.5" width="3.2" height="11" rx="1" />
  </svg>
);

type Preview = { title: string; artist: string; audioUrl?: string };

/**
 * The album's tracks as rows: number, title, length; the play lamp for a
 * local preview, a chip when a track is the one on air, and what to do
 * with it — put it on air, have the rotation play it next, or take it out
 * of the album.
 */
export const SongRows = ({
  albumId,
  songs,
}: {
  albumId: number;
  songs: Song[];
}) => {
  const deleteSong = useDeleteSong();
  const { data: onAir } = useOnAir();
  const setOnAir = useSetOnAir();
  const { data: rotation } = useRotation();
  const playNext = usePlayNext();
  const { currentTrack, isPlaying, playTrack } = useNowPlayingStore();
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const sorted = [...songs].sort((a, b) => a.trackNumber - b.trackNumber);

  // The preview playlist holds the tracks that have a file, in order.
  const playlist: Preview[] = [];
  const indexOf = new Map<number, number>();
  for (const song of sorted) {
    if (song.audioUrl) {
      indexOf.set(song.id, playlist.length);
      playlist.push({
        title: song.title,
        artist: song.artist ?? '',
        audioUrl: song.audioUrl,
      });
    }
  }

  const remove = async (song: Song) => {
    if (!confirm(`Прибрати «${song.title}» з альбому?`)) return;
    setDeletingId(song.id);
    try {
      await deleteSong.mutateAsync(song.id);
    } catch (error) {
      console.error('Failed to delete song:', error);
    } finally {
      setDeletingId(null);
    }
  };

  if (sorted.length === 0) {
    return (
      <p className="type-body text-cream/45">
        У цьому альбомі ще немає треків.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="type-label text-cream/45">Треки</span>
      {sorted.map((song) => {
        const previewing =
          Boolean(song.audioUrl) && currentTrack?.audioUrl === song.audioUrl;
        const songOnAir =
          onAir?.albumId === albumId && onAir.songId === song.id;
        const index = indexOf.get(song.id);
        return (
          <div
            key={song.id}
            className={clsx(
              'flex items-center gap-3 rounded-[14px] border px-3 py-2',
              songOnAir
                ? 'border-accent/35 bg-accent/[0.06]'
                : previewing
                  ? 'border-lamp/35 bg-lamp/[0.06]'
                  : 'border-cream/[0.08]',
              deletingId === song.id && 'opacity-50',
            )}
          >
            <span className="type-meta w-5 shrink-0 text-cream/55">
              {song.trackNumber}
            </span>
            {index !== undefined ? (
              <LampIconButton
                tone={previewing && isPlaying ? 'red' : 'dark'}
                size="sm"
                label={previewing && isPlaying ? 'Пауза' : 'Прослухати'}
                icon={previewing && isPlaying ? <PauseIcon /> : <PlayIcon />}
                onClick={() => playTrack(playlist, index)}
                className={clsx(
                  'shrink-0',
                  previewing && isPlaying ? 'text-ink' : 'text-cream',
                )}
              />
            ) : (
              <span className="size-8 shrink-0" />
            )}
            <span className="min-w-0 flex-1 truncate font-serif text-base font-semibold text-cream">
              {song.title}
            </span>
            {songOnAir && (
              <Stamp variant="error" dot>
                в ефірі
              </Stamp>
            )}
            <span className="type-meta shrink-0 text-cream/60">
              {song.duration}
            </span>
            {!songOnAir && (
              <Button
                variant="secondary"
                size="sm"
                disabled={setOnAir.isPending}
                onClick={() => setOnAir.mutate({ albumId, songId: song.id })}
              >
                В ефір
              </Button>
            )}
            {rotation?.enabled && !songOnAir && (
              <Button
                variant="ghost"
                size="sm"
                disabled={
                  playNext.isPending || rotation.upNext.includes(song.id)
                }
                onClick={() => playNext.mutate(song.id)}
              >
                {rotation.upNext.includes(song.id) ? 'У черзі' : 'Наступною'}
              </Button>
            )}
            <button
              type="button"
              onClick={() =>
                window.open(
                  collectionApi.getAudioFileStreamUrl(song.audioFileId),
                  '_blank',
                )
              }
              className="type-label shrink-0 text-cream/45 transition-colors hover:text-cream"
              title="Відкрити файл"
            >
              файл
            </button>
            <button
              type="button"
              onClick={() => remove(song)}
              disabled={deletingId === song.id}
              className="shrink-0 px-1 text-cream/45 transition-colors hover:text-accent"
              aria-label="Прибрати трек"
            >
              ✕
            </button>
          </div>
        );
      })}
    </div>
  );
};
