import * as Slider from '@radix-ui/react-slider';

type ControlsProps = {
  playing: boolean;
  quiet: boolean;
  onToggle: () => void;
  volume: number;
  onVolume: (volume: number) => void;
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

/** The custom controls row: play, the on-air lamp, volume — Radix under our skin. */
export const Controls = ({
  playing,
  quiet,
  onToggle,
  volume,
  onVolume,
}: ControlsProps) => (
  <div className="flex items-center justify-center gap-6">
    <button
      type="button"
      onClick={onToggle}
      disabled={quiet}
      aria-label={playing ? 'Пауза' : 'Слухати ефір'}
      className="play-btn flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full border-[1.5px] border-accent text-accent disabled:cursor-default disabled:opacity-50"
    >
      {playing ? <PauseIcon /> : <PlayIcon />}
    </button>
    <span className="flex items-center gap-2 font-sans text-xs tracking-[0.14em] text-cream/85">
      <span
        aria-hidden="true"
        className={`inline-block size-2 rounded-full ${
          quiet ? 'bg-cream/30' : 'live-dot bg-accent'
        }`}
      />
      {quiet ? 'ТИХО' : 'LIVE'}
    </span>
    <Slider.Root
      value={[volume]}
      max={1}
      step={0.01}
      onValueChange={(values) => onVolume(values[0] ?? volume)}
      aria-label="Гучність"
      className="relative flex h-5 w-28 touch-none select-none items-center"
    >
      <Slider.Track className="relative h-0.5 flex-1 rounded-full bg-accent/25">
        <Slider.Range className="vol-range absolute h-full rounded-full bg-accent" />
      </Slider.Track>
      <Slider.Thumb className="vol-thumb block size-3 cursor-pointer rounded-full bg-accent outline-none" />
    </Slider.Root>
  </div>
);
