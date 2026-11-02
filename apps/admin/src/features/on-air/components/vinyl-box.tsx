import type { OnAirState } from '@radio/types';

interface VinylBoxProps {
  onAir: OnAirState | null | undefined;
  playing: boolean;
}

export const VinylBox = ({ onAir, playing }: VinylBoxProps) => (
  <div className="relative flex h-44 w-72 shrink-0 items-center">
    <div
      className={`absolute top-3 left-24 size-36 rounded-full bg-accent shadow-[0_0_0_6px_rgb(10_6_5)] ring-1 ring-cream/10 ${
        playing ? 'animate-[spin_6s_linear_infinite]' : ''
      }`}
    >
      <span className="absolute inset-[38%] rounded-full bg-glow" />
      <span className="absolute inset-[48%] rounded-full bg-ink" />
    </div>
    <div className="relative z-10 size-44 overflow-hidden rounded-md bg-coal-calm shadow-[8px_0_24px_rgb(0_0_0/0.6)] ring-1 ring-cream/10">
      {onAir?.cover ? (
        <img
          src={onAir.cover}
          alt={onAir.title}
          className="size-full object-cover"
        />
      ) : (
        <span className="flex size-full items-center justify-center font-sans text-xs font-semibold uppercase tracking-[0.14em] text-cream/45">
          Ефір
        </span>
      )}
    </div>
  </div>
);
