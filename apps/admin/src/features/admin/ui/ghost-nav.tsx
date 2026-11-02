import clsx from 'clsx';
import type { ButtonHTMLAttributes } from 'react';

type GhostNavProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  active?: boolean;
};

/**
 * The island's navigation, in the player's own words: a label with no glass
 * around it, underlined in the label red where you are. (The player's chat
 * header draws its listeners count the same way.)
 */
export const GhostNav = ({
  active = false,
  className,
  type = 'button',
  ...rest
}: GhostNavProps) => (
  <button
    type={type}
    aria-current={active ? 'page' : undefined}
    className={clsx(
      'type-label cursor-pointer whitespace-nowrap rounded-full px-3 py-2 underline-offset-[6px] transition-colors',
      active
        ? 'text-cream underline decoration-accent decoration-2'
        : 'text-cream/70 hover:text-cream',
      className,
    )}
    {...rest}
  />
);
