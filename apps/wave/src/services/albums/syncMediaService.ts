import { join } from 'node:path';
import {
  createAlbum,
  findAlbumByFolderSlug,
  findAlbumsWithFolderSlug,
  updateAlbum,
} from '@/db/albums/albums';
import {
  createSong,
  findSongByAlbumAndFileSlug,
  updateSong,
} from '@/db/albums/songs';
import { extractDurationFromFile, formatDuration } from '@/utils/audioMetadata';
import {
  type ScannedAlbum,
  scanMediaDirectory,
  trackSlugToTitle,
} from '@/utils/scanMediaDirectory';

export interface SyncResult {
  albumsCreated: number;
  albumsUpdated: number;
  albumsMarkedOffline: number;
  tracksCreated: number;
  tracksUpdated: number;
  errors: string[];
}

/**
 * Scans a media directory and synchronises the results into the database.
 *
 * Album logic:
 *   – If an album with the given folder_slug exists → set has_media = true.
 *   – If it doesn't exist → create it (has_media = true, is_published = false).
 *   – Albums that have a folder_slug in the DB but were NOT found in this scan → has_media = false.
 *
 * Track logic (upsert by album_id + file_slug):
 *   – New track   → INSERT with defaults derived from the file slug.
 *   – Existing track → UPDATE duration (extracted from file) if successfully extracted.
 *   – NEVER overwrites manually-entered metadata (title, artist).
 *   – Duration is always recalculated from the file during sync.
 *   – audio_url is computed dynamically at API layer, not stored in database.
 *
 * @param baseDir      – absolute path to the media root directory
 * @param mediaBaseUrl – URL prefix used to construct audio_url values (not stored, only for scanning)
 * @param ownerId      – account id used as the owner when creating new albums
 */
