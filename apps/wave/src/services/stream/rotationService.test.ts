import { afterEach, describe, expect, it } from 'bun:test';
import type { PlayableSong } from '@/db/albums';
import type { TurntableState } from '@radio/types';
import {
  CROSSFADE_SEC,
  RotationService,
  type SavedRotation,
  pickBatch,
} from './rotationService';
import type { PlayOptions, QueuedTrack } from './turntableService';

const song = (
  id: number,
  albumId: number,
  artist: string,
  duration = '3:00',
): PlayableSong => ({
  id,
  albumId,
  title: `Song ${id}`,
  trackNumber: id,
  duration,
  fileSlug: `t${id}`,
  gainDb: id % 2 ? -2 : null,
  artist,
  folderSlug: `album-${albumId}`,
});

// Three albums by two artists, three tracks each.
const LIBRARY = [
  song(1, 1, 'Yes'),
  song(2, 1, 'Yes'),
  song(3, 1, 'Yes'),
  song(4, 2, 'Yes'),
  song(5, 2, 'Yes'),
  song(6, 2, 'Yes'),
  song(7, 3, 'Nirvana'),
  song(8, 3, 'Nirvana'),
  song(9, 3, 'Nirvana'),
];

/** A fixed sequence of "random" picks, cycling. */
const sequence = (...values: number[]) => {
  let i = 0;
  return () => values[i++ % values.length];
};

describe('pickBatch', () => {
  it('takes every unplayed track once, never two neighbours from one album', () => {
    const { batch, newPass } = pickBatch(
      LIBRARY,
      new Set(),
      [],
      Math.random,
      Number.POSITIVE_INFINITY,
    );
    expect(newPass).toBe(false);
    expect(new Set(batch.map((s) => s.id)).size).toBe(9);
    for (let i = 1; i < batch.length; i++) {
      // Album neighbours are allowed only once nothing else is left.
      const left = batch.slice(i);
      if (left.some((s) => s.albumId !== batch[i - 1].albumId)) {
        expect(batch[i].albumId).not.toBe(batch[i - 1].albumId);
      }
    }
  });

  it('keeps artists apart while it can', () => {
    const { batch } = pickBatch(
      LIBRARY,
      new Set([1, 2, 3, 4, 5]),
      [],
      sequence(0),
      Number.POSITIVE_INFINITY,
    );
    // Left: 6 (Yes), 7, 8, 9 (Nirvana): Yes can only sit between Nirvanas.
    expect(batch.map((s) => s.artist)).toEqual([
      'Yes',
      'Nirvana',
      'Nirvana',
      'Nirvana',
    ]);
  });

  it('skips what this pass has played, and starts a new pass when all have', () => {
    const played = new Set(LIBRARY.map((s) => s.id).filter((id) => id !== 7));
    expect(
      pickBatch(LIBRARY, played, [], Math.random).batch.map((s) => s.id),
    ).toEqual([7]);

    const all = new Set(LIBRARY.map((s) => s.id));
    const fresh = pickBatch(LIBRARY, all, [], Math.random, 9 * 180);
    expect(fresh.newPass).toBe(true);
    expect(fresh.batch).toHaveLength(9);
  });

  it('leads with the songs asked for, then stops near the target length', () => {
    const { batch } = pickBatch(LIBRARY, new Set(), [8, 2], Math.random, 600);
    expect(batch.slice(0, 2).map((s) => s.id)).toEqual([8, 2]);
    // 180 s each: the fourth track crosses 600 s.
    expect(batch).toHaveLength(4);
  });
});

type Call =
  | { kind: 'tracks'; queue: QueuedTrack[]; options: PlayOptions }
  | { kind: 'album'; albumId: number; options?: PlayOptions };

function makeRotation(saved: Partial<SavedRotation> = {}, live = false) {
  const calls: Call[] = [];
  let state: Omit<TurntableState, 'live'> = { status: 'idle' };
  let current: PlayOptions | undefined;
  let stops = 0;
  let clears = 0;
  const saves: SavedRotation[] = [];

  const turntable = {
    getState: () => state,
    stop: () => {
      const was = state.status === 'playing';
      state = { status: 'idle' };
      stops++;
      return was;
    },
    playTracks: async (queue: QueuedTrack[], options: PlayOptions = {}) => {
      calls.push({ kind: 'tracks', queue, options });
      current = options;
      state = {
        status: 'playing',
        mode: options.mode,
        position: 0,
        queue,
        songId: queue[0].songId,
      };
      options.onTrackStart?.(queue[0], 0);
      return state;
    },
    play: async (
      albumId: number,
      _songId?: number,
      options: PlayOptions = {},
    ) => {
      calls.push({ kind: 'album', albumId, options });
      current = options;
      state = { status: 'playing', mode: 'album', albumId };
      return state;
    },
  };

  const rotation = new RotationService({
    listSongs: async () => LIBRARY,
    turntable,
    isLiveElsewhere: async () => live,
    probe: async () => {},
    clearOnAir: () => {
      clears++;
    },
    load: () => ({ enabled: false, played: [], upNext: [], ...saved }),
    save: (s) => saves.push(structuredClone(s)),
    random: sequence(0.5),
    mediaRoot: '/media',
    log: () => {},
  });

  /** The turntable reaching track `index` of the batch on air. */
  const reach = (index: number) => {
    const last = calls.at(-1);
    if (last?.kind !== 'tracks') throw new Error('no batch playing');
    state = { ...state, position: index, songId: last.queue[index].songId };
    current?.onTrackStart?.(last.queue[index], index);
  };
  /** The turntable's ffmpeg exiting: a full play, or a crash. */
  const end = (completed: boolean) => {
    state = { status: 'idle' };
    current?.onEnd?.(completed);
  };

  return {
    rotation,
    calls,
    saves,
    reach,
    end,
    stops: () => stops,
    clears: () => clears,
  };
}

