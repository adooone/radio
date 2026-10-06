import { randomUUID } from 'node:crypto';
import {
  closeSync,
  existsSync,
  mkdirSync,
  openSync,
  readFileSync,
  readdirSync,
  renameSync,
  rmSync,
  statSync,
  writeFileSync,
  writeSync,
} from 'node:fs';
import { join } from 'node:path';
import type { DigitizationUploadSession } from '@radio/types';
import { resolveDraftFolder } from './inboxService';

const UPLOADS_DIR = '.uploads';
const META_FILE = 'meta.json';
const PART_SUFFIX = '.part';
const ASSEMBLED_FILE = 'assembled.wav';

const SIDE_FILENAME_PATTERN = /^side-[a-z]\.wav$/;
const MAX_UPLOAD_SIZE = 2 * 1024 ** 3;
const MIN_CHUNK_SIZE = 1024 * 1024;
const MAX_CHUNK_SIZE = 32 * 1024 * 1024;
const SESSION_TTL_MS = 24 * 60 * 60 * 1000;

interface UploadMeta {
  filename: string;
  size: number;
  chunkSize: number;
  totalChunks: number;
  createdAt: string;
}

function uploadsRootFor(folderPath: string): string {
  return join(folderPath, UPLOADS_DIR);
}

function sessionDirFor(folderPath: string, uploadId: string): string {
  return join(uploadsRootFor(folderPath), uploadId);
}

function metaPathFor(sessionDir: string): string {
  return join(sessionDir, META_FILE);
}

function partPathFor(sessionDir: string, chunkIndex: number): string {
  return join(sessionDir, `${chunkIndex}${PART_SUFFIX}`);
}

function readMeta(sessionDir: string): UploadMeta {
  const metaPath = metaPathFor(sessionDir);
  if (!existsSync(metaPath)) {
    throw new Error('Not found');
  }
  return JSON.parse(readFileSync(metaPath, 'utf-8')) as UploadMeta;
}

function listReceivedChunks(sessionDir: string): number[] {
  let entries: string[];
  try {
    entries = readdirSync(sessionDir);
  } catch {
    return [];
  }
  return entries
    .filter((entry) => entry.endsWith(PART_SUFFIX))
    .map((entry) => Number.parseInt(entry.slice(0, -PART_SUFFIX.length), 10))
    .filter((n) => Number.isInteger(n))
    .sort((a, b) => a - b);
}

/** Removes upload sessions older than the TTL — e.g. ones abandoned mid-resume. */
function pruneStaleSessions(folderPath: string): void {
  const root = uploadsRootFor(folderPath);
  let uploadIds: string[];
  try {
    uploadIds = readdirSync(root);
  } catch {
    return;
  }
  const cutoff = Date.now() - SESSION_TTL_MS;
  for (const uploadId of uploadIds) {
    const sessionDir = join(root, uploadId);
    let isStale = true;
    try {
      isStale = Date.parse(readMeta(sessionDir).createdAt) < cutoff;
    } catch {
      isStale = true;
    }
    if (isStale) {
      rmSync(sessionDir, { recursive: true, force: true });
    }
  }
}

function refuseNonEmptyTarget(folderPath: string, filename: string): void {
  const targetPath = join(folderPath, filename);
  if (existsSync(targetPath) && statSync(targetPath).size > 0) {
    throw new Error(`${filename} already exists and is not empty`);
  }
}

function toUploadSession(
  uploadId: string,
  meta: UploadMeta,
  sessionDir: string,
): DigitizationUploadSession {
  return {
    uploadId,
    filename: meta.filename,
    size: meta.size,
    chunkSize: meta.chunkSize,
    totalChunks: meta.totalChunks,
    receivedChunks: listReceivedChunks(sessionDir),
  };
}

