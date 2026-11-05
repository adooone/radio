import clsx from 'clsx';

export type DotTone = 'live' | 'lit' | 'quiet';

/* Three small lights: the breathing red of the air, the steady amber of a
   lamp that is on, and the dim cream of one that is off. */
const TONES: Record<DotTone, string> = {
  live: 'size-2 bg-accent live-dot',
  lit: 'size-[7px] bg-lamp shadow-[0_0_8px_rgba(224,139,38,0.7)]',
  quiet: 'size-2 bg-cream/30',
};

export const Dot = ({
  tone,
  className,
}: {
  tone: DotTone;
  className?: string;
}) => (
  <span
    aria-hidden="true"
    className={clsx(
      'inline-block shrink-0 rounded-full',
      TONES[tone],
      className,
    )}
  />
);
