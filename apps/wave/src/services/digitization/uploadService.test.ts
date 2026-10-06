import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  completeUpload,
  getUploadStatus,
  initUpload,
  writeChunk,
} from './uploadService';

const CHUNK_SIZE = 1024 * 1024;

function makeDraftFolder(inboxPath: string, slug: string): string {
  const folderPath = join(inboxPath, slug);
  mkdirSync(folderPath, { recursive: true });
  return folderPath;
}

function chunkOf(size: number, fill: number): Buffer {
  return Buffer.alloc(size, fill);
}

describe('uploadService', () => {
  let inboxPath: string;
  const slug = 'some-band_some-album';

  beforeEach(() => {
    inboxPath = mkdtempSync(join(tmpdir(), 'wave-inbox-'));
    makeDraftFolder(inboxPath, slug);
  });

  afterEach(() => {
    rmSync(inboxPath, { recursive: true, force: true });
  });

  it('completes a happy-path upload across multiple chunks', () => {
    const size = CHUNK_SIZE * 2 + 100;
    const session = initUpload(inboxPath, slug, 'side-a.wav', size, CHUNK_SIZE);
    expect(session.totalChunks).toBe(3);
    expect(session.receivedChunks).toEqual([]);

    writeChunk(inboxPath, slug, session.uploadId, 0, chunkOf(CHUNK_SIZE, 1));
    writeChunk(inboxPath, slug, session.uploadId, 1, chunkOf(CHUNK_SIZE, 2));
    writeChunk(inboxPath, slug, session.uploadId, 2, chunkOf(100, 3));

    const result = completeUpload(inboxPath, slug, session.uploadId);
    expect(result).toEqual({ filename: 'side-a.wav', size });

    const written = readFileSync(join(inboxPath, slug, 'side-a.wav'));
    expect(written.length).toBe(size);
    expect(written[0]).toBe(1);
    expect(written[CHUNK_SIZE]).toBe(2);
    expect(written[CHUNK_SIZE * 2]).toBe(3);
  });

  it('allows resuming after a missing chunk is detected via status', () => {
    const size = CHUNK_SIZE * 2;
    const session = initUpload(inboxPath, slug, 'side-a.wav', size, CHUNK_SIZE);

    writeChunk(inboxPath, slug, session.uploadId, 0, chunkOf(CHUNK_SIZE, 1));

    expect(() => completeUpload(inboxPath, slug, session.uploadId)).toThrow(
      'Upload incomplete',
    );

    const status = getUploadStatus(inboxPath, slug, session.uploadId);
    expect(status.receivedChunks).toEqual([0]);

    writeChunk(inboxPath, slug, session.uploadId, 1, chunkOf(CHUNK_SIZE, 2));
    const result = completeUpload(inboxPath, slug, session.uploadId);
    expect(result.size).toBe(size);
  });

  it('refuses to init or complete onto a non-empty existing side file', () => {
    writeFileSync(join(inboxPath, slug, 'side-a.wav'), 'already here');

    expect(() =>
      initUpload(inboxPath, slug, 'side-a.wav', CHUNK_SIZE, CHUNK_SIZE),
    ).toThrow('already exists and is not empty');
  });

  it('rejects filenames outside the side-x.wav allowlist, including traversal attempts', () => {
    expect(() =>
      initUpload(inboxPath, slug, '../../etc/passwd', CHUNK_SIZE, CHUNK_SIZE),
    ).toThrow('Invalid filename');

    expect(() =>
      initUpload(inboxPath, slug, 'side-a.wav.exe', CHUNK_SIZE, CHUNK_SIZE),
    ).toThrow('Invalid filename');

    expect(() =>
      initUpload(inboxPath, slug, 'side-ab.wav', CHUNK_SIZE, CHUNK_SIZE),
    ).toThrow('Invalid filename');
  });

  it('rejects an upload size over the cap', () => {
    const overCap = 2 * 1024 ** 3 + 1;
    expect(() =>
      initUpload(inboxPath, slug, 'side-a.wav', overCap, CHUNK_SIZE),
    ).toThrow('Invalid upload size');
  });

  it('rejects a chunk whose length does not match the expected size', () => {
    const session = initUpload(
      inboxPath,
      slug,
      'side-a.wav',
      CHUNK_SIZE * 2,
      CHUNK_SIZE,
    );

    expect(() =>
      writeChunk(inboxPath, slug, session.uploadId, 0, chunkOf(100, 1)),
    ).toThrow('Invalid chunk size');
  });

  it('rejects an out-of-range chunk index', () => {
    const session = initUpload(
      inboxPath,
      slug,
      'side-a.wav',
      CHUNK_SIZE,
      CHUNK_SIZE,
    );

    expect(() =>
      writeChunk(inboxPath, slug, session.uploadId, 5, chunkOf(CHUNK_SIZE, 1)),
    ).toThrow('Invalid chunk index');
  });

  it('does not leave an upload session directory behind after completion', () => {
    const session = initUpload(
      inboxPath,
      slug,
      'side-a.wav',
      CHUNK_SIZE,
      CHUNK_SIZE,
    );
    writeChunk(inboxPath, slug, session.uploadId, 0, chunkOf(CHUNK_SIZE, 1));
    completeUpload(inboxPath, slug, session.uploadId);

    expect(
      existsSync(join(inboxPath, slug, '.uploads', session.uploadId)),
    ).toBe(false);
  });
});
