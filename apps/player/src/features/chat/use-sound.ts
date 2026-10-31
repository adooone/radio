import {
  onSoundsChange,
  playSound,
  soundsEnabled,
  toggleSounds,
} from '@/lib/sound';
import { useSyncExternalStore } from 'react';

export const useSound = () => {
  const isEnabled = useSyncExternalStore(onSoundsChange, soundsEnabled);
  return { isEnabled, toggle: toggleSounds, play: playSound };
};
