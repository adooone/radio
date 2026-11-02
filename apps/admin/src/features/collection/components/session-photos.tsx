import {
  useDeleteSessionPhoto,
  useSessionPhotos,
  useUploadSessionPhotos,
} from '@/services/api';
import type { SessionPhoto } from '@radio/types';
import clsx from 'clsx';
import { useRef, useState } from 'react';

const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_BYTES = 25 * 1024 * 1024;

const TILE =
  'relative size-[68px] shrink-0 overflow-hidden border border-cream/10 shadow-[inset_0_0_12px_rgba(0,0,0,0.45)]';

/** One photo, with a delete that asks for a second click. */
const Tile = ({
  photo,
  onDelete,
  isDeleting,
}: {
  photo: SessionPhoto;
  onDelete: () => void;
  isDeleting: boolean;
}) => {
  const [confirming, setConfirming] = useState(false);
  return (
    <div className={clsx(TILE, 'group bg-cream/10')}>
      <img
        src={photo.url}
        alt=""
        loading="lazy"
        className={clsx(
          'size-full object-cover transition-opacity',
          isDeleting && 'opacity-40',
        )}
      />
      <button
        type="button"
        disabled={isDeleting}
        onClick={() => (confirming ? onDelete() : setConfirming(true))}
        onBlur={() => setConfirming(false)}
        aria-label={confirming ? 'Підтвердити видалення' : 'Видалити фото'}
        className={clsx(
          'absolute top-1 right-1 rounded-full px-1.5 py-0.5 font-sans text-[10px] font-semibold transition-opacity focus:outline-none',
          confirming
            ? 'bg-accent text-ink opacity-100'
            : 'bg-black/60 text-cream opacity-0 hover:bg-black/80 focus:opacity-100 group-hover:opacity-100',
        )}
      >
        {isDeleting ? '…' : confirming ? 'так?' : '✕'}
      </button>
    </div>
  );
};

/**
 * Photos from the album's recording sessions, as the board's strip: the
 * tiles and the + tile. While one of its songs is on air, the player fades
 * one of them in behind the record; albums without any keep the usual room.
 */
export const SessionPhotos = ({
  albumId,
  folderSlug,
}: {
  albumId: number;
  folderSlug: string | null;
}) => {
  const { data: photos, isLoading } = useSessionPhotos(albumId, {
    enabled: !!folderSlug,
  });
  const upload = useUploadSessionPhotos();
  const remove = useDeleteSessionPhoto();
  const [deleting, setDeleting] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  if (!folderSlug) return null;

  const handleFiles = async (list: FileList | null) => {
    if (!list?.length) return;
    const files = Array.from(list);
    const skipped = files.filter(
      (file) => !ACCEPTED.includes(file.type) || file.size > MAX_BYTES,
    );
    const valid = files.filter((file) => !skipped.includes(file));
    const notes = skipped.map((file) =>
      file.size > MAX_BYTES
        ? `${file.name}: понад 25 МБ`
        : `${file.name}: не фото`,
    );
    setMessage(null);
    if (valid.length) {
      try {
        const result = await upload.mutateAsync({ albumId, files: valid });
        notes.push(...result.failed.map((f) => `${f.file}: ${f.error}`));
      } catch {
        notes.push('не вдалося завантажити');
      }
    }
    if (notes.length) setMessage(`Не додано — ${notes.join('; ')}`);
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleDelete = async (name: string) => {
    setDeleting(name);
    setMessage(null);
    try {
      await remove.mutateAsync({ albumId, name });
    } catch {
      setMessage('Не вдалося видалити фото');
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="flex flex-col gap-2.5">
      <span className="type-label text-cream/60">
        Фото сесії{photos?.length ? ` (${photos.length})` : ''}
      </span>
      <div className="flex flex-wrap gap-2.5">
        {isLoading
          ? ['s1', 's2', 's3'].map((key) => (
              <div key={key} className={clsx(TILE, 'animate-pulse bg-cream/5')} />
            ))
          : photos?.map((photo) => (
              <Tile
                key={photo.name}
                photo={photo}
                isDeleting={deleting === photo.name}
                onDelete={() => handleDelete(photo.name)}
              />
            ))}
        <button
          type="button"
          disabled={upload.isPending}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            handleFiles(e.dataTransfer.files);
          }}
          aria-label="Додати фото сесії"
          className={clsx(
            'flex size-[68px] shrink-0 cursor-pointer items-center justify-center border border-dashed font-sans text-[22px] transition-colors',
            dragging
              ? 'border-glow bg-glow/10 text-glow'
              : 'border-cream/25 text-cream/60 hover:border-cream/40 hover:text-cream',
          )}
        >
          {upload.isPending ? '…' : '+'}
        </button>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ACCEPTED.join(',')}
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
        />
      </div>
      {message && <p className="font-sans text-xs text-accent">{message}</p>}
    </div>
  );
};
