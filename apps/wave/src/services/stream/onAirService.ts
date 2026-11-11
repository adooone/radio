import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { findSongById } from '@/db/albums/songs';
import { albumService } from '@/services/albums';
import { sessionPhotoService } from '@/services/albums/sessionPhotoService';
import { clientStore } from '@/ws/utils/clientStore';
import type { AirSong, OnAirState } from '@radio/types';

export type { AirSong, OnAirState };

/** How many played songs the player can look back on. */
export const RECENT_COUNT = 5;

/** A song for the player's eyes only: what it shows, not where it lives. */
const shown = ({ artist, title, cover, startedAt }: AirSong) => ({
  artist,
  title,
  cover,
  startedAt,
});

/**
 * The player's now_playing message. `elapsedMs` says how long ago the song
 * began on air, so a listener hearing the stream some seconds behind can
 * hold the new title until the music itself gets there: 0 when sent as the
 * song starts, its age when a listener connects mid-song.
 */
export function formatNowPlayingMessage(
  state: OnAirState | null,
  now: number = Date.now(),
  recent: AirSong[] = [],
): string {
  // The songs played before travel with every message, the air quiet or not.
  const history = recent.length ? { recent: recent.map(shown) } : {};
  if (!state) return JSON.stringify({ type: 'now_playing', ...history });
  const { artist, title, cover, backdrop, setAt, next } = state;
  const started = Date.parse(setAt);
  return JSON.stringify({
    type: 'now_playing',
    artist,
    title,
    cover,
    backdrop,
    elapsedMs: Number.isNaN(started) ? 0 : Math.max(0, now - started),
    ...(next ? { next: shown(next) } : {}),
    ...history,
  });
}

interface AlbumLookup {
  id: number;
  artist: string;
  title: string;
  coverImageUrl: string | null;
  /** The album's session photos, for the room behind the record. */
  backdrops?: string[];
}

interface SongLookup {
  id: number;
  albumId: number;
  title: string;
  artist: string | null;
}

interface OnAirDeps {
  filePath: string;
  /** The last songs played, newest first. */
  historyPath: string;
  getAlbum: (id: number) => Promise<AlbumLookup | null>;
  getSong: (id: number) => Promise<SongLookup | null>;
  broadcast: (message: string) => void;
  /** Picks among the session photos: 0 ≤ n < 1, like Math.random. */
  random: () => number;
}

/**
 * One of the album's session photos for the next song: any of them, but not
 * the one the last song showed while there is another to move on to.
 */
export function pickBackdrop(
  photos: string[] | undefined,
  previous: string | undefined,
  random: () => number,
): string | undefined {
  if (!photos?.length) return undefined;
  const choices =
    photos.length > 1 ? photos.filter((photo) => photo !== previous) : photos;
  return choices[Math.floor(random() * choices.length) % choices.length];
}

const defaultDeps = (): OnAirDeps => ({
  filePath: join(process.cwd(), 'data', 'on-air.json'),
  historyPath: join(process.cwd(), 'data', 'on-air-history.json'),
  broadcast: (message) => clientStore.broadcast(message),
  random: Math.random,
  getAlbum: async (id) => {
    try {
      const album = await albumService.getAlbumById(id);
      return {
        id: album.id,
        artist: album.artist,
        title: album.title,
        coverImageUrl: album.coverImageUrl,
        backdrops: album.folderSlug
          ? sessionPhotoService.list(album.folderSlug).map((p) => p.url)
          : [],
      };
    } catch {
      return null;
    }
  },
  getSong: async (id) => {
    const song = await findSongById(id);
    if (!song) return null;
    return {
      id: song.id,
      albumId: song.albumId,
      title: song.title,
      artist: song.artist ?? null,
    };
  },
});

export class OnAirService {
  private deps: OnAirDeps;
  private current: OnAirState | null = null;
  private recent: AirSong[] = [];

  constructor(deps: Partial<OnAirDeps> = {}) {
    this.deps = {
      ...defaultDeps(),
      // A test's own on-air file keeps its history beside it.
      ...(deps.filePath && !deps.historyPath
        ? { historyPath: `${deps.filePath}.history` }
        : {}),
      ...deps,
    };
    this.load();
  }

