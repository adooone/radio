import {
  collectionApi,
  useCollection,
  useRemoveItemFromCollection,
} from '@/services/api';
import type { Collection } from '@radio/types';
import { motion } from 'framer-motion';

type CollectionDetailProps = {
  collection: Collection;
};

export const CollectionDetail = ({ collection }: CollectionDetailProps) => {
  const { data: collectionWithItems, isLoading } = useCollection(collection.id);
  const removeItemFromCollection = useRemoveItemFromCollection();

  const handleRemoveItem = async (audioFileId: number, name: string) => {
    if (!confirm(`Remove "${name}" from this collection?`)) return;

    try {
      await removeItemFromCollection.mutateAsync({
        collectionId: collection.id,
        audioFileId,
      });
    } catch (error) {
      console.error('Failed to remove item:', error);
      alert('Failed to remove item from collection');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-gray-800/30 rounded animate-pulse" />
        <div className="space-y-3">
          {['s1', 's2', 's3'].map((id) => (
            <div
              key={id}
              className="h-16 bg-gray-800/30 rounded animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (!collectionWithItems) {
    return <div className="text-gray-400">Collection not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-700/50 pb-4">
        <h2 className="text-2xl font-bold text-gray-200">
          {collectionWithItems.name}
        </h2>
        {collectionWithItems.description && (
          <p className="text-gray-400 mt-2">
            {collectionWithItems.description}
          </p>
        )}
        <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
          <span
            className={`px-2 py-1 rounded-full text-xs ${
              collectionWithItems.isPublic
                ? 'bg-green-900/30 text-green-400'
                : 'bg-gray-700/50 text-gray-400'
            }`}
          >
            {collectionWithItems.isPublic ? 'Public' : 'Private'}
          </span>
          <span>{collectionWithItems.items?.length || 0} tracks</span>
          <span>
            Created{' '}
            {new Date(collectionWithItems.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>

      <div className="space-y-3">
        {collectionWithItems.items?.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            No audio files in this collection yet.
          </div>
        ) : (
          collectionWithItems.items?.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-4 p-4 bg-gray-800/30 border border-gray-700/50 rounded-lg hover:bg-gray-800/50 transition-colors"
            >
              <div className="flex-shrink-0 w-12 h-12 bg-gray-700/50 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  role="img"
                  aria-label="Audio file"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                  />
                </svg>
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-200 truncate">
                  {item.name}
                </h4>
                <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                  {item.duration && <span>{item.duration}</span>}
                  <span>{item.format.toUpperCase()}</span>
                  <span>
                    Added {new Date(item.addedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const url = collectionApi.getAudioFileStreamUrl(
                      item.audioFileId,
                    );
                    window.open(url, '_blank');
                  }}
                  className="p-2 text-gray-400 hover:text-gray-300 hover:bg-gray-700/50 rounded transition-colors"
                  title="Play/Download"
                >
                  ▶️
                </button>
                <button
                  type="button"
                  onClick={() => handleRemoveItem(item.audioFileId, item.name)}
                  className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-900/20 rounded transition-colors"
                  title="Remove from collection"
                >
                  🗑️
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};
