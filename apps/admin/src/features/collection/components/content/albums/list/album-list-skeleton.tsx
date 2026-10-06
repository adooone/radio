import { useMemo } from 'react';

export const AlbumListSkeleton = () => {
  const skeletonKeys = useMemo(
    () => Array.from({ length: 3 }, (_, i) => `album-skeleton-${i}`),
    [],
  );

  return (
    <div className="space-y-3">
      {skeletonKeys.map((key) => (
        <div key={key} className="h-24 bg-gray-100/10 rounded-lg" />
      ))}
    </div>
  );
};
