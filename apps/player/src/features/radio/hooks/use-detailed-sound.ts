import { useState, useEffect } from 'react';
import { soundService } from '@/services/sound';

export const useDetailedSound = () => {
  const [messageSounds, setMessageSounds] = useState(
    soundService.isMessageSoundsEnabled(),
  );
  const [sendSounds, setSendSounds] = useState(
    soundService.isSendSoundsEnabled(),
  );
  const [joinSounds, setJoinSounds] = useState(
    soundService.isJoinSoundsEnabled(),
  );

  useEffect(() => {
    const unsubscribe = soundService.subscribe(() => {
      setMessageSounds(soundService.isMessageSoundsEnabled());
      setSendSounds(soundService.isSendSoundsEnabled());
      setJoinSounds(soundService.isJoinSoundsEnabled());
    });
    return unsubscribe;
  }, []);

  const toggleMessageSounds = () => {
    soundService.toggleMessageSounds();
  };

  const toggleSendSounds = () => {
    soundService.toggleSendSounds();
  };

  const toggleJoinSounds = () => {
    soundService.toggleJoinSounds();
  };

  return {
    messageSounds,
    sendSounds,
    joinSounds,
    toggleMessageSounds,
    toggleSendSounds,
    toggleJoinSounds,
  };
};
