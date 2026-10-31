import { describe, expect, it } from 'bun:test';
import {
  type Player,
  type QueuedTrack,
  TurntableService,
  concatList,
  parseDuration,
  parseProgressLine,
  trackIndexAt,
} from './turntableService';

const track = (songId: number, durationSec: number): QueuedTrack => ({
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
  return { service, players, marks, finished: () => finished };
}

describe('turntableService', () => {
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

  it('quotes paths for the concat list', () => {
    expect(
      concatList([{ ...track(1, 1), filePath: "/m/rock'n'roll.m4a" }]),
    ).toBe("file '/m/rock'\\''n'\\''roll.m4a'\n");
  });
});