/** Starts a resumable upload session for one `side-x.wav`, rejecting a non-empty existing target up front. */
export function initUpload(
  inboxPath: string,
  slug: string,
  filename: string,
  size: number,
  chunkSize: number,
): DigitizationUploadSession {
  const folderPath = resolveDraftFolder(inboxPath, slug);
  if (!SIDE_FILENAME_PATTERN.test(filename)) {
    throw new Error(
      `Invalid filename: "${filename}" — expected side-a.wav, side-b.wav, ...`,
    );
  }
  if (!Number.isInteger(size) || size <= 0 || size > MAX_UPLOAD_SIZE) {
    throw new Error(
      `Invalid upload size: ${size} bytes — must be between 1 and ${MAX_UPLOAD_SIZE} bytes`,
    );
  }
  if (
    !Number.isInteger(chunkSize) ||
    chunkSize < MIN_CHUNK_SIZE ||
    chunkSize > MAX_CHUNK_SIZE
  ) {
    throw new Error(
      `Invalid chunk size: ${chunkSize} bytes — must be between ${MIN_CHUNK_SIZE} and ${MAX_CHUNK_SIZE} bytes`,
    );
  }
  refuseNonEmptyTarget(folderPath, filename);

  pruneStaleSessions(folderPath);

  const uploadId = randomUUID();
  const sessionDir = sessionDirFor(folderPath, uploadId);
  mkdirSync(sessionDir, { recursive: true });
  const meta: UploadMeta = {
    filename,
    size,
    chunkSize,
    totalChunks: Math.ceil(size / chunkSize),
    createdAt: new Date().toISOString(),
  };
  writeFileSync(metaPathFor(sessionDir), JSON.stringify(meta), 'utf-8');

  return toUploadSession(uploadId, meta, sessionDir);
}

function expectedChunkSize(meta: UploadMeta, chunkIndex: number): number {
  const isLastChunk = chunkIndex === meta.totalChunks - 1;
  return isLastChunk ? meta.size - meta.chunkSize * chunkIndex : meta.chunkSize;
}

/** Writes one chunk's raw bytes to its part file — overwritable, so a retried chunk just replaces it. */
export function writeChunk(
  inboxPath: string,
  slug: string,
  uploadId: string,
  chunkIndex: number,
  data: Buffer,
): void {
  const folderPath = resolveDraftFolder(inboxPath, slug);
  const sessionDir = sessionDirFor(folderPath, uploadId);
  const meta = readMeta(sessionDir);
  if (
    !Number.isInteger(chunkIndex) ||
    chunkIndex < 0 ||
    chunkIndex >= meta.totalChunks
  ) {
    throw new Error(
      `Invalid chunk index: ${chunkIndex} — must be between 0 and ${meta.totalChunks - 1}`,
    );
  }
  const expectedSize = expectedChunkSize(meta, chunkIndex);
  if (data.length !== expectedSize) {
    throw new Error(
      `Invalid chunk size: chunk ${chunkIndex} expected ${expectedSize} bytes, got ${data.length}`,
    );
  }
  writeFileSync(partPathFor(sessionDir, chunkIndex), data);
}

export function getUploadStatus(
  inboxPath: string,
  slug: string,
  uploadId: string,
): DigitizationUploadSession {
  const folderPath = resolveDraftFolder(inboxPath, slug);
  const sessionDir = sessionDirFor(folderPath, uploadId);
  const meta = readMeta(sessionDir);
  return toUploadSession(uploadId, meta, sessionDir);
}

/** Verifies every chunk arrived, assembles them in order, and atomically renames onto the side file. */
export function completeUpload(
  inboxPath: string,
  slug: string,
  uploadId: string,
): { filename: string; size: number } {
  const folderPath = resolveDraftFolder(inboxPath, slug);
  const sessionDir = sessionDirFor(folderPath, uploadId);
  const meta = readMeta(sessionDir);
  const received = listReceivedChunks(sessionDir);
  if (received.length !== meta.totalChunks) {
    const missing = Array.from(
      { length: meta.totalChunks },
      (_, i) => i,
    ).filter((chunkIndex) => !received.includes(chunkIndex));
    throw new Error(`Upload incomplete: missing chunks ${missing.join(', ')}`);
  }

  refuseNonEmptyTarget(folderPath, meta.filename);

  const assembledPath = join(sessionDir, ASSEMBLED_FILE);
  const fd = openSync(assembledPath, 'w');
  let totalWritten = 0;
  try {
    for (let chunkIndex = 0; chunkIndex < meta.totalChunks; chunkIndex++) {
      const chunk = readFileSync(partPathFor(sessionDir, chunkIndex));
      writeSync(fd, chunk);
      totalWritten += chunk.length;
    }
  } finally {
    closeSync(fd);
  }
  if (totalWritten !== meta.size) {
    rmSync(sessionDir, { recursive: true, force: true });
    throw new Error(
      `Upload incomplete: assembled ${totalWritten} bytes, expected ${meta.size}`,
    );
  }

  renameSync(assembledPath, join(folderPath, meta.filename));
  rmSync(sessionDir, { recursive: true, force: true });

  return { filename: meta.filename, size: meta.size };
}
