import { useT } from '@/i18n';
import { effectiveColor } from './colors';
import { StatusIcon } from './icons';
import { formatTime } from './time';
import type { ChatMessage } from './types';

type MessageProps = {
  message: ChatMessage;
  isSelf: boolean;
  isOnline: boolean;
  color: string | null;
};

/**
 * One bubble, in the old player's shape: others on the left over faint white,
 * the listener's own on the right over a red tint; uppercase warm nickname
 * with the on-air status mark, the text, a small clock.
 */
export const Message = ({ message, isSelf, isOnline, color }: MessageProps) => {
  const t = useT();
  const displayNickname = message.nickname || t('chat.anonymous');
  const messageTime = formatTime(message.timestamp);

  return (
    <div className="flex w-full">
      <div
        className={`type-body flex w-fit max-w-[88%] flex-col gap-1 whitespace-pre-wrap break-words rounded-xl px-3 py-2 text-cream ${
          isSelf ? 'ml-auto bg-accent/15 text-right' : 'bg-cream/5 text-left'
        }`}
      >
        {!isSelf && (
          <span className="flex items-center gap-1.5">
            <span
              className="type-label"
              style={{ color: effectiveColor(displayNickname, color) }}
            >
              {displayNickname}
            </span>
            <StatusIcon
              className={`size-4 shrink-0 ${isOnline ? 'text-glow' : 'text-cream/25'}`}
              aria-label={t(
                isOnline ? 'chat.status.online' : 'chat.status.offline',
              )}
            />
          </span>
        )}
        <span className="flex items-end justify-between gap-2">
          <span className="flex-1">{message.text}</span>
          <span className="type-meta shrink-0 self-end text-cream/45">
            {messageTime}
          </span>
        </span>
      </div>
    </div>
  );
};
