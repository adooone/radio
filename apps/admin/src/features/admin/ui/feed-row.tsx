import clsx from 'clsx';
import type { ReactNode } from 'react';

export type FeedTone = 'default' | 'warn' | 'alert' | 'muted';

/* One line of a feed: the time, then the words — plain cream for the
   ordinary, the glow for a caution, the label red for trouble. */
const TONES: Record<FeedTone, string> = {
  default: 'text-cream/80',
  warn: 'text-glow',
  alert: 'text-accent',
  muted: 'text-cream/45',
};

export const FeedRow = ({
  time,
  tone = 'default',
  children,
  className,
}: {
  time: string;
  tone?: FeedTone;
  children: ReactNode;
  className?: string;
}) => (
  <div className={clsx('flex items-baseline gap-3', className)}>
    <span className="type-meta shrink-0 text-cream/55">{time}</span>
    <span className={clsx('min-w-0 font-sans text-[13px]', TONES[tone])}>
      {children}
    </span>
  </div>
);
