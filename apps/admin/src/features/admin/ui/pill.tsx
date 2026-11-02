import clsx from 'clsx';
import type { ButtonHTMLAttributes } from 'react';

export type PillTone = 'ghost' | 'lit' | 'red' | 'danger' | 'quiet';
export type PillSize = 'sm' | 'md';

type PillProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  tone?: PillTone;
  size?: PillSize;
};

/* The mockups' pills: a ghost outline for most actions, the lit lamp glass
   for the one primary action a screen has, the label red for putting on
   air, a bare red outline for taking off or signing out, and a quiet
   borderless pill for the tab that isn't open. */
const TONES: Record<PillTone, string> = {
  ghost: 'border-cream/[0.14] bg-cream/[0.04] text-cream/75 hover:text-cream',
  lit: 'border-lamp/45 bg-lamp/[0.16] text-glow shadow-[0_0_18px_rgba(224,139,38,0.25)]',
  red: 'border-accent/45 bg-accent/[0.12] text-accent shadow-[0_0_18px_rgba(255,86,71,0.2)]',
  danger: 'border-accent/40 bg-transparent text-accent',
  quiet: 'border-transparent bg-transparent text-cream/60 hover:text-cream',
};

const SIZES: Record<PillSize, string> = {
  sm: 'px-4 py-2 text-[11px] tracking-[0.14em]',
  md: 'px-6 py-[11px] text-[12px] tracking-[0.12em]',
};

export const Pill = ({
  tone = 'ghost',
  size = 'md',
  className,
  type = 'button',
  ...rest
}: PillProps) => (
  <button
    type={type}
    className={clsx(
      'inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-full border font-sans font-semibold uppercase leading-none transition-colors disabled:cursor-not-allowed disabled:opacity-50',
      TONES[tone],
      SIZES[size],
      className,
    )}
    {...rest}
  />
);
