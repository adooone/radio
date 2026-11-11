import { Sleeve } from '@/features/chat/history-page';
import type { AirTrack } from '@/features/stream/use-now-playing';
import { useT } from '@/i18n';

type UpNextProps = {
  /** The song after the one on air, when wave knows it. */
  next?: AirTrack;
  /** Whether there are songs played before to look back on. */
  hasEarlier: boolean;
  /** Opens the "earlier" page where the chat is. */
  onOpenEarlier: () => void;
};

/**
 * The tiny line under the record: the next song with its sleeve in small,
 * and, at the end, the link to the songs played earlier — which open in
 * the chat's column, not here.
 */
export const UpNext = ({ next, hasEarlier, onOpenEarlier }: UpNextProps) => {
  const t = useT();
  if (!next && !hasEarlier) return null;
  return (
    <div className="flex items-center gap-2.5">
      {next && (
        <>
          <Sleeve cover={next.cover} size="size-6" />
          <span className="type-label shrink-0 text-cream/45">
            {t('air.next')}
          </span>
          <span className="type-body min-w-0 truncate text-[0.8125rem] text-cream/80">
            {next.title}
            {next.artist && (
              <span className="text-cream/45"> · {next.artist}</span>
            )}
          </span>
        </>
      )}
      {hasEarlier && (
        <button
          type="button"
          onClick={onOpenEarlier}
          aria-label={t('air.openEarlier')}
          className="type-label ml-auto shrink-0 pl-3 text-cream/45 underline-offset-[6px] transition-colors hover:text-cream hover:underline"
        >
          {t('air.earlier')}
        </button>
      )}
    </div>
  );
};
