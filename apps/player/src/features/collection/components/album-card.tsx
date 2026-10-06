import type { Album } from '@radio/types';

type AlbumCardProps = {
  album: Album;
  onClick: () => void;
};

export const AlbumCard = ({ album, onClick }: AlbumCardProps) => {
  const tags = album.tags ? JSON.parse(album.tags) : [];

  return (
    <button
      type="button"
      onClick={onClick}
      className="group cursor-pointer transition-all duration-300 hover:scale-105 text-left w-full"
    >
      <div className="relative aspect-square rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-shadow bg-neutral-800/80 backdrop-blur-sm border border-neutral-700/50">
        {album.coverImageUrl ? (
          <img
            src={album.coverImageUrl}
            alt={album.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-neutral-700 to-neutral-800">
            <svg
              aria-hidden="true"
              className="w-20 h-20 text-neutral-500"
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

        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {album.year && (
          <div className="absolute top-2 right-2 px-2 py-1 bg-neutral-800/90 backdrop-blur-sm rounded-full text-xs font-semibold text-neutral-200 border border-neutral-600">
            {album.year}
          </div>
        )}
      </div>

      <div className="mt-3">
        <h3 className="font-bold text-neutral-100 truncate group-hover:text-neutral-300 transition-colors">
          {album.title}
        </h3>
        <p className="text-sm text-neutral-400 truncate">{album.artist}</p>

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {tags.slice(0, 2).map((tag: string) => (
              <span
                key={tag}
                className="text-xs px-2 py-0.5 bg-neutral-800 text-neutral-300 rounded-full border border-neutral-700"
              >
                {tag}
              </span>
            ))}
            {tags.length > 2 && (
              <span className="text-xs text-neutral-500">
                +{tags.length - 2}
              </span>
            )}
          </div>
        )}
      </div>
    </button>
  );
};
