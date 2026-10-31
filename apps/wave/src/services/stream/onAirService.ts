import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { findSongById } from '@/db/albums/songs';
import { albumService } from '@/services/albums';
import { clientStore } from '@/ws/utils/clientStore';

export interface OnAirState {
  albumId: number;
  songId?: number;
  artist: string;
  title: string;
  cover?: string;
  setAt: string;
}

export function formatNowPlayingMessage(state: OnAirState | null): string {
  if (!state) return JSON.stringify({ type: 'now_playing' });
  const { artist, title, cover } = state;
  return JSON.stringify({ type: 'now_playing', artist, title, cover });
}

interface AlbumLookup {
  id: number;
  artist: string;
  title: string;
  coverImageUrl: string | null;
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
}

const defaultDeps = (): OnAirDeps => ({
  filePath: join(process.cwd(), 'data', 'on-air.json'),
  broadcast: (message) => clientStore.broadcast(message),
  getAlbum: async (id) => {
    try {
      const album = await albumService.getAlbumById(id);
      return {
        id: album.id,
        artist: album.artist,
        title: album.title,
        coverImageUrl: album.coverImageUrl,
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

  async setOnAir(albumId: number, songId?: number): Promise<OnAirState> {
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
      setAt: new Date().toISOString(),
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
