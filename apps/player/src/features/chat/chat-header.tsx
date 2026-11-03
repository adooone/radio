import { useT } from '@/i18n';
import { effectiveColor } from './colors';
import type { ChatPage } from './use-chat-room';

type ChatHeaderProps = {
  nickname: string;
  colorChoice: string | null;
  page: ChatPage;
  /** The listeners count, everyone but the listener themself. */
  othersCount: number;
  onTogglePage: (target: 'listeners' | 'settings') => void;
};

/**
 * The bar over the chat: the listeners count in the middle as plain words
 * that open the list, and the listener's own nick on the right. The room's
 * lamps live elsewhere (`ChatLamps`): at the control island's end on wide
 * screens, stacked in the bottom-right corner on phones.
 */
export const ChatHeader = ({
  nickname,
  colorChoice,
  page,
  othersCount,
  onTogglePage,
}: ChatHeaderProps) => {
  const t = useT();
  const listenersOpen = page === 'listeners';
  return (
    <header className="grid w-full grid-cols-[1fr_auto_1fr] items-center gap-x-3 pb-3">
      <button
        type="button"
        onClick={() => onTogglePage('listeners')}
        aria-pressed={listenersOpen}
        className={`type-label col-start-2 row-start-1 justify-self-center whitespace-nowrap rounded-full px-3 py-2 underline-offset-[6px] transition-colors ${
          listenersOpen
            ? 'text-cream underline decoration-accent decoration-2'
            : 'text-cream/70 hover:text-cream'
        }`}
      >
        {t('chat.listenersCount', { count: othersCount })}
      </button>
      <span className="col-start-3 row-start-1 min-w-0 justify-self-end">
        {nickname && (
          <span
            className="type-label block truncate"
            style={{ color: effectiveColor(nickname, colorChoice) }}
          >
            + {nickname}
          </span>
        )}
      </span>
    </header>
  );
};
