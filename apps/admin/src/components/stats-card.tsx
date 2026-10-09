import { Glass } from '@dendelion/func-ui';
import clsx from 'clsx';
import type { FC } from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  isHighlight?: boolean;
  className?: string;
}

export const StatsCard: FC<StatsCardProps> = ({
  title,
  value,
  isHighlight = false,
  className,
}) => {
  return (
    <Glass className={clsx('flex flex-col p-4', className)}>
      <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-sun/90">
        {title}
      </h3>
      <p
        className={clsx(
          'font-mono text-2xl font-semibold text-white',
          isHighlight && 'text-red-400',
        )}
      >
        {value}
      </p>
    </Glass>
  );
};
