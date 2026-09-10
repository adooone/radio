import clsx from 'clsx';
import { SoundOnIcon, SoundOffIcon } from '../icons/sound-icons';
import { useSound } from '../../hooks/use-sound';
import { Button } from '@/components/ui';

export const SoundControl = () => {
  const { isEnabled, toggle } = useSound();

  return (
    <Button variant="mute" active={!isEnabled} onClick={toggle}>
      <span className={clsx(styles.muteIcon)}>
        {isEnabled ? <SoundOnIcon /> : <SoundOffIcon />}
      </span>
    </Button>
  );
};

const styles = {
  muteIcon: ['font-display'],
} as const;
