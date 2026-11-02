import {
  useDeleteSessionPhoto,
  useSessionPhotos,
  useUploadSessionPhotos,
} from '@/services/api';
import type { SessionPhoto } from '@radio/types';
import { useRef, useState } from 'react';

type AlbumSessionPhotosSectionProps = {
  albumId: number;
  folderSlug: string | null;
};

const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_BYTES = 25 * 1024 * 1024;

const TILE =
  'relative h-24 w-36 flex-shrink-0 overflow-hidden rounded-lg sm:h-28 sm:w-44';

/** One photo, with a delete that asks for a second click. */
function SessionPhotoTile({
  photo,
  onDelete,
  isDeleting,
}: {
  photo: SessionPhoto;
  onDelete: () => void;
  isDeleting: boolean;
}) {
  const [confirming, setConfirming] = useState(false);
  return (
    <div className={`${TILE} group bg-gray-700`}>
      <img
        src={photo.url}
        alt=""
        loading="lazy"
        className={`h-full w-full object-cover transition-opacity ${
          isDeleting ? 'opacity-40' : ''
        }`}
      />
      <button
        type="button"
        disabled={isDeleting}
        onClick={() => (confirming ? onDelete() : setConfirming(true))}
        onBlur={() => setConfirming(false)}
        aria-label={confirming ? 'Confirm delete' : 'Delete photo'}
        className={`absolute top-1.5 right-1.5 rounded-full px-2 py-1 text-xs font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-sun ${
          confirming
            ? 'bg-red-600 text-white opacity-100'
            : 'bg-black/60 text-gray-200 opacity-100 hover:bg-black/80 sm:opacity-0 sm:group-hover:opacity-100 sm:focus:opacity-100'
        }`}
      >
        {isDeleting ? '…' : confirming ? 'Delete?' : '✕'}
      </button>
    </div>
  );
}

/**
 * Photos from the album's recording sessions. While one of its songs is on
 * air, the player fades one of them in behind the record (a different one
 * each song); albums without any keep the usual room.
 */
export const AlbumSessionPhotosSection = ({
  albumId,
  folderSlug,
}: AlbumSessionPhotosSectionProps) => {
  const { data: photos, isLoading } = useSessionPhotos(albumId, {
    enabled: !!folderSlug,
  });
  const upload = useUploadSessionPhotos();
  const remove = useDeleteSessionPhoto();
  const [deleting, setDeleting] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  if (!folderSlug) return null;

  const handleFiles = async (list: FileList | null) => {
    if (!list?.length) return;
    const files = Array.from(list);
    const skipped = files.filter(
      (f) => !ACCEPTED.includes(f.type) || f.size > MAX_BYTES,
    );
    const valid = files.filter((f) => !skipped.includes(f));
    const notes = skipped.map((f) =>
      f.size > MAX_BYTES ? `${f.name}: over 25 MB` : `${f.name}: not a photo`,
    );
    setMessage(null);
    if (valid.length) {
      try {
        const result = await upload.mutateAsync({ albumId, files: valid });
        notes.push(...result.failed.map((f) => `${f.file}: ${f.error}`));
      } catch {
        notes.push('Upload failed');
      }
    }
    if (notes.length) setMessage(`Not added — ${notes.join('; ')}`);
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleDelete = async (name: string) => {
    setDeleting(name);
    setMessage(null);
    try {
      await remove.mutateAsync({ albumId, name });
    } catch {
      setMessage('Could not delete the photo');
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="mt-6">
      <h4 className="mb-1 text-sm font-semibold uppercase tracking-wide text-gray-400">
        Session Photos{photos?.length ? ` (${photos.length})` : ''}
      </h4>
      <p className="mb-3 text-sm text-gray-500">
        Shown behind the record while a song from this album is on air — a
        different one each song.
      </p>
      <div className="flex flex-nowrap gap-3 overflow-x-auto pb-2">
        {isLoading
          ? [1, 2, 3].map((i) => (
              <div key={i} className={`${TILE} animate-pulse bg-gray-700/50`} />
            ))
          : photos?.map((photo) => (
              <SessionPhotoTile
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
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            handleFiles(e.dataTransfer.files);
          }}
          className={`${TILE} flex flex-col items-center justify-center gap-1 border-2 border-dashed text-sm transition-colors ${
            isDragging
              ? 'border-sun bg-sun/10 text-sun'
              : 'border-gray-600 text-gray-400 hover:border-gray-500 hover:text-gray-300'
          }`}
        >
          <span className="text-2xl leading-none">
            {upload.isPending ? '…' : '+'}
          </span>
          <span>{upload.isPending ? 'Uploading' : 'Add photos'}</span>
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
      {message && <p className="mt-2 text-sm text-red-400">{message}</p>}
    </div>
  );
};
