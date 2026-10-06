import { useNowPlayingStore } from '@/stores/now-playing-store';
import clsx from 'clsx';
import type React from 'react';

interface NowPlayingProps {
  className?: string;
}

const formatTime = (seconds: number): string => {
  if (!seconds || !Number.isFinite(seconds)) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
};

export const NowPlaying: React.FC<NowPlayingProps> = ({ className }) => {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    togglePlayPause,
    stop,
  } = useNowPlayingStore();

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      className={clsx(styles.container, className)}
      title={
        currentTrack
          ? `${currentTrack.title} – ${currentTrack.artist}`
          : 'Nothing playing'
      }
    >
      {/* Play/Pause button */}
      {currentTrack ? (
        <button
          type="button"
          onClick={togglePlayPause}
          className={clsx(styles.playButton)}
          title={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? (
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-label="Pause"
              role="img"
            >
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
            </svg>
          ) : (
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-label="Play"
              role="img"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>
      ) : (
        <div className={clsx(styles.icon)}>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-label="Music note"
            role="img"
          >
            <path
              d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"
              fill="currentColor"
            />
          </svg>
        </div>
      )}

      {/* Track info + progress */}
      <div className={clsx(styles.content)}>
        <div className={clsx(styles.title)}>
          {currentTrack ? currentTrack.title : 'Nothing playing'}
        </div>
        <div className={clsx(styles.meta)}>
          <span className={clsx(styles.artist)}>
            {currentTrack ? currentTrack.artist : '—'}
          </span>
          {currentTrack && duration > 0 && (
            <span className={clsx(styles.time)}>
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          )}
        </div>
        {/* Mini progress bar */}
        {currentTrack && (
          <div className={clsx(styles.progressBar)}>
            <div
              className={clsx(styles.progressFill)}
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>

      {/* Status dot + stop button */}
      {currentTrack && (
        <div className={clsx(styles.controls)}>
          {isPlaying && <div className={clsx(styles.dot)} />}
          <button
            type="button"
            onClick={stop}
            className={clsx(styles.stopButton)}
            title="Stop"
          >
            <svg
              width="10"
              height="10"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-label="Stop"
              role="img"
            >
              <path d="M6 6h12v12H6z" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: [
    'flex items-center gap-2.5 px-4',
    'transition-all duration-300',
    'select-none text-paper-fog',
    'shadow-lg',
  ],
  icon: ['text-sun/90', 'drop-shadow-sm'],
  playButton: [
    'flex-shrink-0 w-7 h-7 rounded-full',
    'flex items-center justify-center',
    'bg-sun/90 text-stone-900 hover:bg-sun',
    'transition-colors cursor-pointer',
  ],
  content: ['flex flex-col min-w-0 items-start gap-0.5'],
  title: ['text-sm font-semibold whitespace-nowrap', 'leading-tight'],
  meta: ['flex items-center gap-2'],
  artist: ['text-xs text-paper/80 truncate', 'leading-tight', 'max-w-32'],
  time: ['text-xs text-paper/50 tabular-nums', 'leading-tight'],
  progressBar: ['w-24 h-0.5 rounded-full bg-white/10 overflow-hidden mt-0.5'],
  progressFill: [
    'h-full bg-sun/80 rounded-full transition-[width] duration-200',
  ],
  controls: ['flex items-center gap-1.5 ml-1'],
  dot: ['w-2 h-2 rounded-full bg-sun', 'animate-pulse', 'drop-shadow-sm'],
  stopButton: [
    'flex-shrink-0 w-5 h-5 rounded',
    'flex items-center justify-center',
    'text-paper/50 hover:text-paper/90',
    'transition-colors cursor-pointer',
  ],
} as const;
