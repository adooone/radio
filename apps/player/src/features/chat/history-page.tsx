import type { AirTrack } from '@/features/stream/use-now-playing';
import { useT } from '@/i18n';
import { formatTime } from './time';

type HistoryPageProps = {
  /** The songs played before the one on air, newest first. */
  recent: AirTrack[];
  onClose: () => void;
};

/**
 * The radio's last songs, opened from the "earlier" link under the
 * record: each with its sleeve, title, artist and when it went on air,
 * newest first, and the way back to the chat.
 */
export const HistoryPage = ({ recent, onClose }: HistoryPageProps) => {
  const t = useT();
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-baseline justify-between gap-3 pb-3">
        <h2 className="type-label text-cream/70">{t('history.title')}</h2>
        <button
          type="button"
          onClick={onClose}
          className="type-label text-cream/45 underline-offset-[6px] transition-colors hover:text-cream hover:underline"
        >
          {t('air.closeEarlier')}
        </button>
      </div>
      {recent.length === 0 ? (
        <div className="flex min-h-0 flex-1 items-center justify-center p-4">
          <p className="type-body text-center text-cream/45">
            {t('history.empty')}
          </p>
        </div>
      ) : (
        <ol className="chat-scroll min-h-0 flex-1 space-y-2 overflow-y-auto overflow-x-hidden py-1">
          {recent.map((track, index) => (
            <li
              key={`${track.startedAt ?? index}-${track.title}`}
              className="flex items-center gap-3"
            >
              <Sleeve cover={track.cover} size="size-12" />
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="type-body truncate text-cream">
                  {track.title}
                </span>
                <span className="type-meta truncate text-cream/55">
                  {track.artist}
                </span>
              </span>
              {track.startedAt && (
                <span className="type-meta shrink-0 tabular-nums text-cream/45">
                  {formatTime(track.startedAt)}
                </span>
              )}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
};

/** A song's sleeve in small: the album cover, or a plain card without one. */
export const Sleeve = ({
  cover,
  size,
}: {
  cover?: string;
  size: string;
}) =>
  cover ? (
    <img
      src={cover}
      alt=""
      className={`${size} shrink-0 rounded-[2px] object-cover shadow-[0_0_0_1px_rgb(240_228_206/0.12)]`}
    />
  ) : (
    <span
      aria-hidden="true"
      className={`${size} shrink-0 rounded-[2px] bg-[#17100c] shadow-[0_0_0_1px_rgb(240_228_206/0.12)]`}
    />
  );