  /** The songs played before the one on air, newest first. */
  getRecent(): AirSong[] {
    return [...this.recent];
  }

  /** The message for a listener joining now: the song's age and the history. */
  nowPlayingMessage(now: number = Date.now()): string {
    return formatNowPlayingMessage(this.current, now, this.recent);
  }

  /** The song after `songId` on `albumId`, as the player shows it. */
  private async resolveSong(ref: {
    albumId: number;
    songId?: number;
  }): Promise<AirSong | undefined> {
    const album = await this.deps.getAlbum(ref.albumId);
    if (!album) return undefined;
    const song =
      ref.songId !== undefined ? await this.deps.getSong(ref.songId) : null;
    return {
      albumId: album.id,
      songId: song?.id,
      artist: song?.artist || album.artist,
      title: song?.title ?? album.title,
      cover: album.coverImageUrl ?? undefined,
    };
  }

  /** The song leaving the air joins the history, unless it is staying on. */
  private retire(next?: { albumId: number; songId?: number }) {
    const leaving = this.current;
    if (!leaving) return;
    if (
      next &&
      leaving.albumId === next.albumId &&
      leaving.songId === next.songId
    ) {
      return;
    }
    this.recent = [
      {
        albumId: leaving.albumId,
        songId: leaving.songId,
        artist: leaving.artist,
        title: leaving.title,
        cover: leaving.cover,
        startedAt: leaving.setAt,
      },
      ...this.recent,
    ].slice(0, RECENT_COUNT);
  }

  async setOnAir(
    albumId: number,
    songId?: number,
    source: OnAirState['source'] = 'admin',
    upcoming?: { albumId: number; songId?: number },
  ): Promise<OnAirState> {
    const album = await this.deps.getAlbum(albumId);
    if (!album) {
      throw new Error(`Album with ID ${albumId} not found`);
    }

    let title = album.title;
    let artist = album.artist;
    let resolvedSongId: number | undefined;

    if (songId !== undefined) {
      const song = await this.deps.getSong(songId);
      if (!song || song.albumId !== albumId) {
        throw new Error(`Song with ID ${songId} not found on album ${albumId}`);
      }
      resolvedSongId = song.id;
      title = song.title;
      artist = song.artist || album.artist;
    }

    const next = upcoming ? await this.resolveSong(upcoming) : undefined;
    this.retire({ albumId: album.id, songId: resolvedSongId });
    this.current = {
      albumId: album.id,
      songId: resolvedSongId,
      artist,
      title,
      cover: album.coverImageUrl ?? undefined,
      backdrop: pickBackdrop(
        album.backdrops,
        this.current?.backdrop,
        this.deps.random,
      ),
      setAt: new Date().toISOString(),
      source,
      ...(next ? { next } : {}),
    };
    this.persist();
    // Sent as the song begins: nothing of it has played yet.
    this.deps.broadcast(this.nowPlayingMessage(Date.parse(this.current.setAt)));
    return this.current;
  }

  clearOnAir(): void {
    this.retire();
    this.current = null;
    this.persist();
    this.deps.broadcast(this.nowPlayingMessage());
  }

  getOnAir(): OnAirState | null {
    return this.current;
  }

  private load() {
    try {
      if (existsSync(this.deps.filePath)) {
        const data = readFileSync(this.deps.filePath, 'utf8');
        this.current = data ? (JSON.parse(data) as OnAirState) : null;
      }
    } catch (err) {
      console.error('Failed to load on-air state', err);
    }
    try {
      if (existsSync(this.deps.historyPath)) {
        const data = readFileSync(this.deps.historyPath, 'utf8');
        this.recent = data ? (JSON.parse(data) as AirSong[]) : [];
      }
    } catch (err) {
      console.error('Failed to load the on-air history', err);
    }
  }

  private persist() {
    try {
      mkdirSync(dirname(this.deps.filePath), { recursive: true });
      writeFileSync(
        this.deps.filePath,
        this.current ? JSON.stringify(this.current) : '',
        'utf8',
      );
      writeFileSync(this.deps.historyPath, JSON.stringify(this.recent), 'utf8');
    } catch (err) {
      console.error('Failed to write on-air state', err);
    }
  }
}

export const onAirService = new OnAirService();
