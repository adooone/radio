import type { Album } from '@radio/types';
import clsx from 'clsx';

/** The album's sleeve, square: its cover, or the dark board with its name. */
export const AlbumSleeve = ({
  album,
  className,
}: {
  album: Album;
  className?: string;
}) => {
  const year = album.releaseYear ?? album.year;
  return (
    <div
      className={clsx(
        'relative aspect-square w-full overflow-hidden bg-[#16100b] shadow-[10px_0_24px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.2),inset_0_-1px_0_rgba(0,0,0,0.5),inset_0_0_18px_rgba(0,0,0,0.35)]',
        className,
      )}
    >
      {album.coverImageUrl ? (
        <img
          src={album.coverImageUrl}
          alt={album.title}
          className="size-full object-cover"
        />
      ) : (
        <div className="flex size-full flex-col justify-between p-6">
          <span className="font-serif text-2xl font-semibold leading-tight text-cream">
            {album.title}
          </span>
          <span className="type-label text-cream/60">
            {album.artist}
            {year ? ` · ${year}` : ''}
          </span>
        </div>
      )}
    </div>
  );
};
