import { albumApi } from '@/services/api/album-api';
import { useEffect, useState } from 'react';

/**
 * A photo from the album's folder as an object URL. Folder photos need the
 * admin's auth, so a plain `src` won't do: the blob is fetched, shown, and
 * revoked when the photo changes or the component goes. A JSON or any
 * non-image answer counts as a failure.
 */
export const usePhotoBlob = (albumId: number, filename: string | null) => {
  const [url, setUrl] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setUrl(null);
    setFailed(false);
    if (!filename) return;
    let cancelled = false;
    let objectUrl: string | null = null;

    albumApi
      .getAlbumPhoto(albumId, filename)
      .then((blob) => {
        if (cancelled) return;
        if (
          blob.type === 'application/json' ||
          (blob.type && !blob.type.startsWith('image/'))
        ) {
          setFailed(true);
          return;
        }
        objectUrl = URL.createObjectURL(blob);
        setUrl(objectUrl);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [albumId, filename]);

  return { url, failed };
};
