import { useOnAir, useTurntable } from '@/services/api/hooks/use-on-air-api';
import { StatusDot } from '@dendelion/func-ui';

/** The air's state in one line, top right, level with the sign. */
export const CornerStatus = () => {
  const { data: onAir } = useOnAir();
  const { data: turntable } = useTurntable();

  const playing = turntable?.status === 'playing';
  const live = Boolean(turntable?.live);
  const line = playing
    ? 'В ефірі — грає з колекції'
    : live
      ? 'В ефірі — наживо з OBS'
      : onAir
        ? 'В ефірі — звук зупинено'
        : 'Тиша в ефірі';

  return (
    <span className="flex items-center gap-2.5">
      <StatusDot
        variant={playing || live ? 'error' : 'neutral'}
        pulse={playing || live}
      />
      <span className="type-label text-cream/70">{line}</span>
    </span>
  );
};
