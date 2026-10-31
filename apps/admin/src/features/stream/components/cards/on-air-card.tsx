import {
  useClearOnAir,
  useOnAir,
  useStopTurntable,
  useTurntable,
} from '@/services/api';
import { sharedStyles } from '@/styles/shared-styles';
import { LampButton } from '@dendelion/func-ui';
import type { TurntableState } from '@radio/types';
import clsx from 'clsx';

/** Where the sound is coming from, in the admin's words. */
const sourceLine = (turntable: TurntableState | undefined) => {
  if (!turntable) return null;
  if (turntable.status === 'playing' && turntable.queue) {
    const track = turntable.queue[turntable.position ?? 0];
    return `Грає з колекції · ${(turntable.position ?? 0) + 1}/${turntable.queue.length} · ${track?.title ?? ''}`;
  }
  if (turntable.live) return 'Наживо з OBS';
  return 'Тиша в ефірі';
};

export const OnAirCard = () => {
  const { data: onAir, isLoading } = useOnAir();
  const { data: turntable } = useTurntable();
  const clearOnAir = useClearOnAir();
  const stopTurntable = useStopTurntable();
  const playing = turntable?.status === 'playing';

  return (
    <div className={clsx(sharedStyles.statsCard, styles.container)}>
      <div className={clsx(styles.header)}>
        <h3 className={clsx(sharedStyles.statsTitle, 'mb-0')}>В ефірі</h3>
        <span className={clsx(styles.source, playing && styles.sourcePlaying)}>
          {sourceLine(turntable)}
        </span>
      </div>

      {isLoading && <p className={clsx(styles.empty)}>Завантаження...</p>}

      {!isLoading && !onAir && (
        <p className={clsx(styles.empty)}>Зараз нічого не в ефірі.</p>
      )}

      {!isLoading && onAir && (
        <>
          <div className={clsx(styles.track)}>
            <div className={clsx(styles.cover)}>
              {onAir.cover && (
                <img
                  src={onAir.cover}
                  alt={onAir.title}
                  className={clsx(styles.coverImage)}
                />
              )}
            </div>
            <div className={clsx(styles.trackInfo)}>
              <p className={clsx(styles.trackTitle)}>
                {onAir.artist} — {onAir.title}
              </p>
              <p className={clsx(styles.setAt)}>
                {new Date(onAir.setAt).toLocaleTimeString()}
              </p>
            </div>
          </div>

          <div className={clsx(styles.actions)}>
            {playing && (
              <LampButton
                tone="yellow"
                onClick={() => stopTurntable.mutate()}
                disabled={stopTurntable.isPending}
              >
                Зупинити звук
              </LampButton>
            )}
            <LampButton
              tone="red"
              onClick={() => clearOnAir.mutate()}
              disabled={clearOnAir.isPending}
            >
              Зняти з ефіру
            </LampButton>
          </div>
        </>
      )}
    </div>
  );
};

const styles = {
  container: ['flex flex-col'],
  header: [
    'mb-4 flex items-center justify-between gap-3 border-b border-white/20 pb-3',
  ],
  source: ['truncate text-sm text-gray-400'],
  sourcePlaying: ['text-sun'],
  empty: ['text-gray-400'],
  track: ['flex items-center gap-4'],
  cover: ['h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-stone-800'],
  coverImage: ['h-full w-full object-cover'],
  trackInfo: ['min-w-0 flex-1'],
  trackTitle: ['truncate font-medium text-gray-100'],
  setAt: ['text-sm text-gray-400'],
  actions: ['mt-4 flex justify-center gap-3 border-t border-white/10 pt-3'],
} as const;
