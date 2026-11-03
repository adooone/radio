import { useT } from '@/i18n';
import { LampIconButton } from '@dendelion/func-ui';
import type { LampSize } from '@dendelion/func-ui';
import { GearIcon, SoundOffIcon, SoundOnIcon } from './icons';
import type { ChatPage } from './use-chat-room';

type ChatLampsProps = {
  lampSize: LampSize;
  sound: { isEnabled: boolean; toggle: () => void };
  page: ChatPage;
  onTogglePage: (target: 'listeners' | 'settings') => void;
  /** The island reads mute before settings. */
  soundFirst?: boolean;
  className?: string;
};

/**
 * The room's own lamps: the settings flower and the sound toggle. Wide
 * screens set them at the end of the control island, after the volume;
 * phones at the right end of the track bar over the open room. The page the
 * gear opens shows as pressed.
 */
export const ChatLamps = ({
  lampSize,
  sound,
  page,
  onTogglePage,
  soundFirst = false,
  className = '',
}: ChatLampsProps) => {
  const t = useT();
  const soundLamp = (
    <LampIconButton
      tone={sound.isEnabled ? 'red' : 'dark'}
      size={lampSize}
      onClick={sound.toggle}
      label={t(sound.isEnabled ? 'chat.muteSounds' : 'chat.unmuteSounds')}
      icon={sound.isEnabled ? <SoundOnIcon /> : <SoundOffIcon />}
      className={sound.isEnabled ? 'text-ink' : 'text-cream'}
    />
  );
  return (
    <span className={`flex items-center gap-3 ${className}`}>
      {soundFirst && soundLamp}
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
      {!soundFirst && soundLamp}
    </span>
  );
};
