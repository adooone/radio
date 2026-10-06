import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  unlinkSync,
  writeFileSync,
} from 'node:fs';
import { join } from 'node:path';
import type {
  AlbumDataJson,
  DigitizationDraft,
  DigitizationStage,
} from '@radio/types';
import { slugify } from './slug';

const DRAFT_FOLDER_PATTERN = /^[a-z0-9-]+_[a-z0-9-]+$/;
const DATA_JSON = 'data.json';
const RAW_COVER_CANDIDATES = ['cover.jpg', 'cover.jpeg', 'cover.png'];
const ENCODED_EXT = '.m4a';
const COVER_MIME_TYPES: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
};

function slugToTitle(slug: string): string {
  return slug.replace(/-/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

function splitFolderSlug(slug: string): {
  artistSlug: string;
  albumSlug: string;
} {
  const separator = slug.indexOf('_');
  return {
    artistSlug: slug.slice(0, separator),
    albumSlug: slug.slice(separator + 1),
  };
}

function isDirectory(path: string): boolean {
  try {
    return statSync(path).isDirectory();
  } catch {
    return false;
  }
}

function dataJsonPathFor(folderPath: string): string {
  return join(folderPath, DATA_JSON);
}

export function readMetadata(folderPath: string): AlbumDataJson | undefined {
  const dataJsonPath = dataJsonPathFor(folderPath);
  if (!existsSync(dataJsonPath) || !statSync(dataJsonPath).isFile()) {
    return undefined;
  }
  try {
    return JSON.parse(readFileSync(dataJsonPath, 'utf-8')) as AlbumDataJson;
  } catch {
    return undefined;
  }
}

/**
 * The draft stage: a raw Discogs/manual download (cover.jpg|png) before encode,
 * or an already-encoded cover (img/cover.webp) carried over from a republish.
 */
export function findDraftCover(folderPath: string): string | undefined {
  for (const name of RAW_COVER_CANDIDATES) {
    if (existsSync(join(folderPath, name))) {
      return name;
    }
  }
  const encodedCoverRelPath = join('img', 'cover.webp');
  if (existsSync(join(folderPath, encodedCoverRelPath))) {
    return encodedCoverRelPath;
  }
  return undefined;
}

function listNonEmptyWavs(folderPath: string): string[] {
  let entries: string[];
  try {
    entries = readdirSync(folderPath);
  } catch {
    return [];
  }
  return entries
    .filter((entry) => entry.toLowerCase().endsWith('.wav'))
    .filter((entry) => {
      try {
        return statSync(join(folderPath, entry)).size > 0;
      } catch {
        return false;
      }
    })
    .sort();
}

function countEncodedTracks(mediaRootPath: string, slug: string): number {
  const albumDir = join(mediaRootPath, slug);
  if (!isDirectory(albumDir)) {
    return 0;
  }
  try {
    return readdirSync(albumDir).filter((file) => {
      if (!file.toLowerCase().endsWith(ENCODED_EXT)) {
        return false;
      }
      try {
        return statSync(join(albumDir, file)).size > 0;
      } catch {
        return false;
      }
    }).length;
  } catch {
    return 0;
  }
}

function deriveStage(
  sides: string[],
  trackFiles: string[],
  encodedCount: number,
  tracklistCount: number,
): DigitizationStage {
  // On air only once every known track is encoded — a partial encode must
  // not pass as published (it would unlock the destructive cleanup).
  const expectedTracks = Math.max(trackFiles.length, tracklistCount);
  if (encodedCount > 0 && encodedCount >= expectedTracks) return 'on-air';
  if (trackFiles.length > 0) return 'ready-to-encode';
  if (sides.length > 0) return 'ready-to-split';
  return 'awaiting-sides';
}

function buildDraft(
  inboxPath: string,
  mediaRootPath: string,
  slug: string,
): DigitizationDraft {
  const folderPath = join(inboxPath, slug);
  const { artistSlug, albumSlug } = splitFolderSlug(slug);
  const metadata = readMetadata(folderPath);
  const wavs = listNonEmptyWavs(folderPath);
  const sides = wavs.filter((file) => file.startsWith('side-'));
  const trackFiles = wavs.filter((file) => !file.startsWith('side-'));
  const encodedCount = countEncodedTracks(mediaRootPath, slug);
  const release = metadata?.release_info;

  return {
    slug,
    artistSlug,
    albumSlug,
    artist: metadata?.artist || slugToTitle(artistSlug),
    title: metadata?.album_title || slugToTitle(albumSlug),
    recordingYear: metadata?.recording_year ?? null,
    issueYear: release?.issue_year ?? null,
    label: release?.label ?? '',
    country: release?.country ?? '',
    hasMetadata: metadata !== undefined,
    trackCount: metadata?.tracklist?.length ?? 0,
    hasCover: findDraftCover(folderPath) !== undefined,
    sides,
    trackFiles,
    encodedCount,
    stage: deriveStage(
      sides,
      trackFiles,
      encodedCount,
      metadata?.tracklist?.length ?? 0,
    ),
    metadata,
  };
}

/** Lists every `band-slug_album-slug` folder under the inbox, each as a derived draft. */
export function listDrafts(
  inboxPath: string,
  mediaRootPath: string,
): DigitizationDraft[] {
  let entries: string[];
  try {
    entries = readdirSync(inboxPath);
  } catch {
    return [];
  }

  return entries
    .filter((entry) => DRAFT_FOLDER_PATTERN.test(entry))
    .filter((entry) => isDirectory(join(inboxPath, entry)))
    .sort()
    .map((slug) => buildDraft(inboxPath, mediaRootPath, slug));
}

/** Resolves a draft's folder path, guarding against path traversal via the slug. */
export function resolveDraftFolder(inboxPath: string, slug: string): string {
  if (!DRAFT_FOLDER_PATTERN.test(slug)) {
    throw new Error(
      `Invalid draft slug "${slug}" — expected band-slug_album-slug (lowercase letters, digits, hyphens)`,
    );
  }
  const folderPath = join(inboxPath, slug);
  if (!isDirectory(folderPath)) {
    throw new Error('Not found');
  }
  return folderPath;
}

export function getDraft(
  inboxPath: string,
  mediaRootPath: string,
  slug: string,
): DigitizationDraft {
  resolveDraftFolder(inboxPath, slug);
  return buildDraft(inboxPath, mediaRootPath, slug);
}

/** Builds a `band-slug_album-slug` folder name from free-text artist/album, or validates a raw slug. */
export function deriveDraftSlug(input: {
  slug?: string;
  artist?: string;
  album?: string;
}): string {
  if (input.slug) {
    if (!DRAFT_FOLDER_PATTERN.test(input.slug)) {
      throw new Error(
        `Invalid draft slug "${input.slug}" — expected band-slug_album-slug (lowercase letters, digits, hyphens)`,
      );
    }
    return input.slug;
  }
  const artistSlug = slugify(input.artist ?? '');
  const albumSlug = slugify(input.album ?? '');
  const slug = `${artistSlug}_${albumSlug}`;
  if (!DRAFT_FOLDER_PATTERN.test(slug)) {
    throw new Error(
      `Could not derive a valid slug from artist "${input.artist}" and album "${input.album}"`,
    );
  }
  return slug;
}

/** Creates (or reuses) the inbox folder for a draft and returns it as a derived draft. */
export function createDraft(
  inboxPath: string,
  mediaRootPath: string,
  input: { slug?: string; artist?: string; album?: string },
): DigitizationDraft {
  const slug = deriveDraftSlug(input);
  mkdirSync(join(inboxPath, slug), { recursive: true });
  return buildDraft(inboxPath, mediaRootPath, slug);
}

/** True if the draft folder already has a `data.json` (would be overwritten by a re-fetch). */
export function hasDraftMetadata(inboxPath: string, slug: string): boolean {
  const folderPath = resolveDraftFolder(inboxPath, slug);
  return existsSync(dataJsonPathFor(folderPath));
}

/** Writes `data.json` verbatim — used for both a Discogs-seeded fetch and a manual edit save. */
export function writeDraftMetadata(
  inboxPath: string,
  slug: string,
  data: AlbumDataJson,
): AlbumDataJson {
  const folderPath = resolveDraftFolder(inboxPath, slug);
  writeFileSync(
    dataJsonPathFor(folderPath),
    `${JSON.stringify(data, null, 2)}\n`,
    'utf-8',
  );
  return data;
}

/** Saves a raw cover download, skipping it if the draft already has one (never-overwrite). */
export function writeDraftCoverIfAbsent(
  inboxPath: string,
  slug: string,
  buffer: Buffer,
  extension: string,
): boolean {
  const folderPath = resolveDraftFolder(inboxPath, slug);
  if (findDraftCover(folderPath)) {
    return false;
  }
  writeFileSync(join(folderPath, `cover.${extension}`), buffer);
  return true;
}

export function getDraftCover(
  inboxPath: string,
  slug: string,
): { buffer: Buffer; mimeType: string; size: number } {
  const folderPath = resolveDraftFolder(inboxPath, slug);
  const coverRelPath = findDraftCover(folderPath);
  if (!coverRelPath) {
    throw new Error('Not found');
  }
  const buffer = readFileSync(join(folderPath, coverRelPath));
  const extension = coverRelPath.split('.').pop() || 'jpg';
  return {
    buffer,
    mimeType: COVER_MIME_TYPES[extension.toLowerCase()] || 'image/jpeg',
    size: buffer.length,
  };
}

const SIDE_WAV_PATTERN = /^side-.+\.wav$/i;

/** A draft must be published (encoded under MEDIA_ROOT_PATH) before its raw inbox files may be deleted. */
function requirePublishedDraft(
  inboxPath: string,
  mediaRootPath: string,
  slug: string,
): void {
  const draft = getDraft(inboxPath, mediaRootPath, slug);
  if (draft.stage !== 'on-air') {
    throw new Error('Cannot clean up a draft that has not been published yet');
  }
}

/** Deletes the raw `side-*.wav` recordings of a published draft. Never runs automatically. */
export function deleteDraftSideWavs(
  inboxPath: string,
  mediaRootPath: string,
  slug: string,
): string[] {
  requirePublishedDraft(inboxPath, mediaRootPath, slug);
  const folderPath = resolveDraftFolder(inboxPath, slug);
  const deleted = readdirSync(folderPath).filter((entry) =>
    SIDE_WAV_PATTERN.test(entry),
  );
  for (const entry of deleted) {
    unlinkSync(join(folderPath, entry));
  }
  return deleted;
}

/** Deletes the whole inbox folder of a published draft. Never runs automatically. */
export function deleteDraftFolder(
  inboxPath: string,
  mediaRootPath: string,
  slug: string,
): void {
  requirePublishedDraft(inboxPath, mediaRootPath, slug);
  const folderPath = resolveDraftFolder(inboxPath, slug);
  rmSync(folderPath, { recursive: true, force: true });
}
