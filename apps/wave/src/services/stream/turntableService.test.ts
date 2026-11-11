import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { OnAirState } from '@radio/types';
import { OnAirService } from './onAirService';
import {
  type Player,
  type QueuedTrack,
  TurntableService,
  filterGraph,
  joinOverlaps,
  parseDuration,
  parseProgressLine,
  startTurntable,
  trackIndexAt,
} from './turntableService';

const track = (songId: number, durationSec: number): QueuedTrack => ({
  albumId: 7,
  songId,
  title: `Song ${songId}`,
  trackNumber: songId,
  durationSec,
  filePath: `/media/album/${songId}.m4a`,
});

const ALBUM = 7;
const QUEUE = [track(1, 10), track(2, 20), track(3, 5)];

class FakePlayer implements Player {
  private progressListeners: ((playedSec: number) => void)[] = [];
  private exitListeners: ((code: number | null) => void)[] = [];
  stopped = false;

  onProgress(listener: (playedSec: number) => void) {
    this.progressListeners.push(listener);
  }
  onExit(listener: (code: number | null) => void) {
    this.exitListeners.push(listener);
  }
  stop() {
    this.stopped = true;
  }
  playedTo(seconds: number) {
    for (const listener of this.progressListeners) listener(seconds);
  }
  exit(code: number | null) {
    for (const listener of this.exitListeners) listener(code);
  }
}

const started: TurntableService[] = [];

function makeTurntable() {
  const players: FakePlayer[] = [];
  const marks: [number, number][] = [];
  let finished = 0;
  const service = new TurntableService({
    loadQueue: async (albumId, fromSongId) => {
      if (albumId !== ALBUM)
        throw new Error(`Album with ID ${albumId} not found`);
      const from = fromSongId
        ? QUEUE.findIndex((entry) => entry.songId === fromSongId)
        : 0;
      return QUEUE.slice(from);
    },
    spawnPlayer: () => {
      const player = new FakePlayer();
      players.push(player);
      return player;
    },
    onTrack: async (albumId, songId) => {
      marks.push([albumId, songId]);
    },
    onFinished: () => {
      finished++;
    },
    log: () => {},
  });
  started.push(service);
  return { service, players, marks, finished: () => finished };
}

describe('turntableService', () => {
  afterEach(() => {
    for (const service of started.splice(0)) service.stop();
  });

  it('plays the album from its first track and marks it on air', async () => {
    const { service, players, marks } = makeTurntable();
    const state = await service.play(ALBUM);

    expect(state.status).toBe('playing');
    expect(state.songId).toBe(1);
    expect(state.position).toBe(0);
    expect(state.queue?.map((entry) => entry.songId)).toEqual([1, 2, 3]);
    expect(players).toHaveLength(1);
    expect(marks).toEqual([[ALBUM, 1]]);
  });

  it('drops the needle on the chosen song and plays on from there', async () => {
    const { service, marks } = makeTurntable();
    const state = await service.play(ALBUM, 2);

    expect(state.queue?.map((entry) => entry.songId)).toEqual([2, 3]);
    expect(marks).toEqual([[ALBUM, 2]]);
  });

  it('moves the on-air mark as the sound passes each track boundary', async () => {
    const { service, players, marks } = makeTurntable();
    await service.play(ALBUM);
    const [player] = players;

    player.playedTo(3);
    expect(marks).toEqual([[ALBUM, 1]]);

    player.playedTo(12);
    expect(marks).toEqual([
      [ALBUM, 1],
      [ALBUM, 2],
    ]);
    expect(service.getState().position).toBe(1);

    player.playedTo(13);
    expect(marks).toHaveLength(2);

    player.playedTo(31);
    expect(marks.at(-1)).toEqual([ALBUM, 3]);
    expect(service.getState().songId).toBe(3);
  });

  it('plays a queue across albums, reporting each track and the end', async () => {
    const { service, players, marks, finished } = makeTurntable();
    const starts: number[] = [];
    const ends: boolean[] = [];
    const queue = [
      { ...track(1, 10), albumId: 3 },
      { ...track(2, 20), albumId: 4 },
    ];
    const state = await service.playTracks(queue, {
      mode: 'rotation',
      crossfadeSec: 4,
      onTrackStart: (entry) => starts.push(entry.songId),
      onEnd: (completed) => ends.push(completed),
    });
    expect(state.mode).toBe('rotation');
    expect(state.albumId).toBe(3);

    players[0].playedTo(8);
    expect(service.getState().albumId).toBe(4);
    players[0].exit(0);

    expect(starts).toEqual([1, 2]);
    expect(marks).toEqual([
      [3, 1],
      [4, 2],
    ]);
    expect(ends).toEqual([true]);
    expect(finished()).toBe(0);
  });

  it('clears the air when the queue has played to its end', async () => {
    const { service, players, finished } = makeTurntable();
    await service.play(ALBUM);

    players[0].exit(0);

    expect(finished()).toBe(1);
    expect(service.getState()).toEqual({ status: 'idle' });
  });

  it('lifts the needle on stop without clearing the mark', async () => {
    const { service, players, finished } = makeTurntable();
    await service.play(ALBUM);

    expect(service.stop()).toBe(true);
    expect(players[0].stopped).toBe(true);
    expect(service.getState()).toEqual({ status: 'idle' });

    // ffmpeg exits after the kill; that is not the queue ending.
    players[0].exit(null);
    expect(finished()).toBe(0);
    expect(service.stop()).toBe(false);
  });

  it('replaces the record playing when a new one is put on', async () => {
    const { service, players, finished, marks } = makeTurntable();
    await service.play(ALBUM);
    await service.play(ALBUM, 3);

    expect(players).toHaveLength(2);
    expect(players[0].stopped).toBe(true);
    expect(service.getState().songId).toBe(3);
    expect(marks.at(-1)).toEqual([ALBUM, 3]);

    players[0].exit(null);
    expect(finished()).toBe(0);
    expect(service.getState().status).toBe('playing');
  });

  it('refuses an unknown album and keeps the current record playing', async () => {
    const { service, players } = makeTurntable();
    await service.play(ALBUM);

    await expect(service.play(9)).rejects.toThrow('Album with ID 9 not found');
    expect(players[0].stopped).toBe(false);
    expect(service.getState().status).toBe('playing');
  });
});

