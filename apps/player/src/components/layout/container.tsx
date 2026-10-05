import { classes } from '@/styles';
import clsx from 'clsx';
import type { PropsWithChildren } from 'react';

interface ContainerProps extends PropsWithChildren {
  /** Makes the container take full height and width */
  full?: boolean;
  /** Applies a foggy glass effect to the container */
  fog?: boolean;
  /** Makes the container content scrollable */
  scrollable?: boolean;
}

export const Container = ({
  children,
  scrollable,
  full,
  fog,
}: ContainerProps) => {
  const isDefault = !fog && !full;

  return (
    <div className={clsx(classes.container)}>
      <div
        className={clsx(
          fog && classes.fogPanel,
          full && classes.fullPaperPanel,
          isDefault && classes.paperPanel,
        )}
      >
        <div className={clsx(scrollable && classes.scrollablePage)}>
          {children}
        </div>
      </div>
    </div>
  );
};
