import { Button } from '@/components/ui';
import clsx from 'clsx';
import { useSound } from '../../hooks/use-sound';
import { SoundOffIcon, SoundOnIcon } from '../icons/sound-icons';

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
