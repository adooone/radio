import { useOnAir } from '@/services/api/hooks/use-on-air-api';
import { RoomBackdrop } from '@radio/stage';

/**
 * The room behind the work column — the old admin's turntable desk, the
 * way the player keeps its waiting room behind the radio — with the song
 * on air bringing a photo from its album's sessions over it, under a
 * deeper shade than the player's so the work stays readable. Both bleed
 * under the slab, so the rim's swing never uncovers the bare page.
 */
export const WorkRoom = () => {
  const { data: onAir } = useOnAir();

  return (
    <>
      <RoomBackdrop photo={onAir?.backdrop} roomPosition="50% 50%" />
      <div
        aria-hidden="true"
        className="work-shade absolute top-0 left-0"
        style={{ width: 'calc(100% + 32px)', height: 'calc(100% + 32px)' }}
      />
    </>
  );
};
