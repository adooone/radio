import { LampIconButton, LampMeter } from '@dendelion/func-ui';
import type { NowPlaying } from '@/features/stream/use-now-playing';

type ControlIslandProps = {
  playing: boolean;
  quiet: boolean;
  onToggle: () => void;
  volume: number;
  onVolume: (volume: number) => void;
  song: NowPlaying | null;
  /** The air's state in words, read where no track names itself. */
  status: string;
};

const PlayIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" aria-hidden="true">
    <path d="M3.5 1.8c0-.6.65-.97 1.17-.67l8 4.7a.78.78 0 0 1 0 1.34l-8 4.7a.78.78 0 0 1-1.17-.67V1.8Z" />
  </svg>
);

const PauseIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" aria-hidden="true">
    <rect x="2.5" y="1.5" width="3.2" height="11" rx="1" />
    <rect x="8.3" y="1.5" width="3.2" height="11" rx="1" />
  </svg>
);

/**
 * The listening controls on an island, like the admin's navigation island —
 * the same pill — with func-ui's lamp controls glowing on it: the play lamp
 * (unlit while the air is quiet), the track and band names (or the air's
 * state), the on-air dot and a lamp-meter volume with an invisible range
 * input over it for the hand and the keyboard.
 */
export const ControlIsland = ({
  playing,
  quiet,
  onToggle,
  volume,
  onVolume,
  song,
  status,
}: ControlIslandProps) => (
  <div className="control-island flex max-w-full items-center gap-4 rounded-full border border-cream/10 px-6 py-3">
    <LampIconButton
      tone={quiet ? 'dark' : 'red'}
      size="md"
      label={playing ? 'Pause' : 'Listen live'}
      icon={playing ? <PauseIcon /> : <PlayIcon />}
      onClick={onToggle}
      disabled={quiet}
      className="shrink-0 text-cream disabled:cursor-default disabled:opacity-60"
    />
    <div className="w-[340px] min-w-0 shrink">
      {song ? (
        <>
          <p className="truncate font-serif text-[15px] leading-tight text-cream">
            {song.title}
          </p>
          <p className="mt-0.5 truncate font-sans text-[11px] uppercase tracking-[0.14em] text-cream/55">
            {song.artist || 'Puget Sound'}
          </p>
        </>
      ) : (
        <p className="line-clamp-2 font-serif text-sm leading-snug text-cream/70">
          {status}
        </p>
      )}
    </div>
    <span className="hidden shrink-0 items-center gap-2 border-l border-cream/10 pl-4 font-sans text-[11px] tracking-[0.14em] text-cream/85 sm:flex">
      <span
        aria-hidden="true"
        className={`inline-block size-2 rounded-full ${
          quiet ? 'bg-cream/30' : 'live-dot bg-accent'
        }`}
      />
      {quiet ? 'OFF AIR' : 'LIVE'}
    </span>
    <div className="relative hidden shrink-0 border-l border-cream/10 pl-4 sm:block">
      <LampMeter
        aria-hidden="true"
        value={volume}
        max={1}
        tone="red"
        size="sm"
        lampCount={8}
        className="block"
      />
      <input
        type="range"
        min={0}
        max={1}
        step={0.05}
        value={volume}
        onChange={(e) => onVolume(Number(e.target.value))}
        aria-label="Volume"
        className="absolute inset-y-0 left-4 right-0 cursor-pointer appearance-none opacity-0"
      />
    </div>
  </div>
);
