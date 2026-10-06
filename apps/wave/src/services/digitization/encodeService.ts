import { execFile } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, statSync } from 'node:fs';
import { extname, join } from 'node:path';
import { findDraftCover, getDraft, resolveDraftFolder } from './inboxService';

const AAC_ARGS = ['-c:a', 'aac', '-b:a', '256k', '-ar', '48000'];
const ENCODED_AUDIO_EXT = '.m4a';
const COVER_WEBP_QUALITY = 80;
const ENCODED_COVER_REL_PATH = join('img', 'cover.webp');
const DATA_JSON = 'data.json';

export interface EncodeDraftResult {
  slug: string;
  encodedTracks: string[];
  skippedTracks: string[];
  coverEncoded: boolean;
}

/** A zero-byte output is a crashed previous run, not a finished encode. */
function isNonEmptyFile(path: string): boolean {
  return existsSync(path) && statSync(path).size > 0;
}

function runFfmpeg(args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    execFile('ffmpeg', args, (error) => {
      if (error) {
        reject(error);
        return;
      }
      resolve();
    });
  });
}

async function encodeCoverWithFfmpeg(
  sourcePath: string,
  targetPath: string,
): Promise<void> {
  await runFfmpeg([
    '-i',
    sourcePath,
    '-vcodec',
    'libwebp',
    '-quality',
    String(COVER_WEBP_QUALITY),
    '-loglevel',
    'error',
    '-y',
    targetPath,
  ]);
}

async function encodeCoverWithSharp(
  sourcePath: string,
  targetPath: string,
): Promise<void> {
  const sharp = (await import('sharp')).default;
  await sharp(sourcePath)
    .webp({ quality: COVER_WEBP_QUALITY })
    .toFile(targetPath);
}

async function encodeCover(
  sourcePath: string,
  targetPath: string,
  log: (line: string) => void,
): Promise<void> {
  try {
    await encodeCoverWithFfmpeg(sourcePath, targetPath);
  } catch {
    log('ffmpeg webp encode failed, falling back to sharp');
    await encodeCoverWithSharp(sourcePath, targetPath);
  }
}

async function encodeTracks(
  folderPath: string,
  targetDir: string,
  trackFiles: string[],
  log: (line: string) => void,
): Promise<{ encoded: string[]; skipped: string[] }> {
  const encoded: string[] = [];
  const skipped: string[] = [];

  for (const wavFile of trackFiles) {
    const baseName = wavFile.slice(0, -extname(wavFile).length);
    const targetPath = join(targetDir, `${baseName}${ENCODED_AUDIO_EXT}`);
    if (isNonEmptyFile(targetPath)) {
      skipped.push(baseName);
      log(`skip ${baseName}${ENCODED_AUDIO_EXT} (already encoded)`);
      continue;
    }
    log(`encoding ${wavFile}...`);
    await runFfmpeg([
      '-i',
      join(folderPath, wavFile),
      ...AAC_ARGS,
      '-loglevel',
      'error',
      '-y',
      targetPath,
    ]);
    encoded.push(baseName);
  }

  return { encoded, skipped };
}

async function encodeDraftCover(
  folderPath: string,
  targetDir: string,
  log: (line: string) => void,
): Promise<boolean> {
  const coverRelPath = findDraftCover(folderPath);
  if (!coverRelPath) {
    log('no cover found, skipping');
    return false;
  }

  const targetCoverPath = join(targetDir, ENCODED_COVER_REL_PATH);
  if (isNonEmptyFile(targetCoverPath)) {
    log('skip cover (already encoded)');
    return false;
  }

  mkdirSync(join(targetDir, 'img'), { recursive: true });

  if (coverRelPath === ENCODED_COVER_REL_PATH) {
    copyFileSync(join(folderPath, coverRelPath), targetCoverPath);
    log('copied existing cover.webp');
  } else {
    log(`encoding cover ${coverRelPath}...`);
    await encodeCover(join(folderPath, coverRelPath), targetCoverPath, log);
  }
  return true;
}

function copyDataJson(
  folderPath: string,
  targetDir: string,
  log: (line: string) => void,
): void {
  const sourcePath = join(folderPath, DATA_JSON);
  if (!existsSync(sourcePath) || !statSync(sourcePath).isFile()) {
    return;
  }
  copyFileSync(sourcePath, join(targetDir, DATA_JSON));
  log('copied data.json');
}

/** Encodes a draft's cut tracks + cover into `<MEDIA_ROOT>/<slug>/`, skipping anything already there. */
export async function encodeDraft(
  inboxPath: string,
  mediaRootPath: string,
  slug: string,
  log: (line: string) => void,
): Promise<EncodeDraftResult> {
  const folderPath = resolveDraftFolder(inboxPath, slug);
  const draft = getDraft(inboxPath, mediaRootPath, slug);
  if (draft.trackFiles.length === 0) {
    throw new Error('No cut tracks to encode — split the sides first.');
  }

  const targetDir = join(mediaRootPath, slug);
  mkdirSync(targetDir, { recursive: true });

  const { encoded, skipped } = await encodeTracks(
    folderPath,
    targetDir,
    draft.trackFiles,
    log,
  );
  const coverEncoded = await encodeDraftCover(folderPath, targetDir, log);
  copyDataJson(folderPath, targetDir, log);

  return {
    slug,
    encodedTracks: encoded,
    skippedTracks: skipped,
    coverEncoded,
  };
}
