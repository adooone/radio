import type { NowPlaying } from '@/features/stream/use-now-playing';
import { useT } from '@/i18n';
import { LampIconButton, type LampSize } from '@dendelion/func-ui';

type TrackStripProps = {
  playing: boolean;
  quiet: boolean;
  onToggle: () => void;
  song: NowPlaying | null;
  /** The air's state in words, read where no track names itself. */
  status: string;
  lampSize: LampSize;
  /** The words' box: the island fixes its width, the chat's bar lets it flow. */
  wordsClassName?: string;
};

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

/**
 * The play lamp (unlit while the air is quiet) and the track and band names
 * — or the air's state — side by side: the heart of the controls island,
 * and the bar above the chat on small screens.
 */
export const TrackStrip = ({
  playing,
  quiet,
  onToggle,
  song,
  status,
  lampSize,
  wordsClassName = 'min-w-0 flex-1',
}: TrackStripProps) => {
  const t = useT();
  return (
    <>
      <LampIconButton
        tone={quiet ? 'dark' : 'red'}
        size={lampSize}
        label={t(playing ? 'vinyl.pause' : 'vinyl.listenLive')}
        icon={playing ? <PauseIcon /> : <PlayIcon />}
        onClick={onToggle}
        disabled={quiet}
        className={`shrink-0 disabled:cursor-default disabled:opacity-60 ${
          quiet ? 'text-cream' : 'text-ink'
        }`}
      />
      <div className={wordsClassName}>
        {song ? (
          // One line where the pill is wide; stacked on portrait, where it
          // shares a phone's width with two lamps.
          <p className="flex min-w-0 items-baseline gap-2.5 portrait:flex-col portrait:items-start portrait:gap-0.5">
            <span className="min-w-0 max-w-full truncate font-serif text-base font-semibold leading-tight text-cream">
              {song.title}
            </span>
            <span
              aria-hidden="true"
              className="shrink-0 text-cream/30 portrait:hidden"
            >
              ·
            </span>
            <span className="min-w-0 max-w-full shrink-[2] truncate font-sans text-[11px] font-medium uppercase tracking-[0.14em] text-cream/60">
              {song.artist || 'Puget Sound'}
            </span>
          </p>
        ) : (
          <p className="line-clamp-2 font-serif text-sm leading-snug text-cream/70 portrait:text-base">
            {status}
          </p>
        )}
      </div>
    </>
  );
};
