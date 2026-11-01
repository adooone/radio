import { useT } from '@/i18n';
import { LampIconButton } from '@dendelion/func-ui';
import type { LampSize } from '@dendelion/func-ui';
import { effectiveColor } from './colors';
import { CollapseIcon, GearIcon, SoundOffIcon, SoundOnIcon } from './icons';
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
  onBack: () => void;
};

/**
 * The bar over the chat, laid out as the old player's: the settings flower
 * in the left corner (after the back lamp on portrait) with the sound
 * toggle beside it, the listeners count in the middle as plain words that
 * open the list, and the listener's own nick on the right. The page the
 * gear or the count opens shows as pressed.
 */
export const ChatHeader = ({
  lampSize,
  sound,
  nickname,
  colorChoice,
  page,
  othersCount,
  onTogglePage,
  onBack,
}: ChatHeaderProps) => {
  const t = useT();
  const listenersOpen = page === 'listeners';
  return (
    // One row where there is room; on portrait, three lamps and a nick
    // leave none for the count, so it drops to its own centred line.
    <header className="grid w-full grid-cols-[1fr_auto_1fr] items-center gap-x-3 gap-y-1 pb-3 portrait:grid-cols-[1fr_auto]">
      <span className="col-start-1 row-start-1 flex min-w-0 items-center gap-3 justify-self-start">
        <LampIconButton
          tone="dark"
          size={lampSize}
          onClick={onBack}
          label={t('island.backToRadio')}
          icon={<CollapseIcon />}
          className="hidden text-cream portrait:inline-block"
        />
        <LampIconButton
          tone={page === 'settings' ? 'red' : 'dark'}
          size={lampSize}
          onClick={() => onTogglePage('settings')}
          label={t(
            page === 'settings' ? 'chat.closeSettings' : 'chat.openSettings',
          )}
          icon={<GearIcon />}
          className={page === 'settings' ? 'text-ink' : 'text-cream'}
        />
        <LampIconButton
          tone={sound.isEnabled ? 'red' : 'dark'}
          size={lampSize}
          onClick={sound.toggle}
          label={t(sound.isEnabled ? 'chat.muteSounds' : 'chat.unmuteSounds')}
          icon={sound.isEnabled ? <SoundOnIcon /> : <SoundOffIcon />}
          className={sound.isEnabled ? 'text-ink' : 'text-cream'}
        />
      </span>
      <button
        type="button"
        onClick={() => onTogglePage('listeners')}
        aria-pressed={listenersOpen}
        className={`type-label col-start-2 row-start-1 justify-self-center whitespace-nowrap rounded-full px-3 py-2 underline-offset-[6px] transition-colors portrait:col-span-2 portrait:col-start-1 portrait:row-start-2 ${
          listenersOpen
            ? 'text-cream underline decoration-accent decoration-2'
            : 'text-cream/70 hover:text-cream'
        }`}
      >
        {t('chat.listenersCount', { count: othersCount })}
      </button>
      <span className="col-start-3 row-start-1 min-w-0 justify-self-end portrait:col-start-2">
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
