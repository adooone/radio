import { useT } from '@/i18n';
import type { LampSize } from '@dendelion/func-ui';
import { ChatLamps } from './chat-lamps';
import { effectiveColor } from './colors';
import type { ChatPage } from './use-chat-room';

type ChatHeaderProps = {
  lampSize: LampSize;
  sound: { isEnabled: boolean; toggle: () => void };
  nickname: string;
  colorChoice: string | null;
  page: ChatPage;
  /** The listeners count, everyone but the listener themself. */
  othersCount: number;
  onTogglePage: (target: 'listeners' | 'settings') => void;
};

/**
 * The bar over the chat, laid out as the old player's: the settings flower
 * in the left corner with the sound toggle beside it, the listeners count
 * in the middle as plain words that open the list, and the listener's own
 * nick on the right. Phones keep only the count and the nick here — their
 * lamps stack in the bottom-right corner (`ChatLamps` in chat.tsx).
 */
export const ChatHeader = ({
  lampSize,
  sound,
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
      <ChatLamps
        lampSize={lampSize}
        sound={sound}
        page={page}
        onTogglePage={onTogglePage}
        className="col-start-1 row-start-1 min-w-0 justify-self-start portrait:hidden"
      />
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
