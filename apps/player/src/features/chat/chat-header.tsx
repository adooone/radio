import { useT } from '@/i18n';
import { GhostToggle } from '@dendelion/func-ui';
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
 * screens, in the track bar's right end on phones.
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
      <GhostToggle
        pressed={listenersOpen}
        onClick={() => onTogglePage('listeners')}
        className="col-start-2 row-start-1 justify-self-center whitespace-nowrap"
      >
        {t('chat.listenersCount', { count: othersCount })}
      </GhostToggle>
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
