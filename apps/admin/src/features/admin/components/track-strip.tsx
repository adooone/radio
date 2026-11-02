import { useOnAir } from '@/services/api/hooks';
import { useNowPlayingStore } from '@/stores/now-playing-store';
import { LampIconButton } from '@dendelion/func-ui';
import type React from 'react';
import { Dot } from '../ui';

const PlayIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 14 14"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M3.5 1.8c0-.6.65-.97 1.17-.67l8 4.7a.78.78 0 0 1 0 1.34l-8 4.7a.78.78 0 0 1-1.17-.67V1.8Z" />
  </svg>
);

const PauseIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 14 14"
    fill="currentColor"
    aria-hidden="true"
  >
    <rect x="2.5" y="1.5" width="3.2" height="11" rx="1" />
    <rect x="8.3" y="1.5" width="3.2" height="11" rx="1" />
  </svg>
);

const StopIcon = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 14 14"
    fill="currentColor"
    aria-hidden="true"
  >
    <rect x="2.5" y="2.5" width="9" height="9" rx="1.5" />
  </svg>
);

/**
 * The island's words, as the player's track strip: one slot, the song on
 * air with the live dot — or, while the admin previews a track, that track
 * with the play lamp and a stop, since the preview is what is sounding here.
 */
export const TrackStrip: React.FC = () => {
  const { currentTrack, isPlaying, togglePlayPause, stop } =
    useNowPlayingStore();
  const { data: onAir } = useOnAir();

  const song = currentTrack ?? onAir ?? null;
  const previewing = Boolean(currentTrack);

  return (
    <div className="flex min-w-0 items-center gap-3">
      {previewing ? (
        <LampIconButton
          tone="red"
          size="sm"
          label={isPlaying ? 'Пауза' : 'Грати'}
          icon={isPlaying ? <PauseIcon /> : <PlayIcon />}
          onClick={togglePlayPause}
          className="shrink-0 text-ink"
        />
      ) : (
        <Dot tone={song ? 'live' : 'quiet'} />
      )}
      <div className="w-[260px] min-w-0">
        {song ? (
          <p className="flex min-w-0 items-baseline gap-2.5">
            <span className="type-title min-w-0 max-w-full truncate text-cream">
              {song.title}
            </span>
            <span aria-hidden="true" className="shrink-0 text-cream/45">
              ·
            </span>
            <span className="type-label min-w-0 max-w-full shrink-[2] truncate text-cream/70">
              {song.artist || 'Puget Sound'}
            </span>
          </p>
        ) : (
          <p className="type-body text-cream/70">Ефір тихий</p>
        )}
      </div>
      {previewing && (
        <LampIconButton
          tone="dark"
          size="sm"
          label="Зупинити"
          icon={<StopIcon />}
          onClick={stop}
          className="shrink-0 text-cream"
        />
      )}
    </div>
  );
};
