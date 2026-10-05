import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { basename, extname, join } from 'node:path';
import type { AlbumDataJson } from '@radio/types';

const FOLDER_PATTERN = /^(.+?)_(.+)$/;
const AUDIO_EXT = '.m4a';
const DATA_JSON = 'data.json';

export interface ScannedTrack {
  fileSlug: string;
}

export interface ScannedAlbum {
  folderSlug: string;
  artistName: string;
  albumName: string;
  tracks: ScannedTrack[];
  cover?: string;
  metadata?: AlbumDataJson;
}

/**
 * Converts a slug like "my-cool-album" into a Title Case name "My Cool Album".
 */
function slugToTitle(slug: string): string {
  return slug.replace(/-/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

/**
 * Strips the vinyl side+track prefix (e.g. "a1-", "b12-") from a file slug
 * and converts the remainder to Title Case.
 *
 * "a1-break-on-through" → "Break On Through"
 * "b5-the-end"          → "The End"
 */
export function trackSlugToTitle(fileSlug: string): string {
  const withoutPrefix = fileSlug.replace(/^[a-z]\d+-/, '');
  return slugToTitle(withoutPrefix);
}

/**
 * Scans a base directory for subdirectories matching the `artist-slug_album-slug` pattern.
 * Inside each matching subdirectory, collects all `.m4a` files as tracks.
 *
 * @param baseDir      - Absolute path to the media root directory
 * @param mediaBaseUrl - URL prefix (not used, kept for API compatibility - audio_url is computed at API layer)
 * @returns Array of parsed album objects with their tracks
 */
export function scanMediaDirectory(
  baseDir: string,
  mediaBaseUrl: string,
): ScannedAlbum[] {
  const results: ScannedAlbum[] = [];

  let entries: string[];
  try {
    entries = readdirSync(baseDir);
  } catch {
    return results;
  }

  for (const entry of entries) {
    const entryPath = join(baseDir, entry);

    // Only process directories
    if (!statSync(entryPath).isDirectory()) {
      continue;
    }

    // Match the artist-slug_album-slug naming convention
    const match = entry.match(FOLDER_PATTERN);
    if (!match) {
      continue;
    }

    const [, artistSlug, albumSlug] = match;
    const folderSlug = entry;

    // Collect all .m4a files inside this subdirectory
    let files: string[];
    try {
      files = readdirSync(entryPath);
    } catch {
      continue;
    }

    const tracks: ScannedTrack[] = files
      .filter((file) => extname(file).toLowerCase() === AUDIO_EXT)
      .sort()
      .map((file) => {
        const fileSlug = basename(file, AUDIO_EXT);
        return {
          fileSlug,
        };
      });

    // Check for cover image in img/ subdirectory
    let cover: string | undefined;
    const imgDirPath = join(entryPath, 'img');
    const coverPath = join(imgDirPath, 'cover.webp');
    if (
      existsSync(imgDirPath) &&
      statSync(imgDirPath).isDirectory() &&
      existsSync(coverPath)
    ) {
      cover = 'img/cover.webp';
    }

    // Check for data.json metadata
    let metadata: AlbumDataJson | undefined;
    const dataJsonPath = join(entryPath, DATA_JSON);
    if (existsSync(dataJsonPath) && statSync(dataJsonPath).isFile()) {
      try {
        const raw = readFileSync(dataJsonPath, 'utf-8');
        metadata = JSON.parse(raw) as AlbumDataJson;
      } catch {
        // Invalid JSON – skip metadata, continue with scan defaults
      }
    }

    results.push({
      folderSlug,
      artistName: slugToTitle(artistSlug),
      albumName: slugToTitle(albumSlug),
      tracks,
      cover,
      metadata,
    });
  }

  return results;
}