export async function syncMediaToDatabase(
  baseDir: string,
  mediaBaseUrl: string,
  ownerId: number,
): Promise<SyncResult> {
  const result: SyncResult = {
    albumsCreated: 0,
    albumsUpdated: 0,
    albumsMarkedOffline: 0,
    tracksCreated: 0,
    tracksUpdated: 0,
    errors: [],
  };

  // 1. Scan the file system
  const scannedAlbums = scanMediaDirectory(baseDir, mediaBaseUrl);
  const scannedSlugs = new Set(scannedAlbums.map((a) => a.folderSlug));

  // 2. Sync each scanned album → DB
  for (const scanned of scannedAlbums) {
    try {
      const albumId = await syncAlbum(scanned, ownerId, result);
      await syncTracks(albumId, scanned, result, baseDir);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      result.errors.push(`[${scanned.folderSlug}] ${msg}`);
    }
  }

  // 3. Mark albums that are no longer on disk as has_media = false
  try {
    await markMissingAlbums(scannedSlugs, result);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    result.errors.push(`[mark-missing] ${msg}`);
  }

  return result;
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function buildAlbumDataFromMetadata(
  scanned: ScannedAlbum,
  ownerId: number,
): Parameters<typeof createAlbum>[0] {
  const m = scanned.metadata;
  const base = {
    title: m?.album_title ?? scanned.albumName,
    artist: m?.artist ?? scanned.artistName,
    ownerId,
    folderSlug: scanned.folderSlug,
    hasMedia: 1,
    isPublished: 0,
    isPublic: 0,
    cover: scanned.cover,
    year: m?.recording_year != null ? m.recording_year : undefined,
    releaseYear:
      m?.release_info?.issue_year != null
        ? m.release_info.issue_year
        : undefined,
    recordingDetails: m?.recording_details
      ? JSON.stringify(m.recording_details)
      : undefined,
    releaseInfo: m?.release_info ? JSON.stringify(m.release_info) : undefined,
    personnel: m?.personnel ? JSON.stringify(m.personnel) : undefined,
    production: m?.production ? JSON.stringify(m.production) : undefined,
    visuals: m?.visuals ? JSON.stringify(m.visuals) : undefined,
    additionalInfo: m?.additional_info ?? undefined,
  };
  return base;
}

async function syncAlbum(
  scanned: ScannedAlbum,
  ownerId: number,
  result: SyncResult,
): Promise<number> {
  const existing = await findAlbumByFolderSlug(scanned.folderSlug);

  if (existing) {
    const updateData: Parameters<typeof updateAlbum>[1] = {};
    if (!existing.hasMedia) {
      updateData.hasMedia = 1;
    }
    if (scanned.cover && !existing.cover) {
      updateData.cover = scanned.cover;
    }
    // When data.json exists, upsert metadata from it
    if (scanned.metadata) {
      const m = scanned.metadata;
      updateData.title = m.album_title ?? existing.title;
      updateData.artist = m.artist ?? existing.artist;
      if (m.recording_year != null) updateData.year = m.recording_year;
      if (m.release_info?.issue_year != null)
        updateData.releaseYear = m.release_info.issue_year;
      if (m.recording_details)
        updateData.recordingDetails = JSON.stringify(m.recording_details);
      if (m.release_info)
        updateData.releaseInfo = JSON.stringify(m.release_info);
      if (m.personnel) updateData.personnel = JSON.stringify(m.personnel);
      if (m.production) updateData.production = JSON.stringify(m.production);
      if (m.visuals) updateData.visuals = JSON.stringify(m.visuals);
      if (m.additional_info != null)
        updateData.additionalInfo = m.additional_info;
    }
    if (Object.keys(updateData).length > 0) {
      await updateAlbum(existing.id, updateData);
    }
    result.albumsUpdated++;
    return existing.id;
  }

  const albumId = await createAlbum(
    buildAlbumDataFromMetadata(scanned, ownerId),
  );
  result.albumsCreated++;
  return albumId;
}

/** Match tracklist item to fileSlug by position (e.g. A1 → a1-song-name) */
function findTracklistMatch(
  fileSlug: string,
  tracklist: Array<{ position: string; title: string }>,
): { position: string; title: string } | undefined {
  const slugLower = fileSlug.toLowerCase();
  return tracklist.find((t) => {
    const posLower = t.position.toLowerCase();
    return slugLower === posLower || slugLower.startsWith(`${posLower}-`);
  });
}

async function syncTracks(
  albumId: number,
  scanned: ScannedAlbum,
  result: SyncResult,
  baseDir: string,
): Promise<void> {
  const tracklist = scanned.metadata?.tracklist;

  for (let i = 0; i < scanned.tracks.length; i++) {
    const track = scanned.tracks[i];
    const existing = await findSongByAlbumAndFileSlug(albumId, track.fileSlug);
    const match = tracklist
      ? findTracklistMatch(track.fileSlug, tracklist)
      : undefined;
    const title = match?.title ?? trackSlugToTitle(track.fileSlug);
    const position = match?.position ?? undefined;

    // Extract duration from the actual audio file
    const filePath = join(baseDir, scanned.folderSlug, `${track.fileSlug}.m4a`);
    let duration: string | null = null;

    try {
      const durationSeconds = await extractDurationFromFile(filePath);
      if (durationSeconds !== null) {
        duration = formatDuration(durationSeconds);
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      result.errors.push(
        `[${scanned.folderSlug}/${track.fileSlug}] Failed to extract duration: ${msg}`,
      );
    }

    if (existing) {
      const updateData: {
        duration?: string;
        title?: string;
        position?: string;
      } = {};
      if (duration) updateData.duration = duration;
      if (match) {
        updateData.title = match.title;
        updateData.position = match.position;
      }
      if (Object.keys(updateData).length > 0) {
        await updateSong(existing.id, updateData);
        result.tracksUpdated++;
      }
      continue;
    }

    await createSong({
      albumId,
      audioFileId: 0,
      trackNumber: i + 1,
      title,
      duration: duration || '0:00',
      format: 'm4a',
      fileSlug: track.fileSlug,
      position,
    });

    result.tracksCreated++;
  }
}

async function markMissingAlbums(
  scannedSlugs: Set<string>,
  result: SyncResult,
): Promise<void> {
  const albumsWithSlug = await findAlbumsWithFolderSlug();

  for (const album of albumsWithSlug) {
    if (
      album.folderSlug &&
      !scannedSlugs.has(album.folderSlug) &&
      album.hasMedia
    ) {
      await updateAlbum(album.id, { hasMedia: 0 });
      result.albumsMarkedOffline++;
    }
  }
}