describe('turntable helpers', () => {
  it('parses the stored m:ss and h:mm:ss durations', () => {
    expect(parseDuration('3:08')).toBe(188);
    expect(parseDuration('1:02:03')).toBe(3723);
    expect(parseDuration('nope')).toBe(0);
  });

  it('finds the track at a point in the queue', () => {
    expect(trackIndexAt(QUEUE, 0)).toBe(0);
    expect(trackIndexAt(QUEUE, 9.9)).toBe(0);
    expect(trackIndexAt(QUEUE, 10)).toBe(1);
    expect(trackIndexAt(QUEUE, 29.9)).toBe(1);
    expect(trackIndexAt(QUEUE, 30)).toBe(2);
    expect(trackIndexAt(QUEUE, 999)).toBe(2);
  });

  it('reads out_time from the ffmpeg progress stream', () => {
    expect(parseProgressLine('out_time=00:01:30.500000')).toBe(90.5);
    expect(parseProgressLine('frame=1')).toBeNull();
  });

  it('crossfades each join, never past half of either track', () => {
    expect(
      joinOverlaps([track(1, 100), track(2, 6), track(3, 100)], 4),
    ).toEqual([3, 3]);
    expect(joinOverlaps(QUEUE, 0)).toEqual([0, 0]);
    expect(joinOverlaps([track(1, 100)], 4)).toEqual([]);
  });

  it('hands the air to the next track halfway through its crossfade', () => {
    // Starts: 0, 10 - 4 = 6, 6 + 20 - 4 = 22; switches at 8 and 24.
    const overlaps = [4, 4];
    expect(trackIndexAt(QUEUE, 7.9, overlaps)).toBe(0);
    expect(trackIndexAt(QUEUE, 8, overlaps)).toBe(1);
    expect(trackIndexAt(QUEUE, 23.9, overlaps)).toBe(1);
    expect(trackIndexAt(QUEUE, 24, overlaps)).toBe(2);
  });

  it('builds one graph: per-track gain, crossfades or concat, real time', () => {
    const tracks = [
      { ...track(1, 100), gainDb: -4.6 },
      { ...track(2, 100), gainDb: null },
      track(3, 100),
    ];
    const crossfaded = filterGraph(tracks, [4, 4]);
    expect(crossfaded).toContain('volume=-4.6dB[a0]');
    expect(crossfaded).toContain('volume=0dB[a1]');
    expect(crossfaded).toContain(
      '[a0][a1]acrossfade=d=4.000:c1=tri:c2=tri[x1]',
    );
    expect(crossfaded).toContain(
      '[x1][a2]acrossfade=d=4.000:c1=tri:c2=tri[x2]',
    );
    expect(crossfaded.endsWith('[x2]arealtime[out]')).toBe(true);

    const gapless = filterGraph(tracks, [0, 0]);
    expect(gapless).toContain('[a0][a1][a2]concat=n=3:v=0:a=1[joined]');
    expect(gapless.endsWith('[joined]arealtime[out]')).toBe(true);

    expect(filterGraph([track(1, 100)], [])).toContain('[a0]arealtime[out]');
  });
});

