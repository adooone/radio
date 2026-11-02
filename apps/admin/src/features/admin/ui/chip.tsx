import clsx from 'clsx';
import type { ReactNode } from 'react';
import { Dot, type DotTone } from './dot';

export type ChipTone = 'quiet' | 'cream' | 'lit' | 'red';

/* A small outlined label: a state on a row (on air, no cover, a role, a
   stage). Not a button. */
const TONES: Record<ChipTone, string> = {
  quiet: 'border-cream/[0.14] text-cream/60',
  cream: 'border-cream/20 text-cream/70',
  lit: 'border-lamp/45 bg-lamp/[0.14] text-glow shadow-[0_0_14px_rgba(224,139,38,0.25)]',
  red: 'border-accent/40 text-accent',
};

export const Chip = ({
  tone = 'quiet',
  dot,
  className,
  children,
}: {
  tone?: ChipTone;
  dot?: DotTone;
  className?: string;
  children: ReactNode;
}) => (
  <span
    className={clsx(
      'inline-flex shrink-0 items-center gap-[7px] whitespace-nowrap rounded-full border px-3 py-[5px] font-sans text-[10px] font-semibold uppercase leading-none tracking-[0.12em]',
      TONES[tone],
      className,
    )}
  >
    {dot && <Dot tone={dot} className={dot === 'live' ? 'size-1.5' : ''} />}
    {children}
  </span>
);
