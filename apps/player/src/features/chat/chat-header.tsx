import { useT } from '@/i18n';
import { LampButton, LampIconButton } from '@dendelion/func-ui';
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
  /** The listeners pill counts everyone but the listener themself. */
  othersCount: number;
  onTogglePage: (target: 'listeners' | 'settings') => void;
  onBack: () => void;
};

/**
 * The bar over the chat: the back lamp (portrait only) and the sound toggle,
 * then the listeners pill; on the other end the listener's own nick and the
 * settings gear. Whichever page the pill or gear opens sits lit as a pressed
 * state.
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
  return (
    <header className="flex w-full items-center justify-between gap-3 pb-3">
      <span className="flex min-w-0 items-center gap-3">
        <LampIconButton
          tone="dark"
          size={lampSize}
          onClick={onBack}
          label={t('island.backToRadio')}
          icon={<CollapseIcon />}
          className="hidden text-cream portrait:inline-block"
        />
        <LampIconButton
          tone={sound.isEnabled ? 'red' : 'dark'}
          size={lampSize}
          onClick={sound.toggle}
          label={t(sound.isEnabled ? 'chat.muteSounds' : 'chat.unmuteSounds')}
          icon={sound.isEnabled ? <SoundOnIcon /> : <SoundOffIcon />}
          className={sound.isEnabled ? 'text-ink' : 'text-cream'}
        />
        <LampButton
          tone={page === 'listeners' ? 'red' : 'dark'}
          size={lampSize}
          onClick={() => onTogglePage('listeners')}
          className={`shrink-0 whitespace-nowrap text-xs ${
            page === 'listeners' ? 'text-ink' : 'text-cream'
          }`}
        >
          {t('chat.listenersCount', { count: othersCount })}
        </LampButton>
      </span>
      <span className="flex shrink-0 items-center gap-2">
        {nickname && (
          <span
            className="font-sans text-xs font-medium uppercase tracking-wide"
            style={{ color: effectiveColor(nickname, colorChoice) }}
          >
            + {nickname}
          </span>
        )}
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
      </span>
    </header>
  );
};
