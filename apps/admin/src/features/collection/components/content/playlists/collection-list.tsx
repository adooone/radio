import { useDeleteCollection, useUserCollections } from '@/services/api';
import type { Collection } from '@radio/types';
import clsx from 'clsx';
import { motion } from 'framer-motion';
import { useState } from 'react';

type CollectionListProps = {
  onCollectionClick: (collection: Collection) => void;
};

export const CollectionList = ({ onCollectionClick }: CollectionListProps) => {
  const { data: collections, isLoading, error } = useUserCollections();
  const deleteCollection = useDeleteCollection();
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

    setDeletingId(id);
    try {
      await deleteCollection.mutateAsync(id);
    } catch (error) {
      console.error('Failed to delete collection:', error);
      alert('Failed to delete collection');
    } finally {
      setDeletingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {['s1', 's2', 's3'].map((id) => (
          <div
            key={id}
            className="h-16 bg-gray-800/30 rounded-lg animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-400 p-4 bg-red-900/30 rounded-lg border border-red-500/30">
        {error instanceof Error ? error.message : 'Failed to load collections'}
      </div>
    );
  }

  if (!collections?.length) {
    return (
      <div className="text-gray-400 text-center py-8">
        No collections yet. Create your first collection!
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        ease: 'easeOut',
      },
    },
  };

  return (
    <motion.div
      className="space-y-3 h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {collections.map((collection) => (
        <motion.div
          key={collection.id}
          variants={itemVariants}
          className="w-full flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all text-left bg-gray-800/30 hover:bg-gray-800/50 border border-transparent"
          onClick={() => onCollectionClick(collection)}
        >
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-gray-200 truncate">
              {collection.name}
            </h3>
            {collection.description && (
              <p className="text-sm text-gray-400 truncate mt-1">
                {collection.description}
              </p>
            )}
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span
                className={`text-xs px-2 py-0.5 rounded ${
                  collection.isPublic
                    ? 'bg-green-900/30 text-green-400'
                    : 'bg-gray-700/50 text-gray-400'
                }`}
              >
                {collection.isPublic ? 'Public' : 'Private'}
              </span>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1 text-xs text-gray-500 whitespace-nowrap">
            <span>{new Date(collection.createdAt).toLocaleDateString()}</span>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(collection.id, collection.name);
            }}
            disabled={deletingId === collection.id}
            className={clsx(
              'p-2 text-gray-400 hover:text-red-400 hover:bg-red-900/20 rounded transition-colors',
              deletingId === collection.id && 'opacity-50 cursor-not-allowed',
            )}
            aria-label="Delete collection"
          >
            {deletingId === collection.id ? (
              <span className="text-xs">...</span>
            ) : (
              <svg
                aria-hidden="true"
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            )}
          </button>
        </motion.div>
      ))}
    </motion.div>
  );
};
