import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { findSongById } from '@/db/albums/songs';
import { albumService } from '@/services/albums';
import { sessionPhotoService } from '@/services/albums/sessionPhotoService';
import { clientStore } from '@/ws/utils/clientStore';
import type { OnAirState } from '@radio/types';

export type { OnAirState };

export function formatNowPlayingMessage(state: OnAirState | null): string {
  if (!state) return JSON.stringify({ type: 'now_playing' });
  const { artist, title, cover, backdrop } = state;
  return JSON.stringify({
    type: 'now_playing',
    artist,
    title,
    cover,
    backdrop,
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

  constructor(deps: Partial<OnAirDeps> = {}) {
    this.deps = { ...defaultDeps(), ...deps };
    this.load();
  }

  async setOnAir(
    albumId: number,
    songId?: number,
    source: OnAirState['source'] = 'admin',
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
    };
    this.persist();
    this.deps.broadcast(formatNowPlayingMessage(this.current));
    return this.current;
  }

  clearOnAir(): void {
    this.current = null;
    this.persist();
    this.deps.broadcast(formatNowPlayingMessage(this.current));
  }

  getOnAir(): OnAirState | null {
    return this.current;
  }

  private load() {
    try {
      if (!existsSync(this.deps.filePath)) return;
      const data = readFileSync(this.deps.filePath, 'utf8');
      this.current = data ? (JSON.parse(data) as OnAirState) : null;
    } catch (err) {
      console.error('Failed to load on-air state', err);
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
    } catch (err) {
      console.error('Failed to write on-air state', err);
    }
  }
}

export const onAirService = new OnAirService();
