import { useCollectionData } from '@/features/collection/hooks';
import { useCollectionStore } from '@/features/collection/store/collection-store';
import {
  filterAlbums,
  sortAlbums,
} from '@/features/collection/utils/album-helpers';
import type { Album } from '@radio/types';
import { motion } from 'framer-motion';
import { useMemo, useRef } from 'react';
import { AlbumListEmpty } from './list/album-list-empty';
import { AlbumListHeaderRow } from './list/album-list-header-row';
import { AlbumListItem } from './list/album-list-item';
import { AlbumListSkeleton } from './list/album-list-skeleton';

export const AlbumList = () => {
  const { searchQuery, filters, sortBy, sortOrder, setSelectedAlbum } =
    useCollectionStore();
  const { albums, albumsLoading: isLoading } = useCollectionData();

  const filteredAndSortedAlbums = useMemo(() => {
    const filtered = filterAlbums(albums ?? [], filters, searchQuery);
    return sortAlbums(filtered, sortBy, sortOrder);
  }, [albums, filters, searchQuery, sortBy, sortOrder]);

  // Track if albums list has actually changed (not just variant)
  const albumsKey = useMemo(
    () => filteredAndSortedAlbums.map((a) => a.id).join(','),
    [filteredAndSortedAlbums],
  );
  const prevAlbumsKeyRef = useRef<string>('');

  // Check synchronously if albums changed (not variant)
  const albumsChanged = prevAlbumsKeyRef.current !== albumsKey;
  if (albumsChanged) {
    prevAlbumsKeyRef.current = albumsKey;
  }

  // Only animate if albums actually changed, not just variant
  const shouldAnimate = albumsChanged;

  const handleAlbumClick = (album: Album) => {
    setSelectedAlbum(album);
  };

  if (isLoading) {
    return <AlbumListSkeleton />;
  }

  if (!albums?.length) {
    return <AlbumListEmpty />;
  }

  if (filteredAndSortedAlbums.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <svg
          className="w-16 h-16 text-gray-600 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <h3 className="text-lg font-medium text-gray-300 mb-2">
          Нічого не знайдено
        </h3>
        <p className="text-sm text-gray-500">
          Спробуйте змінити параметри пошуку або фільтри
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <AlbumListHeaderRow />
      <motion.div
        key={albumsKey}
        className="space-y-3"
        variants={shouldAnimate ? containerVariants : undefined}
        initial={shouldAnimate ? 'hidden' : 'visible'}
        animate="visible"
      >
        {filteredAndSortedAlbums.map((album) => (
          <motion.div
            key={album.id}
            variants={shouldAnimate ? itemVariants : undefined}
            initial={shouldAnimate ? 'hidden' : 'visible'}
            animate="visible"
          >
            <AlbumListItem album={album} onClick={handleAlbumClick} />
          </motion.div>
        ))}
        <div className="h-6" />
      </motion.div>
    </div>
  );
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.03,
      delayChildren: 0,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.2,
      ease: 'easeOut',
    },
  },
};
