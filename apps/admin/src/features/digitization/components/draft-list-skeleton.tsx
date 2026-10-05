import clsx from 'clsx';
import { useMemo } from 'react';

export const DraftListSkeleton = () => {
  const skeletonKeys = useMemo(
    () => Array.from({ length: 10 }, (_, i) => `draft-skeleton-${i}`),
    [],
  );

  return (
    <div className={clsx(styles.grid)}>
      {skeletonKeys.map((key) => (
        <div key={key} className={clsx(styles.tile)} />
      ))}
    </div>
  );
};

const styles = {
  grid: [
    'grid gap-4',
    'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5',
  ],
  tile: ['aspect-[3/4] bg-gray-100/10 rounded-lg animate-pulse'],
} as const;
