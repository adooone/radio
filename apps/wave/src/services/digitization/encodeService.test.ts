import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { execFile } from 'node:child_process';
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { promisify } from 'node:util';
import { encodeDraft } from './encodeService';

const execFileAsync = promisify(execFile);

function makeDraftFolder(inboxPath: string, slug: string): string {
  const folderPath = join(inboxPath, slug);
  mkdirSync(folderPath, { recursive: true });
  return folderPath;
}

async function makeToneWav(path: string, duration = 0.2): Promise<void> {
  await execFileAsync('ffmpeg', [
    '-f',
    'lavfi',
    '-i',
    `sine=frequency=440:duration=${duration}`,
    '-ar',
    '44100',
    '-ac',
    '1',
    '-loglevel',
    'error',
    '-y',
    path,
  ]);
}

async function makeCoverJpg(path: string): Promise<void> {
  await execFileAsync('ffmpeg', [
    '-f',
    'lavfi',
    '-i',
    'color=c=red:s=16x16',
    '-frames:v',
    '1',
    '-loglevel',
    'error',
    '-y',
    path,
  ]);
}

describe('encodeService', () => {
  let inboxPath: string;
  let mediaRootPath: string;

  beforeEach(() => {
    inboxPath = mkdtempSync(join(tmpdir(), 'wave-inbox-'));
    mediaRootPath = mkdtempSync(join(tmpdir(), 'wave-media-'));
  });

  afterEach(() => {
    rmSync(inboxPath, { recursive: true, force: true });
    rmSync(mediaRootPath, { recursive: true, force: true });
  });

  it('encodes tracks + cover, copies data.json, and skips existing outputs', async () => {
    const slug = 'some-band_some-album';
    const folderPath = makeDraftFolder(inboxPath, slug);
    await makeToneWav(join(folderPath, 'a1-first-song.wav'));
    await makeToneWav(join(folderPath, 'a2-second-song.wav'));
    await makeCoverJpg(join(folderPath, 'cover.jpg'));
    writeFileSync(
      join(folderPath, 'data.json'),
      JSON.stringify({ artist: 'Some Band', album_title: 'Some Album' }),
    );

    const log: string[] = [];
    const result = await encodeDraft(inboxPath, mediaRootPath, slug, (line) =>
      log.push(line),
    );

    expect(result.encodedTracks.sort()).toEqual([
      'a1-first-song',
      'a2-second-song',
    ]);
    expect(result.skippedTracks).toEqual([]);
    expect(result.coverEncoded).toBe(true);

    const targetDir = join(mediaRootPath, slug);
    expect(existsSync(join(targetDir, 'a1-first-song.m4a'))).toBe(true);
    expect(existsSync(join(targetDir, 'a2-second-song.m4a'))).toBe(true);
    expect(existsSync(join(targetDir, 'img', 'cover.webp'))).toBe(true);
    expect(
      JSON.parse(readFileSync(join(targetDir, 'data.json'), 'utf-8')),
    ).toEqual({ artist: 'Some Band', album_title: 'Some Album' });

    const second = await encodeDraft(inboxPath, mediaRootPath, slug, () => {});
    expect(second.encodedTracks).toEqual([]);
    expect(second.skippedTracks.sort()).toEqual([
      'a1-first-song',
      'a2-second-song',
    ]);
    expect(second.coverEncoded).toBe(false);

    // A zero-byte output is a crashed run, not a finished encode — retry it.
    writeFileSync(join(targetDir, 'a1-first-song.m4a'), '');
    const third = await encodeDraft(inboxPath, mediaRootPath, slug, () => {});
    expect(third.encodedTracks).toEqual(['a1-first-song']);
    expect(third.skippedTracks).toEqual(['a2-second-song']);
    expect(statSync(join(targetDir, 'a1-first-song.m4a')).size).toBeGreaterThan(
      0,
    );
  });

  it('throws when there are no cut tracks to encode', async () => {
    const slug = 'some-band_no-tracks';
    makeDraftFolder(inboxPath, slug);

    await expect(
      encodeDraft(inboxPath, mediaRootPath, slug, () => {}),
    ).rejects.toThrow('No cut tracks to encode');
  });
});
