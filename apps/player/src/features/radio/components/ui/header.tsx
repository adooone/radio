import clsx from 'clsx';
import { getMelomanLabel } from '../../utils';
import { SettingsIcon } from '../icons/settings-icon';
import { useUserColor } from '@/features/radio/hooks/use-user-color';
import { useUserList } from '../../hooks';
import { Button } from '@/components/ui';
import { useEffect, useRef } from 'react';
import { soundService } from '@/services/sound';

interface HeaderProps {
  isPlaying: boolean;
  isMuted: boolean;
  nickname: string;
  onMuteClick: () => void;
  onUserListClick: () => void;
  onSettingsClick: () => void;
}

export const Header = ({
  isPlaying,
  isMuted,
  nickname,
  onMuteClick,
  onUserListClick,
  onSettingsClick,
}: HeaderProps) => {
  const { getEffectiveColor } = useUserColor();
  const users = useUserList();
  const listeners = users.length;
  const prevListeners = useRef(0);
  const joinSoundTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const listenersWithoutUser = listeners - 1;

  useEffect(() => {
    if (joinSoundTimer.current) {
      clearTimeout(joinSoundTimer.current);
      joinSoundTimer.current = null;
    }

    joinSoundTimer.current = setTimeout(() => {
      if (listeners > prevListeners.current) {
        soundService.playSound('join');
      }
      prevListeners.current = listeners;
      joinSoundTimer.current = null;
    }, 1500);
  }, [listeners]);

  return (
    <div className={clsx(styles.header)}>
      <div className={clsx(styles.headerContent)}>
        <div className={clsx(styles.titleWrapper)}>
          <img
            src="/logo.png"
            alt="Вінілове Радіо"
            className={clsx(styles.favicon)}
          />
          <h1 className={clsx(styles.title)}>Вінілове Радіо</h1>
        </div>
        <div className={clsx(styles.toolbar)}>
          {isPlaying && (
            <Button variant="mute" active={isMuted} onClick={onMuteClick}>
              <span className={clsx(styles.muteLabel)}>
                {isMuted ? 'muted' : 'mute'}
              </span>
            </Button>
          )}
          {nickname && (
            <button
              type="button"
              onClick={onSettingsClick}
              className={clsx(styles.settingsButton)}
              aria-label="Налаштування акаунту"
            >
              <SettingsIcon />
            </button>
          )}
          {nickname && listeners > 0 && (
            <Button variant="mute" onClick={onUserListClick}>
              <span className={clsx(styles.listeners)}>
                {getMelomanLabel(listenersWithoutUser)} онлайн
              </span>
            </Button>
          )}
          {nickname && (
            <span
              className={clsx(
                styles.nickname,
                getEffectiveColor(nickname, true),
              )}
            >
              <span className={clsx(styles.plus)}>+</span>
              {nickname}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  header: ['w-full max-w-[1200px] md:mb-2 p-2'],
  headerContent: [
    'flex justify-between md:items-center gap-4 flex-col md:flex-row',
  ],
  titleWrapper: ['flex items-center gap-3'],
  favicon: ['w-10 h-10'],
  title: ['font-bold text-xl md:text-2xl drop-shadow-xl whitespace-nowrap'],
  toolbar: ['flex items-center gap-4 w-full justify-between md:justify-end'],
  listeners: ['text-base text-white/40 font-display uppercase'],
  nickname: ['font-display uppercase cursor-default'],
  plus: ['mr-2 text-white/60'],
  muteButton: [
    'px-4 py-2 rounded-full bg-coal-relic/40 hover:bg-coal-relic/80',
    'flex items-center gap-2 transition-colors duration-200',
    'shadow-lg hover:shadow-xl text-sm uppercase tracking-wider',
  ],
  userListButton: [
    'flex items-center gap-2 transition-colors duration-200',
    'px-4 py-2 rounded-full bg-coal-relic/40 hover:bg-coal-relic/80',
    'shadow-lg hover:shadow-xl text-sm uppercase tracking-wider',
    'cursor-pointer',
  ],
  settingsButton: [
    'flex items-center justify-center w-8 h-8 rounded-full',
    'bg-coal-relic/40 hover:bg-coal-relic/80',
    'text-white/60 hover:text-white/80',
    'transition-colors duration-200',
    'cursor-pointer',
  ],
  buttonMuted: ['opacity-50'],
  muteLabel: ['font-display'],
} as const;
