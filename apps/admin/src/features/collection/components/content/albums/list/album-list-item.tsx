import type { Album } from '@radio/types';
import { Switch } from '@dendelion/mojo-ui';
import { AlbumCover } from './album-cover';
import { useTogglePublished } from '@/services/api';
import { useNotificationStore } from '@/stores/notification-store';

type AlbumListItemProps = {
  album: Album;
  onClick: (album: Album) => void;
};

export const AlbumListItem = ({ album, onClick }: AlbumListItemProps) => {
  const tags = album.tags ? JSON.parse(album.tags) : [];

  const togglePublished = useTogglePublished();
  const { addNotification } = useNotificationStore();

  const handleTogglePublished = (checked: boolean) => {
    togglePublished.mutate(
      { id: album.id, isPublished: checked },
      {
        onSuccess: () => {
          addNotification({
            type: 'success',
            title: checked ? 'Album is public' : 'Album is hidden',
            message: `"${album.title}" is now ${checked ? 'public' : 'hidden'}`,
          });
        },
        onError: (error) => {
          addNotification({
            type: 'error',
            title: 'Failed to update',
            message:
              error instanceof Error ? error.message : 'Unexpected error',
          });
        },
      },
    );
  };

  return (
    <div className="relative group">
      <div className="w-full flex items-center gap-3 p-3 rounded-lg transition-all bg-gray-800/30 hover:bg-gray-800/50 border border-transparent">
        <button
          type="button"
          className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer text-left"
          onClick={() => onClick(album)}
        >
          <AlbumCover coverImageUrl={album.coverImageUrl} title={album.title} />

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="font-medium text-gray-200 truncate">
                {album.title}
              </h4>
              <div
                className={`w-2 h-2 rounded-full flex-shrink-0 ${
                  album.hasMedia
                    ? 'bg-green-400 shadow-[0_0_4px_rgba(74,222,128,0.5)]'
                    : 'bg-gray-600'
                }`}
                title={
                  album.hasMedia ? 'Media files present' : 'No media files'
                }
              />
            </div>
            <p className="text-sm text-gray-400 truncate">{album.artist}</p>
            {album.year && (
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-gray-500">{album.year}</span>
              </div>
            )}
          </div>

          <div className="flex flex-col items-end gap-2 text-xs text-gray-500">
            {tags.length > 0 && (
              <div className="flex items-center gap-1 flex-wrap justify-end">
                {tags.slice(0, 3).map((tag: string) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 rounded-full bg-gray-700/50 text-gray-300 border border-gray-600/50"
                  >
                    {tag}
                  </span>
                ))}
                {tags.length > 3 && (
                  <span className="text-gray-500">+{tags.length - 3}</span>
                )}
              </div>
            )}
            <div className="flex flex-col items-end gap-1 whitespace-nowrap">
              <span>{new Date(album.createdAt).toLocaleDateString()}</span>
              {album.songCount !== undefined && (
                <span className="text-ember">
                  {album.songCount} {album.songCount === 1 ? 'track' : 'tracks'}
                </span>
              )}
            </div>
          </div>
        </button>

        <div
          className="flex flex-col items-center gap-1 flex-shrink-0 pl-2 border-l border-gray-700/50"
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => {
            if (e.key === 'Enter') e.stopPropagation();
          }}
        >
          <span className="text-[10px] text-gray-500 uppercase tracking-wider">
            {album.isPublic ? 'Public' : 'Hidden'}
          </span>
          <Switch
            variant="green"
            size="small"
            checked={!!album.isPublic}
            onChange={handleTogglePublished}
            disabled={togglePublished.isPending}
          />
        </div>
      </div>
    </div>
  );
};
