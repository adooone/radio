import clsx from 'clsx';
import type { ReactNode } from 'react';
import { Dot, type DotTone } from './dot';

/* A figure with its label and a note under it, standing on the ink — no
   tile. The label can carry a lamp when the figure is a service's state. */
export const Stat = ({
  label,
  value,
  note,
  dot,
  className,
}: {
  label: ReactNode;
  value: ReactNode;
  note?: ReactNode;
  dot?: DotTone;
  className?: string;
}) => (
  <div className={clsx('flex min-w-0 flex-col gap-2', className)}>
    <span className="type-label flex items-center gap-2 text-cream/60">
      {dot && <Dot tone={dot} />}
      {label}
    </span>
    <span className="truncate font-serif text-[26px] font-semibold leading-none tabular-nums text-cream">
      {value}
    </span>
    {note && <span className="font-sans text-[11px] text-cream/60">{note}</span>}
  </div>
);
