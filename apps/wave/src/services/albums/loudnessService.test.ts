import { describe, expect, it } from 'bun:test';
import type { PlayableSong } from '@/db/albums';
import { measureMissingGains } from './loudnessService';

const song = (id: number, gainDb: number | null): PlayableSong => ({
  id,
  albumId: 1,
  title: `Song ${id}`,
  trackNumber: id,
  duration: '3:00',
  fileSlug: `a${id}-song`,
  gainDb,
  artist: 'Yes',
  folderSlug: 'yes_fragile',
});

function run(songs: PlayableSong[], remeasure = false, failOn?: number) {
  const measured: string[] = [];
  const saved: [number, number][] = [];
  const promise = measureMissingGains(
    { remeasure },
    {
      listSongs: async () => songs,
      measure: async (path) => {
        measured.push(path);
        return path.includes(`a${failOn}-`)
          ? null
          : { integrated: -20, truePeak: -10 };
      },
      saveGain: async (id, gain) => {
        saved.push([id, gain]);
      },
      mediaRoot: '/media',
      log: () => {},
    },
  );
  return promise.then((result) => ({ result, measured, saved }));
}

describe('measureMissingGains', () => {
  it('measures only tracks without a gain, from the media folder', async () => {
    const { result, measured, saved } = await run([song(1, null), song(2, -3)]);
    expect(measured).toEqual(['/media/yes_fragile/a1-song.m4a']);
    expect(saved).toEqual([[1, 4]]);
    expect(result).toEqual({ measured: 1, failed: 0, skipped: 1 });
  });

  it('remeasures everything when asked', async () => {
    const { result } = await run([song(1, null), song(2, -3)], true);
    expect(result).toEqual({ measured: 2, failed: 0, skipped: 0 });
  });

  it('leaves a track it cannot measure without a gain and goes on', async () => {
    const { result, saved } = await run(
      [song(1, null), song(2, null)],
      false,
      1,
    );
    expect(saved).toEqual([[2, 4]]);
    expect(result).toEqual({ measured: 1, failed: 1, skipped: 0 });
  });
});
