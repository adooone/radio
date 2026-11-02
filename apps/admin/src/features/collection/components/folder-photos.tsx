import { useAlbumPhotos } from '@/services/api';
import clsx from 'clsx';
import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { usePhotoBlob } from '../hooks';

const TILE =
  'size-[68px] shrink-0 overflow-hidden border border-cream/10 shadow-[inset_0_0_12px_rgba(0,0,0,0.45)]';

const Thumbnail = ({
  albumId,
  filename,
  onOpen,
}: {
  albumId: number;
  filename: string;
  onOpen: () => void;
}) => {
  const { url, failed } = usePhotoBlob(albumId, filename);
  if (failed) {
    return (
      <div className={clsx(TILE, 'flex items-center justify-center bg-cream/10 text-[10px] text-cream/45')}>
        не читається
      </div>
    );
  }
  if (!url) return <div className={clsx(TILE, 'animate-pulse bg-cream/5')} />;
  return (
    <button
      type="button"
      onClick={onOpen}
      className={clsx(TILE, 'cursor-pointer bg-cream/10 transition-shadow hover:ring-2 hover:ring-glow/50 focus:outline-none focus:ring-2 focus:ring-glow')}
    >
      <img src={url} alt={filename} className="size-full object-cover" />
    </button>
  );
};

/** One photo over the whole stage, with the keyboard walking the set. */
const Lightbox = ({
  albumId,
  photos,
  current,
  onClose,
  onNavigate,
}: {
  albumId: number;
  photos: string[];
  current: string;
  onClose: () => void;
  onNavigate: (filename: string) => void;
}) => {
  const { url, failed } = usePhotoBlob(albumId, current);
  const index = photos.indexOf(current);
  const hasPrev = index > 0;
  const hasNext = index >= 0 && index < photos.length - 1;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && hasPrev) {
        e.preventDefault();
        onNavigate(photos[index - 1]);
      }
      if (e.key === 'ArrowRight' && hasNext) {
        e.preventDefault();
        onNavigate(photos[index + 1]);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, onNavigate, hasPrev, hasNext, photos, index]);

  const onBackdrop = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) onClose();
    },
    [onClose],
  );

  const arrow =
    'absolute top-1/2 z-10 -translate-y-1/2 rounded-full px-3 py-2 font-serif text-3xl text-cream/45 transition-colors hover:text-cream';

  return createPortal(
    <dialog
      open
      aria-label="Перегляд фото"
      onClick={onBackdrop}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClose();
        }
      }}
      className="fixed inset-0 z-[9999] flex size-full max-h-none max-w-none items-center justify-center border-0 bg-black/85 p-8"
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Закрити"
        className="absolute top-6 right-8 z-10 font-sans text-2xl text-cream/45 hover:text-cream"
      >
        ✕
      </button>
      {hasPrev && (
        <button
          type="button"
          onClick={() => onNavigate(photos[index - 1])}
          aria-label="Попереднє фото"
          className={clsx(arrow, 'left-6')}
        >
          ‹
        </button>
      )}
      {hasNext && (
        <button
          type="button"
          onClick={() => onNavigate(photos[index + 1])}
          aria-label="Наступне фото"
          className={clsx(arrow, 'right-6')}
        >
          ›
        </button>
      )}
      {failed ? (
        <p className="type-body text-cream/70">Фото не читається.</p>
      ) : url ? (
        <img
          src={url}
          alt={current}
          className="max-h-full max-w-full object-contain"
        />
      ) : (
        <div className="size-12 animate-spin rounded-full border-2 border-cream/30 border-t-transparent" />
      )}
    </dialog>,
    document.body,
  );
};

/** Photos found in the album's folder, with a viewer. */
export const FolderPhotos = ({
  albumId,
  folderSlug,
}: {
  albumId: number;
  folderSlug: string | null;
}) => {
  const { data: photos, isLoading, error } = useAlbumPhotos(albumId, {
    enabled: !!folderSlug,
  });
  const [open, setOpen] = useState<string | null>(null);

  if (!folderSlug) return null;

  return (
    <div className="flex flex-col gap-2.5">
      <span className="type-label text-cream/60">
        Фото з теки{photos?.length ? ` (${photos.length})` : ''}
      </span>
      {isLoading ? (
        <div className="flex gap-2.5">
          {['s1', 's2', 's3'].map((key) => (
            <div key={key} className={clsx(TILE, 'animate-pulse bg-cream/5')} />
          ))}
        </div>
      ) : error ? (
        <p className="font-sans text-xs text-accent">Не вдалося прочитати теку.</p>
      ) : !photos?.length ? (
        <p className="type-body text-cream/45">У теці альбому фото немає.</p>
      ) : (
        <div className="flex flex-wrap gap-2.5">
          {photos.map((filename) => (
            <Thumbnail
              key={filename}
              albumId={albumId}
              filename={filename}
              onOpen={() => setOpen(filename)}
            />
          ))}
        </div>
      )}
      {open && photos && (
        <Lightbox
          albumId={albumId}
          photos={photos}
          current={open}
          onClose={() => setOpen(null)}
          onNavigate={setOpen}
        />
      )}
    </div>
  );
};
