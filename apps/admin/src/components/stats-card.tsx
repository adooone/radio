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
    <div
      className={clsx(
        // Dark bordered tile like mojo's StatsCard — func-ui Glass renders a
        // light surface that is illegible on the admin's dark theme.
        'flex flex-col rounded-xl border border-white/10 bg-[#1e1e1e] p-4',
        'shadow-[inset_2px_2px_4px_rgba(255,255,255,0.03),inset_-2px_-2px_6px_rgba(0,0,0,0.4)]',
        className,
      )}
    >
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
    </div>
  );
};
