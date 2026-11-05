import {
  useClearOnAir,
  useOnAir,
  useSetOnAir,
  useStopTurntable,
  useTurntable,
} from '@/services/api/hooks/use-on-air-api';
import { Button } from '@dendelion/func-ui';
import { VinylBox } from '@radio/stage';
import type { TurntableState } from '@radio/types';

const sourceLine = (turntable: TurntableState | undefined) => {
  if (!turntable) return 'Тиша в ефірі';
  if (turntable.status === 'playing') {
    const position = (turntable.position ?? 0) + 1;
    const total = turntable.queue?.length ?? 0;
    return total ? `Вертушка · трек ${position} з ${total}` : 'Вертушка';
  }
  if (turntable.live) return 'Наживо з OBS';
  return 'Тиша в ефірі';
};

const sinceLine = (setAt: string) =>
  `в ефірі з ${new Date(setAt).toLocaleTimeString('uk-UA', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })}`;

/**
 * The air itself: the player's record with the song on it, the turntable's
 * place in the record, and the three things the admin can do to it — go
 * to the next track (the one lit action), stop the sound, take it off air.
 */
export const Turntable = () => {
  const { data: onAir, isLoading } = useOnAir();
  const { data: turntable } = useTurntable();
  const setOnAir = useSetOnAir();
  const stopTurntable = useStopTurntable();
  const clearOnAir = useClearOnAir();

  const playing = turntable?.status === 'playing';
  const queue = turntable?.queue ?? [];
  const position = turntable?.position ?? 0;
  const next = playing ? queue[position + 1] : undefined;
  const busy =
    setOnAir.isPending || stopTurntable.isPending || clearOnAir.isPending;

  return (
    <section className="flex items-center gap-12">
      <div className="relative h-[252px] w-[396px] shrink-0">
        <VinylBox
          playing={playing}
          quiet={!onAir}
          song={onAir ? { title: onAir.title, cover: onAir.cover } : null}
          label="Ефір"
          alignToIsland={false}
        />
      </div>

      <div className="flex min-w-0 flex-col gap-3">
        <span className="type-label text-glow">{sourceLine(turntable)}</span>
        {isLoading ? (
          <p className="font-serif text-xl text-cream/70">Завантаження…</p>
        ) : onAir ? (
          <>
            <h1 className="truncate font-serif text-[46px] font-extrabold leading-[1.08] text-cream">
              {onAir.title}
            </h1>
            <p className="truncate font-serif text-[22px] font-semibold text-cream/75">
              {onAir.artist}
            </p>
            <p className="font-sans text-[13px] tabular-nums text-cream/60">
              {sinceLine(onAir.setAt)}
            </p>
          </>
        ) : (
          <p className="font-serif text-[22px] font-semibold text-cream/75">
            Зараз нічого не в ефірі.
          </p>
        )}

        <div className="mt-3 flex flex-wrap gap-3">
          <Button
            size="sm"
            variant="lit"
            disabled={!next || busy || !onAir}
            onClick={() =>
              next &&
              onAir &&
              setOnAir.mutate({ albumId: onAir.albumId, songId: next.songId })
            }
          >
            Наступний трек
          </Button>
          <Button
            size="sm"
            variant="ghost"
            disabled={!playing || busy}
            onClick={() => stopTurntable.mutate()}
          >
            Зупинити вертушку
          </Button>
          <Button
            size="sm"
            variant="danger"
            disabled={!onAir || busy}
            onClick={() => clearOnAir.mutate()}
          >
            Зняти з ефіру
          </Button>
        </div>
      </div>
    </section>
  );
};
