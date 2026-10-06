import { useAlbumPhotos } from '@/services/api';
import { albumApi } from '@/services/api/album-api';
import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

type AlbumPhotosSectionProps = {
  albumId: number;
  folderSlug: string | null;
};

function AlbumPhotoThumbnail({
  albumId,
  filename,
  onClick,
}: {
  albumId: number;
  filename: string;
  onClick: () => void;
}) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let url: string | null = null;
    albumApi
      .getAlbumPhoto(albumId, filename)
      .then((blob) => {
        url = URL.createObjectURL(blob);
        setBlobUrl(url);
      })
      .catch(() => setError(true));

    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [albumId, filename]);

  if (error) {
    return (
      <div className="flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 bg-gray-700 rounded-lg flex items-center justify-center text-gray-500 text-xs">
        Failed to load
      </div>
    );
  }

  if (!blobUrl) {
    return (
      <div className="flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 bg-gray-700/50 rounded-lg animate-pulse" />
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden bg-gray-700 hover:ring-2 hover:ring-sun/50 transition-all focus:outline-none focus:ring-2 focus:ring-sun"
    >
      <img
        src={blobUrl}
        alt={filename}
        className="w-full h-full object-cover"
      />
    </button>
  );
}

function PhotoLightbox({
  albumId,
  photos,
  currentFilename,
  onClose,
  onNavigate,
}: {
  albumId: number;
  photos: string[];
  currentFilename: string;
  onClose: () => void;
  onNavigate: (filename: string) => void;
}) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const currentIndex = photos.indexOf(currentFilename);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex >= 0 && currentIndex < photos.length - 1;

  useEffect(() => {
    setBlobUrl(null);
    setError(false);
    let cancelled = false;
    let url: string | null = null;

    albumApi
      .getAlbumPhoto(albumId, currentFilename)
      .then((blob) => {
        if (cancelled) return;
        if (
          blob.type === 'application/json' ||
          (blob.type && !blob.type.startsWith('image/'))
        ) {
          setError(true);
          return;
        }
        url = URL.createObjectURL(blob);
        setBlobUrl(url);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });

    return () => {
      cancelled = true;
      if (url) URL.revokeObjectURL(url);
    };
  }, [albumId, currentFilename]);

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) onClose();
    },
    [onClose],
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && hasPrev) {
        e.preventDefault();
        onNavigate(photos[currentIndex - 1]);
      }
      if (e.key === 'ArrowRight' && hasNext) {
        e.preventDefault();
        onNavigate(photos[currentIndex + 1]);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, onNavigate, hasPrev, hasNext, photos, currentIndex]);

  const handleBackdropKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onClose();
      }
    },
    [onClose],
  );

  const lightboxContent = error ? (
    <dialog
      open
      className="fixed inset-0 z-[9999] flex items-center justify-center border-0 bg-transparent backdrop:bg-black/80 [&::backdrop]:bg-black/80"
      onClick={handleBackdropClick}
      onKeyDown={handleBackdropKeyDown}
      aria-label="Photo viewer"
    >
      <div className="text-gray-400">Failed to load image</div>
    </dialog>
  ) : (
    <dialog
      open
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 border-0 bg-transparent [&::backdrop]:bg-black/90"
      onClick={handleBackdropClick}
      onKeyDown={handleBackdropKeyDown}
      aria-label="Photo viewer"
    >
      <button
        type="button"
        onClick={onClose}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') onClose();
        }}
        className="absolute top-4 right-4 text-gray-400 hover:text-white p-2 z-10"
        aria-label="Close"
      >
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden
        >
          <title>Close</title>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
      {hasPrev && (
        <button
          type="button"
          onClick={() => onNavigate(photos[currentIndex - 1])}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ')
              onNavigate(photos[currentIndex - 1]);
          }}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white p-2 z-10 rounded-full hover:bg-white/10 transition-colors"
          aria-label="Previous photo"
        >
          <svg
            className="w-10 h-10"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden
          >
            <title>Previous</title>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
      )}
      {hasNext && (
        <button
          type="button"
          onClick={() => onNavigate(photos[currentIndex + 1])}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ')
              onNavigate(photos[currentIndex + 1]);
          }}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white p-2 z-10 rounded-full hover:bg-white/10 transition-colors"
          aria-label="Next photo"
        >
          <svg
            className="w-10 h-10"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden
          >
            <title>Next</title>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      )}
      {blobUrl ? (
        <div
          className="flex items-center justify-center"
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
          role="presentation"
        >
          <img
            src={blobUrl}
            alt={currentFilename}
            className="max-w-full max-h-full object-contain"
          />
        </div>
      ) : (
        <div className="flex items-center justify-center text-gray-400">
          <div className="w-12 h-12 border-2 border-gray-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </dialog>
  );

  return createPortal(lightboxContent, document.body);
}

export const AlbumPhotosSection = ({
  albumId,
  folderSlug,
}: AlbumPhotosSectionProps) => {
  const {
    data: photos,
    isLoading,
    error,
  } = useAlbumPhotos(albumId, {
    enabled: !!folderSlug,
  });
  const [lightboxPhoto, setLightboxPhoto] = useState<string | null>(null);

  if (!folderSlug) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="mt-6">
        <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
          Folder Photos
        </h4>
        <div className="flex flex-nowrap gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 bg-gray-700/50 rounded-lg animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error || !photos?.length) {
    return (
      <div className="mt-6">
        <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
          Folder Photos
        </h4>
        <p className="text-sm text-gray-500">
          {photos?.length === 0
            ? 'No photos found in album folder (img/ or root).'
            : 'Failed to load photos.'}
        </p>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
        Folder Photos ({photos.length})
      </h4>
      <div className="flex flex-nowrap gap-3 overflow-x-auto pb-2">
        {photos.map((filename) => (
          <AlbumPhotoThumbnail
            key={filename}
            albumId={albumId}
            filename={filename}
            onClick={() => setLightboxPhoto(filename)}
          />
        ))}
      </div>
      {lightboxPhoto && (
        <PhotoLightbox
          albumId={albumId}
          photos={photos}
          currentFilename={lightboxPhoto}
          onClose={() => setLightboxPhoto(null)}
          onNavigate={setLightboxPhoto}
        />
      )}
    </div>
  );
};
