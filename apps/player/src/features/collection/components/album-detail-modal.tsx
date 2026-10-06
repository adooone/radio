import { type AlbumWithSongs, albumApi } from '@/services/api/album-api';
import { useEffect } from 'react';

type AlbumDetailModalProps = {
  album: AlbumWithSongs;
  onClose: () => void;
};

export const AlbumDetailModal = ({ album, onClose }: AlbumDetailModalProps) => {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const tags = album.tags ? JSON.parse(album.tags) : [];

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
      onKeyDown={(e) => {
        if (e.key === 'Escape') onClose();
      }}
      role="presentation"
    >
      <div className="bg-neutral-900 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-neutral-700">
        <div className="relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 bg-neutral-800/90 rounded-full hover:bg-neutral-700 transition-colors"
          >
            <svg
              aria-hidden="true"
              className="w-6 h-6 text-neutral-200"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          <div className="flex flex-col md:flex-row gap-8 p-8 overflow-y-auto max-h-[90vh]">
            <div className="flex-shrink-0">
              <div className="w-64 h-64 rounded-lg overflow-hidden shadow-lg">
                {album.coverImageUrl ? (
                  <img
                    src={album.coverImageUrl}
                    alt={album.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-neutral-700 to-neutral-800">
                    <svg
                      aria-hidden="true"
                      className="w-24 h-24 text-neutral-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                      />
                    </svg>
                  </div>
                )}
              </div>

              {tags.length > 0 && (
                <div className="mt-4">
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag: string) => (
                      <span
                        key={tag}
                        className="px-3 py-1 bg-neutral-800 text-neutral-300 rounded-full text-sm font-medium border border-neutral-700"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex-1">
              <div className="mb-6">
                <h2 className="text-3xl font-bold text-neutral-100 mb-2">
                  {album.title}
                </h2>
                <p className="text-xl text-neutral-400 mb-2">{album.artist}</p>
                {album.year && (
                  <p className="text-sm text-neutral-500">{album.year}</p>
                )}
                {album.description && (
                  <p className="text-neutral-300 mt-4">{album.description}</p>
                )}
              </div>

              <div className="border-t border-neutral-700 pt-6">
                <h3 className="text-lg font-semibold text-neutral-100 mb-4">
                  Tracks ({album.songs.length})
                </h3>
                <div className="space-y-2">
                  {album.songs
                    .sort((a, b) => a.trackNumber - b.trackNumber)
                    .map((song) => (
                      <div
                        key={song.id}
                        className="flex items-center gap-4 p-3 rounded-lg hover:bg-neutral-800 transition-colors group border border-transparent hover:border-neutral-700"
                      >
                        <div className="flex-shrink-0 w-8 text-center text-neutral-500 font-medium">
                          {song.trackNumber}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-neutral-200">
                            {song.title}
                          </p>
                          {song.artist && song.artist !== album.artist && (
                            <p className="text-sm text-neutral-400">
                              {song.artist}
                            </p>
                          )}
                        </div>
                        <div className="text-sm text-neutral-500">
                          {song.duration}
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const url = albumApi.getAudioStreamUrl(
                              song.audioFileId,
                            );
                            window.open(url, '_blank');
                          }}
                          className="opacity-0 group-hover:opacity-100 p-2 text-neutral-300 hover:bg-neutral-700 rounded-full transition-all"
                          title="Play"
                        >
                          <svg
                            aria-hidden="true"
                            className="w-5 h-5"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </button>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
