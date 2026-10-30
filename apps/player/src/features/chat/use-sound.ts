import { useSyncExternalStore } from 'react';
import { onSoundsChange, playSound, soundsEnabled, toggleSounds } from '@/lib/sound';

export const useSound = () => {
  const isEnabled = useSyncExternalStore(onSoundsChange, soundsEnabled);
  return { isEnabled, toggle: toggleSounds, play: playSound };
};
