import { useDraftCover } from '@/services/api';
import clsx from 'clsx';
import { motion } from 'framer-motion';
import { useEffect, useMemo } from 'react';

type DraftCoverProps = {
  slug: string;
  hasCover: boolean;
  title: string;
  layoutId?: string;
};

export const DraftCover = ({
  slug,
  hasCover,
  title,
  layoutId,
}: DraftCoverProps) => {
  const { data: coverBlob } = useDraftCover(slug, hasCover);

  const blobUrl = useMemo(
    () => (coverBlob ? URL.createObjectURL(coverBlob) : null),
    [coverBlob],
  );

  useEffect(() => {
    return () => {
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
  }, [blobUrl]);

  return (
    <motion.div layoutId={layoutId} className={clsx(styles.frame)}>
      {blobUrl ? (
        <img src={blobUrl} alt={title} className={clsx(styles.image)} />
      ) : (
        <div className={clsx(styles.placeholder)}>
          <svg
            className="w-8 h-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-label="Немає обкладинки"
            role="img"
          >
            <title>Немає обкладинки</title>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
            />
          </svg>
        </div>
      )}
    </motion.div>
  );
};

const styles = {
  frame: ['w-full aspect-square bg-gray-700 rounded-lg overflow-hidden'],
  image: ['w-full h-full object-cover'],
  placeholder: ['w-full h-full flex items-center justify-center text-gray-500'],
} as const;
