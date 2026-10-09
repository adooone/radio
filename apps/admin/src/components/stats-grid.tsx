import clsx from 'clsx';
import type { FC } from 'react';

export interface StatItem {
  label: string;
  value: string | number;
  suffix?: string;
  highlight?: boolean;
}

export interface StatsGridProps {
  stats: StatItem[];
  columns?: 2 | 3 | 4;
}

export const StatsGrid: FC<StatsGridProps> = ({ stats, columns = 2 }) => {
  const formatValue = (value: string | number, suffix?: string) => {
    if (typeof value === 'number') {
      if (suffix === '%') return `${value.toFixed(1)}%`;
      if (suffix === 'MB') return `${(value / 1024 / 1024).toFixed(1)}MB`;
      if (suffix === 'KB') return `${(value / 1024).toFixed(1)}KB`;
      return value.toString();
    }
    return value;
  };

  const gridCols = {
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
  };

  return (
    <div className={clsx('grid gap-4 text-sm', gridCols[columns])}>
      {stats.map((stat) => (
        <div key={stat.label} className="flex flex-col space-y-1">
          <span className="text-sun/80 uppercase tracking-wide text-xs font-medium">
            {stat.label}
          </span>
          <span
            className={clsx(
              'font-mono font-semibold text-base',
              stat.highlight ? 'text-red-400' : 'text-white',
            )}
          >
            {formatValue(stat.value, stat.suffix)}
            {stat.suffix && !['%', 'MB', 'KB'].includes(stat.suffix) && (
              <span className="ml-1 text-sun/50 text-xs">{stat.suffix}</span>
            )}
          </span>
        </div>
      ))}
    </div>
  );
};