const mark = (source: OnAirState['source']): OnAirState => ({
  albumId: ALBUM,
  songId: 1,
  artist: 'Artist',
  title: 'Song 1',
  setAt: '2026-11-02T07:30:00.000Z',
  source,
});

describe('turntable boot', () => {
  let dir: string;

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'wave-turntable-'));
  });

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  // Wave runs from the same checkout the tests run in, so an import that
  // wrote data/on-air.json would clear what the live station has on air.
  it('importing the module leaves the on-air file and signals alone', () => {
    const onAirPath = join(dir, 'data', 'on-air.json');
    mkdirSync(join(dir, 'data'));
    writeFileSync(onAirPath, JSON.stringify(mark('turntable')), 'utf8');
    const before = statSync(onAirPath).mtimeMs;
    const contents = readFileSync(onAirPath, 'utf8');

    const modulePath = join(import.meta.dir, 'turntableService.ts');
    const probe = Bun.spawnSync(
      [
        process.execPath,
        '-e',
        `const signals = () => process.listenerCount('SIGINT') + process.listenerCount('SIGTERM');
         const was = signals();
         await import(${JSON.stringify(modulePath)});
         console.log(JSON.stringify({ added: signals() - was }));`,
      ],
      { cwd: dir, env: process.env, stdout: 'pipe', stderr: 'pipe' },
    );

    expect(probe.stderr.toString()).toBe('');
    expect(probe.exitCode).toBe(0);
    expect(readFileSync(onAirPath, 'utf8')).toBe(contents);
    expect(statSync(onAirPath).mtimeMs).toBe(before);
    expect(JSON.parse(probe.stdout.toString().trim())).toEqual({
      added: 0,
    });
    // A fresh bun process can take seconds to start on a busy box.
  }, 60_000);

  function boot(source: OnAirState['source']) {
    const filePath = join(dir, 'on-air.json');
    writeFileSync(filePath, JSON.stringify(mark(source)), 'utf8');
    const onAir = new OnAirService({
      filePath,
      broadcast: () => {},
      getAlbum: async () => null,
      getSong: async () => null,
    });
    let stops = 0;
    const listenersBefore = {
      SIGINT: process.listeners('SIGINT'),
      SIGTERM: process.listeners('SIGTERM'),
    };
    startTurntable({ onAir, turntable: { stop: () => stops++ > 0 } });
    const added = (['SIGINT', 'SIGTERM'] as const).map(
      (signal) =>
        [
          signal,
          process
            .listeners(signal)
            .filter((l) => !listenersBefore[signal].includes(l)),
        ] as const,
    );
    // Keep the test process's own signal handling as it was.
    for (const [signal, listeners] of added)
      for (const listener of listeners) process.off(signal, listener);
    return { onAir, filePath, added, stops: () => stops };
  }

  it('clears an on-air mark the turntable left before a restart', () => {
    const { onAir, filePath } = boot('turntable');
    expect(onAir.getOnAir()).toBeNull();
    expect(readFileSync(filePath, 'utf8')).toBe('');
  });

  it('keeps an on-air mark the admin set', () => {
    const { onAir, filePath } = boot('admin');
    expect(onAir.getOnAir()?.source).toBe('admin');
    expect(JSON.parse(readFileSync(filePath, 'utf8')).source).toBe('admin');
  });

  it('lifts the needle on SIGINT and SIGTERM, then re-raises the signal', () => {
    const { added, stops } = boot('admin');
    const kill = process.kill;
    const raised: unknown[] = [];
    process.kill = ((pid: number, signal?: string | number) => {
      raised.push([pid, signal]);
      return true;
    }) as typeof process.kill;
    try {
      for (const [signal, listeners] of added) {
        expect(listeners).toHaveLength(1);
        (listeners[0] as (signal: NodeJS.Signals) => void)(signal);
      }
    } finally {
      process.kill = kill;
    }
    expect(stops()).toBe(2);
    expect(raised).toEqual([
      [process.pid, 'SIGINT'],
      [process.pid, 'SIGTERM'],
    ]);
  });
});
