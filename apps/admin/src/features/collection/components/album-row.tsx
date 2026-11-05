import { Stamp } from '@dendelion/func-ui';
import type { Album } from '@radio/types';
import clsx from 'clsx';
import { tracksCount } from '../lib/album-meta';

type AlbumRowProps = {
  album: Album;
  selected: boolean;
  onAir: boolean;
  onClick: () => void;
};

/** One record in the list: its small sleeve, title, artist and year, the
    states worth a chip, and how many tracks it holds. The open one is lit. */
export const AlbumRow = ({
  album,
  selected,
  onAir,
  onClick,
}: AlbumRowProps) => {
  const year = album.releaseYear ?? album.year;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={clsx(
        'flex w-full cursor-pointer items-center gap-4 rounded-[18px] border px-[18px] py-3 text-left transition-colors',
        selected
          ? 'border-lamp/35 bg-lamp/[0.07]'
          : 'border-cream/[0.08] hover:border-cream/20',
      )}
    >
      <span className="size-[46px] shrink-0 overflow-hidden bg-[#16100b] shadow-[inset_0_1px_0_rgba(255,255,255,0.16),inset_0_0_10px_rgba(0,0,0,0.4)]">
        {album.coverImageUrl && (
          <img
            src={album.coverImageUrl}
            alt=""
            loading="lazy"
            className="size-full object-cover"
          />
        )}
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="truncate font-serif text-[17px] font-semibold text-cream">
          {album.title}
        </span>
        <span className="truncate font-sans text-xs text-cream/60">
          {album.artist}
          {year ? ` · ${year}` : ''}
        </span>
      </span>
      {onAir && (
        <Stamp variant="error" dot>
          в ефірі
        </Stamp>
      )}
      {!album.coverImageUrl && <Stamp variant="neutral">без обкладинки</Stamp>}
      <span className="shrink-0 font-sans text-xs tabular-nums text-cream/60">
        {tracksCount(album.songCount ?? 0)}
      </span>
    </button>
  );
};