describe('rotationService', () => {
  const made: RotationService[] = [];
  afterEach(() => {
    for (const rotation of made.splice(0)) rotation.shutdown();
  });

  it('plays a crossfaded batch with gains when switched on, and saves it', async () => {
    const { rotation, calls, saves } = makeRotation();
    made.push(rotation);
    const state = await rotation.enable();

    expect(calls).toHaveLength(1);
    const [call] = calls;
    if (call.kind !== 'tracks') throw new Error('expected a batch');
    expect(call.options.mode).toBe('rotation');
    expect(call.options.crossfadeSec).toBe(CROSSFADE_SEC);
    expect(call.queue[0].filePath).toMatch(/^\/media\/album-\d\/t\d\.m4a$/);
    expect(state.enabled).toBe(true);
    expect(state.mode).toBe('rotation');
    expect(state.playedInPass).toBe(1);
    expect(saves.at(-1)?.enabled).toBe(true);
  });

  it('counts each track as played when it takes the air', async () => {
    const { rotation, reach, saves } = makeRotation();
    made.push(rotation);
    await rotation.enable();
    reach(1);
    reach(2);
    expect(saves.at(-1)?.played).toHaveLength(3);
  });

  it('plays the next batch when one ends, without repeats', async () => {
    const { rotation, calls, end, reach } = makeRotation();
    made.push(rotation);
    await rotation.enable();
    const first = calls[0].kind === 'tracks' ? calls[0].queue : [];
    first.forEach((_, i) => i > 0 && reach(i));
    end(true);
    await Bun.sleep(0);

    expect(calls).toHaveLength(2);
    const second = calls[1].kind === 'tracks' ? calls[1].queue : [];
    const firstIds = new Set(first.map((t) => t.songId));
    for (const track of second) {
      if (first.length + second.length <= LIBRARY.length) {
        expect(firstIds.has(track.songId)).toBe(false);
      }
    }
  });

  it('resumes at boot when it was on, and stays quiet while OBS is live', async () => {
    const on = makeRotation({ enabled: true });
    made.push(on.rotation);
    await on.rotation.tick();
    expect(on.calls).toHaveLength(1);

    const live = makeRotation({ enabled: true }, true);
    made.push(live.rotation);
    await live.rotation.tick();
    expect(live.calls).toHaveLength(0);

    const off = makeRotation({ enabled: false });
    made.push(off.rotation);
    await off.rotation.tick();
    expect(off.calls).toHaveLength(0);
  });

  it('plays an asked-for song when the current track ends', async () => {
    const { rotation, calls, reach } = makeRotation();
    made.push(rotation);
    await rotation.enable();
    await rotation.playNext(9);
    expect(calls).toHaveLength(1);

    reach(1);
    await Bun.sleep(0);
    expect(calls).toHaveLength(2);
    const next = calls[1];
    if (next.kind !== 'tracks') throw new Error('expected a batch');
    expect(next.queue[0].songId).toBe(9);
    expect((await rotation.getState()).upNext).toEqual([]);
  });

  it('skips to a fresh batch at once', async () => {
    const { rotation, calls } = makeRotation();
    made.push(rotation);
    await rotation.enable();
    await rotation.skip();
    expect(calls).toHaveLength(2);
  });

  it('switched off: stops its own sound and clears the air', async () => {
    const { rotation, stops, clears, saves } = makeRotation();
    made.push(rotation);
    await rotation.enable();
    const state = await rotation.disable();
    expect(stops()).toBe(1);
    expect(clears()).toBe(1);
    expect(state.enabled).toBe(false);
    expect(saves.at(-1)?.enabled).toBe(false);
  });

  it('lets a hand-put record play, then carries on with the rotation', async () => {
    const { rotation, calls, end } = makeRotation({ enabled: true });
    made.push(rotation);
    await rotation.playAlbum(5);
    expect(calls.map((c) => c.kind)).toEqual(['album']);
    end(true);
    await Bun.sleep(0);
    expect(calls.map((c) => c.kind)).toEqual(['album', 'tracks']);
  });

  it('with the rotation off, a hand-put record clears the air when it ends', async () => {
    const { rotation, calls, end, clears } = makeRotation();
    made.push(rotation);
    await rotation.playAlbum(5);
    end(true);
    await Bun.sleep(0);
    expect(calls).toHaveLength(1);
    expect(clears()).toBe(1);
  });
});
