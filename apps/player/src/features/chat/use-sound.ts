import {
  onSoundsChange,
  playSound,
  soundTypeEnabled,
  soundsEnabled,
  toggleSoundType,
  toggleSounds,
} from '@/lib/sound';
import { useSyncExternalStore } from 'react';

export const useSound = () => {
  const isEnabled = useSyncExternalStore(onSoundsChange, soundsEnabled);
  const messageEnabled = useSyncExternalStore(onSoundsChange, () =>
    soundTypeEnabled('message'),
  );
  const sendEnabled = useSyncExternalStore(onSoundsChange, () =>
    soundTypeEnabled('send'),
  );
  const joinEnabled = useSyncExternalStore(onSoundsChange, () =>
    soundTypeEnabled('join'),
  );

  return {
    isEnabled,
    toggle: toggleSounds,
    play: playSound,
    types: {
      message: {
        enabled: messageEnabled,
        toggle: () => toggleSoundType('message'),
      },
      send: { enabled: sendEnabled, toggle: () => toggleSoundType('send') },
      join: { enabled: joinEnabled, toggle: () => toggleSoundType('join') },
    },
  };
};
