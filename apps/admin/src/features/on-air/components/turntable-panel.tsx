import {
  useClearOnAir,
  useOnAir,
  useStopTurntable,
  useTurntable,
} from '@/services/api';
import { formatDuration } from '@/utils/format-duration';
import { LampButton } from '@dendelion/func-ui';
import type { TurntableState } from '@radio/types';
import { VinylBox } from './vinyl-box';

const sourceLine = (turntable: TurntableState | undefined) => {
  if (!turntable) return null;
  if (turntable.status === 'playing') return 'Грає з колекції';
  if (turntable.live) return 'Наживо з OBS';
  return 'Тиша в ефірі';
};

export const TurntablePanel = () => {
  const { data: onAir, isLoading } = useOnAir();
  const { data: turntable } = useTurntable();
  const clearOnAir = useClearOnAir();
  const stopTurntable = useStopTurntable();
  const playing = turntable?.status === 'playing';
  const queue = turntable?.queue ?? [];
  const position = turntable?.position ?? 0;

  return (
    <section className="flex flex-col gap-6">
      <div className="flex items-center gap-8">
        <VinylBox onAir={onAir} playing={playing} />
        <div className="min-w-0 flex-1">
          <p className="font-sans text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-accent">
            {sourceLine(turntable)}
          </p>
          {isLoading && (
            <p className="mt-2 font-serif text-cream/70">Завантаження...</p>
          )}
          {!isLoading && !onAir && (
            <p className="mt-2 font-serif text-xl text-cream/70">
              Зараз нічого не в ефірі.
            </p>
          )}
          {onAir && (
            <>
              <h2 className="mt-2 truncate font-serif text-3xl font-semibold text-cream">
                {onAir.title}
              </h2>
              <p className="truncate font-sans text-sm text-cream/70">
                {onAir.artist}
              </p>
              <p className="mt-1 font-sans text-xs tabular-nums text-cream/45">
                {new Date(onAir.setAt).toLocaleTimeString()}
              </p>
            </>
          )}
          <div className="mt-5 flex gap-3">
            <LampButton
              tone="yellow"
              size="sm"
              onClick={() => stopTurntable.mutate()}
              disabled={!playing || stopTurntable.isPending}
            >
              Зупинити звук
            </LampButton>
            <LampButton
              tone="red"
              size="sm"
              onClick={() => clearOnAir.mutate()}
              disabled={!onAir || clearOnAir.isPending}
            >
              Зняти з ефіру
            </LampButton>
          </div>
        </div>
      </div>

      {queue.length > 0 && (
        <ol className="flex flex-col gap-1">
          {queue.map((track, index) => {
            const current = playing && index === position;
            return (
              <li
                key={track.songId}
                className={`flex items-baseline gap-3 rounded-full px-4 py-1.5 ${
                  current ? 'bg-cream/10 text-cream' : 'text-cream/70'
                }`}
              >
                <span className="w-6 shrink-0 font-sans text-xs tabular-nums text-cream/45">
                  {track.trackNumber}
                </span>
                <span
                  className={`min-w-0 flex-1 truncate font-serif ${
                    current ? 'font-semibold' : ''
                  }`}
                >
                  {track.title}
                </span>
                <span className="shrink-0 font-sans text-xs tabular-nums text-cream/45">
                  {formatDuration(track.durationSec)}
                </span>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
};
