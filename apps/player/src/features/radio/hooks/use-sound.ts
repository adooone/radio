import { useState, useEffect } from 'react';
import { soundService } from '@/services/sound';

export const useSound = () => {
  const [isEnabled, setIsEnabled] = useState(
    soundService.isInterfaceSoundsEnabled(),
  );

  useEffect(() => {
    const unsubscribe = soundService.subscribe(() => {
      setIsEnabled(soundService.isInterfaceSoundsEnabled());
    });
    return unsubscribe;
  }, []);

  const toggle = () => {
    soundService.toggleInterfaceSounds();
  };

  const play = (sound: Parameters<typeof soundService.playSound>[0]) => {
    soundService.playSound(sound);
  };

  return {
    isEnabled,
    toggle,
    play,
  };
};
