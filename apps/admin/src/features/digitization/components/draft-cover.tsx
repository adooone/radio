import { useDraftCover } from '@/services/api';
import { useEffect, useMemo } from 'react';

/** The draft's cover, small, from its folder; nothing when it has none. */
export const DraftCover = ({
  slug,
  hasCover,
  title,
}: {
  slug: string;
  hasCover: boolean;
  title: string;
}) => {
  const { data: blob } = useDraftCover(slug, hasCover);
  const url = useMemo(() => (blob ? URL.createObjectURL(blob) : null), [blob]);
  useEffect(() => {
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [url]);

  if (!hasCover || !url) return null;
  return (
    <img
      src={url}
      alt={title}
      className="size-[88px] shrink-0 object-cover shadow-[6px_0_18px_rgba(0,0,0,0.5)]"
    />
  );
};
