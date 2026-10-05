import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { execFile } from 'node:child_process';
import {
  mkdirSync,
  mkdtempSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { promisify } from 'node:util';
import { applySplits, planSplits, resolveDraftAudioPath } from './splitService';

const execFileAsync = promisify(execFile);

function makeDraftFolder(inboxPath: string, slug: string): string {
  const folderPath = join(inboxPath, slug);
  mkdirSync(folderPath, { recursive: true });
  return folderPath;
}

async function makeSideWav(
  folderPath: string,
  file: string,
  segments: Array<{
    kind: 'tone' | 'silence';
    frequency?: number;
    duration: number;
  }>,
): Promise<void> {
  const path = join(folderPath, file);
  const args: string[] = [];
  const labels: string[] = [];
  segments.forEach((segment, i) => {
    if (segment.kind === 'tone') {
      args.push(
        '-f',
        'lavfi',
        '-i',
        `sine=frequency=${segment.frequency ?? 440}:duration=${segment.duration}`,
      );
    } else {
      args.push(
        '-f',
        'lavfi',
        '-i',
        `anullsrc=r=44100:cl=mono:d=${segment.duration}`,
      );
    }
    labels.push(`[${i}:a]`);
  });
  args.push(
    '-filter_complex',
    `${labels.join('')}concat=n=${segments.length}:v=0:a=1[out]`,
    '-map',
    '[out]',
    '-ar',
    '44100',
    '-ac',
    '1',
    '-c:a',
    'pcm_s16le',
    '-y',
    '-loglevel',
    'error',
    path,
  );
  await execFileAsync('ffmpeg', args);
}

describe('splitService', () => {
  let inboxPath: string;

  beforeEach(() => {
    inboxPath = mkdtempSync(join(tmpdir(), 'wave-split-'));
  });

  afterEach(() => {
    rmSync(inboxPath, { recursive: true, force: true });
  });

  it('plans duration-guided cuts at the real silence gap between two tracks', async () => {
    const folderPath = makeDraftFolder(inboxPath, 'some-band_some-album');
    await makeSideWav(folderPath, 'side-a.wav', [
      { kind: 'tone', frequency: 440, duration: 2 },
      { kind: 'silence', duration: 1.5 },
      { kind: 'tone', frequency: 660, duration: 3 },
    ]);
    writeFileSync(
      join(folderPath, 'data.json'),
      JSON.stringify({
        tracklist: [
          { position: 'A1', title: 'Opening Track', duration: '0:02' },
          { position: 'A2', title: 'Second Song', duration: '0:03' },
        ],
      }),
    );

    const result = await planSplits(inboxPath, 'some-band_some-album');

    expect(result.missingSides).toEqual([]);
    expect(result.sides).toHaveLength(1);
    const [plan] = result.sides;
    expect(plan.side).toBe('side-a.wav');
    expect(plan.tracks).toHaveLength(2);
    expect(plan.cuts).toHaveLength(1);
    expect(plan.cuts[0].kind).toBe('gap');
    expect(plan.cuts[0].time).toBeGreaterThan(2);
    expect(plan.cuts[0].time).toBeLessThan(3.5);
    expect(plan.tracks[0].fileSlug).toBe('a1-opening-track.wav');
    expect(plan.tracks[1].fileSlug).toBe('a2-second-song.wav');
    expect(plan.tracks[0].end).toBe(plan.cuts[0].time);
    expect(plan.tracks[1].start).toBe(plan.cuts[0].time);
    expect(plan.warnings).toEqual([
      'a1-opening-track.wav: suspiciously short',
      'a2-second-song.wav: suspiciously short',
    ]);
    expect(plan.peaks.bucketMs).toBe(50);
    expect(plan.peaks.min.length).toBe(plan.peaks.max.length);
    expect(plan.peaks.min.length).toBeGreaterThan(0);
  });

  it('falls back to the longest interior gap when durations are missing', async () => {
    const folderPath = makeDraftFolder(inboxPath, 'some-band_no-durations');
    await makeSideWav(folderPath, 'side-a.wav', [
      { kind: 'tone', frequency: 440, duration: 2 },
      { kind: 'silence', duration: 1.5 },
      { kind: 'tone', frequency: 660, duration: 3 },
    ]);
    writeFileSync(
      join(folderPath, 'data.json'),
      JSON.stringify({
        tracklist: [
          { position: 'A1', title: 'Opening Track' },
          { position: 'A2', title: 'Second Song' },
        ],
      }),
    );

    const result = await planSplits(inboxPath, 'some-band_no-durations');

    expect(result.sides[0].cuts).toHaveLength(1);
    expect(result.sides[0].cuts[0].kind).toBe('gap');
  });

  it('honors manual cut overrides over detected silences', async () => {
    const folderPath = makeDraftFolder(inboxPath, 'some-band_manual');
    await makeSideWav(folderPath, 'side-a.wav', [
      { kind: 'tone', frequency: 440, duration: 2 },
      { kind: 'silence', duration: 1.5 },
      { kind: 'tone', frequency: 660, duration: 3 },
    ]);
    writeFileSync(
      join(folderPath, 'data.json'),
      JSON.stringify({
        tracklist: [
          { position: 'A1', title: 'Opening Track', duration: '0:02' },
          { position: 'A2', title: 'Second Song', duration: '0:03' },
        ],
      }),
    );

    const result = await planSplits(inboxPath, 'some-band_manual', {
      manualCuts: { a: [3.2] },
    });

    expect(result.sides[0].cuts).toEqual([{ time: 3.2, kind: 'manual' }]);
    expect(result.sides[0].tracks[1].start).toBe(3.2);
  });

  it('rejects a manual cut count that does not match the tracklist', async () => {
    const folderPath = makeDraftFolder(inboxPath, 'some-band_arity');
    await makeSideWav(folderPath, 'side-a.wav', [
      { kind: 'tone', frequency: 440, duration: 2 },
      { kind: 'silence', duration: 1.5 },
      { kind: 'tone', frequency: 660, duration: 3 },
    ]);
    writeFileSync(
      join(folderPath, 'data.json'),
      JSON.stringify({
        tracklist: [
          { position: 'A1', title: 'Opening Track' },
          { position: 'A2', title: 'Second Song' },
          { position: 'A3', title: 'Third Song' },
        ],
      }),
    );

    expect(
      planSplits(inboxPath, 'some-band_arity', { manualCuts: { a: [3.2] } }),
    ).rejects.toThrow('need exactly 2 cut(s), got 1');
    expect(
      planSplits(inboxPath, 'some-band_arity', {
        manualCuts: { a: [3.2, 999] },
      }),
    ).rejects.toThrow('must lie within the recording');
  });

  it('reports a missing side instead of throwing', async () => {
    const folderPath = makeDraftFolder(inboxPath, 'some-band_missing-side');
    await makeSideWav(folderPath, 'side-a.wav', [
      { kind: 'tone', duration: 1 },
    ]);

    writeFileSync(
      join(folderPath, 'data.json'),
      JSON.stringify({
        tracklist: [
          { position: 'A1', title: 'Only Track', duration: '0:02' },
          { position: 'B1', title: 'Other Side Track', duration: '0:02' },
        ],
      }),
    );

    const result = await planSplits(inboxPath, 'some-band_missing-side');
    expect(result.missingSides).toEqual(['side-b.wav']);
    expect(result.sides).toHaveLength(1);
  });

  it('applies a plan by stream-copying cuts and refuses to overwrite non-empty targets', async () => {
    const folderPath = makeDraftFolder(inboxPath, 'some-band_apply');
    await makeSideWav(folderPath, 'side-a.wav', [
      { kind: 'tone', frequency: 440, duration: 2 },
      { kind: 'silence', duration: 1.5 },
      { kind: 'tone', frequency: 660, duration: 3 },
    ]);

    const result = await applySplits(inboxPath, 'some-band_apply', [
      {
        side: 'a',
        tracks: [
          { fileSlug: 'a1-opening-track.wav', start: 0, end: 2.75 },
          { fileSlug: 'a2-second-song.wav', start: 2.75, end: 7.0 },
        ],
      },
    ]);

    expect(result.written).toEqual([
      'a1-opening-track.wav',
      'a2-second-song.wav',
    ]);
    expect(
      statSync(join(folderPath, 'a1-opening-track.wav')).size,
    ).toBeGreaterThan(0);
    expect(
      statSync(join(folderPath, 'a2-second-song.wav')).size,
    ).toBeGreaterThan(0);

    await expect(
      applySplits(inboxPath, 'some-band_apply', [
        {
          side: 'a',
          tracks: [{ fileSlug: 'a1-opening-track.wav', start: 0, end: 1 }],
        },
      ]),
    ).rejects.toThrow('already exists and is not empty');
  });

  it('rejects path traversal and missing files when resolving audio for auditioning', async () => {
    const folderPath = makeDraftFolder(inboxPath, 'some-band_audio');
    await makeSideWav(folderPath, 'side-a.wav', [
      { kind: 'tone', duration: 1 },
    ]);

    expect(
      resolveDraftAudioPath(inboxPath, 'some-band_audio', 'side-a.wav'),
    ).toBe(join(folderPath, 'side-a.wav'));
    expect(() =>
      resolveDraftAudioPath(inboxPath, 'some-band_audio', '../../etc/passwd'),
    ).toThrow('Not found');
    expect(() =>
      resolveDraftAudioPath(inboxPath, 'some-band_audio', 'side-b.wav'),
    ).toThrow('Not found');
  });
});
