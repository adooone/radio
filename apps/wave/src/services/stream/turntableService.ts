import { execFile, spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { createInterface } from 'node:readline';
import { findAlbumById, findSongsByAlbum } from '@/db/albums';
import { env } from '@/utils/env';
import type { TurntableState, TurntableTrack } from '@radio/types';
import { onAirService } from './onAirService';

export interface QueuedTrack extends TurntableTrack {
  filePath: string;
}

/** A running publisher: reports how far it has played, and when it ends. */
export interface Player {
  onProgress(listener: (playedSec: number) => void): void;
  onExit(listener: (code: number | null) => void): void;
  stop(): void;
}

export interface TurntableDeps {
  /** The album's tracks from the chosen song onward; throws when there is nothing to play. */
  loadQueue: (albumId: number, fromSongId?: number) => Promise<QueuedTrack[]>;
  spawnPlayer: (tracks: QueuedTrack[]) => Player;
  /** Called as each track starts, with the on-air state to set. */
  onTrack: (albumId: number, songId: number) => Promise<unknown>;
  /** Called when the queue has played to its end (not on a stop). */
  onFinished: () => void;
  log: (line: string) => void;
}

/** `m:ss` or `h:mm:ss`, as the songs table stores it. */
export function parseDuration(text: string): number {
  const parts = text.trim().split(':').map(Number);
  if (parts.some(Number.isNaN) || parts.length === 0) return 0;
  return parts.reduce((total, part) => total * 60 + part, 0);
}

/** The ffmpeg concat demuxer's list: one quoted path per line. */
export function concatList(tracks: QueuedTrack[]): string {
  return `${tracks
    .map((track) => `file '${track.filePath.replace(/'/g, "'\\''")}'`)
    .join('\n')}\n`;
}

/** Which track is playing `playedSec` into the queue. */
export function trackIndexAt(tracks: QueuedTrack[], playedSec: number): number {
  let elapsed = 0;
  for (let i = 0; i < tracks.length; i++) {
    elapsed += tracks[i].durationSec;
    if (playedSec < elapsed) return i;
  }
  return tracks.length - 1;
}

/** `out_time=HH:MM:SS.micro` from ffmpeg's `-progress` stream. */
export function parseProgressLine(line: string): number | null {
  const match = /^out_time=(\d+):(\d+):(\d+(?:\.\d+)?)/.exec(line);
  if (!match) return null;
  return Number(match[1]) * 3600 + Number(match[2]) * 60 + Number(match[3]);
}

const probeDuration = (filePath: string): Promise<number | null> =>
  new Promise((resolve) => {
    execFile(
      'ffprobe',
      [
        '-v',
        'error',
        '-show_entries',
        'format=duration',
        '-of',
        'default=nw=1:nk=1',
        filePath,
      ],
      (error, stdout) => {
        const seconds = Number.parseFloat(stdout);
        resolve(error || Number.isNaN(seconds) ? null : seconds);
      },
    );
  });

const loadQueueFromLibrary: TurntableDeps['loadQueue'] = async (
  albumId,
  fromSongId,
) => {
  const album = await findAlbumById(albumId);
  if (!album) throw new Error(`Album with ID ${albumId} not found`);
  if (!album.folderSlug) {
    throw new Error(`Nothing to play: album ${albumId} has no media folder`);
  }
  const songs = await findSongsByAlbum(albumId);
  let from = 0;
  if (fromSongId !== undefined) {
    from = songs.findIndex((song) => song.id === fromSongId);
    if (from < 0) {
      throw new Error(
        `Song with ID ${fromSongId} not found on album ${albumId}`,
      );
    }
  }
  const tracks: QueuedTrack[] = songs
    .slice(from)
    .filter((song) => song.fileSlug)
    .map((song) => ({
      songId: song.id,
      title: song.title,
      trackNumber: song.trackNumber,
      durationSec: parseDuration(song.duration),
      filePath: join(
        env.mediaRootPath,
        album.folderSlug as string,
        `${song.fileSlug}.m4a`,
      ),
    }));
  if (tracks.length === 0) {
    throw new Error(`Nothing to play: album ${albumId} has no track files`);
  }
  // The stored durations are rounded to the second; the files know better.
  await Promise.all(
    tracks.map(async (track) => {
      const probed = await probeDuration(track.filePath);
      if (probed) track.durationSec = probed;
    }),
  );
  return tracks;
};

const spawnFfmpegPlayer: TurntableDeps['spawnPlayer'] = (tracks) => {
  const listDir = join(process.cwd(), 'data', 'turntable');
  mkdirSync(listDir, { recursive: true });
  const listPath = join(listDir, 'queue.txt');
  writeFileSync(listPath, concatList(tracks), 'utf8');

  const child = spawn(
    'ffmpeg',
    [
      '-hide_banner',
      '-loglevel',
      'error',
      '-nostats',
      '-re',
      '-f',
      'concat',
      '-safe',
      '0',
      '-i',
      listPath,
      '-vn',
      '-c:a',
      'aac',
      '-b:a',
      '192k',
      '-ar',
      '48000',
      '-f',
      'flv',
      '-progress',
      'pipe:1',
      `${env.rtmpPublishUrl}/${env.streamKey}`,
    ],
    { stdio: ['ignore', 'pipe', 'pipe'] },
  );

  const progressListeners: ((playedSec: number) => void)[] = [];
  const exitListeners: ((code: number | null) => void)[] = [];
  createInterface({ input: child.stdout }).on('line', (line) => {
    const played = parseProgressLine(line);
    if (played !== null)
      for (const listener of progressListeners) listener(played);
  });
  createInterface({ input: child.stderr }).on('line', (line) => {
    console.error('turntable ffmpeg:', line);
  });
  child.on('exit', (code) => {
    for (const listener of exitListeners) listener(code);
  });
  child.on('error', (error) => {
    console.error('turntable ffmpeg failed to start:', error);
    for (const listener of exitListeners) listener(null);
  });

  return {
    onProgress: (listener) => progressListeners.push(listener),
    onExit: (listener) => exitListeners.push(listener),
    stop: () => child.kill('SIGTERM'),
  };
};

const defaultDeps = (): TurntableDeps => ({
  loadQueue: loadQueueFromLibrary,
  spawnPlayer: spawnFfmpegPlayer,
  onTrack: (albumId, songId) =>
    onAirService.setOnAir(albumId, songId, 'turntable'),
  onFinished: () => onAirService.clearOnAir(),
  log: (line) => console.log('turntable:', line),
});

interface Session {
  albumId: number;
  queue: QueuedTrack[];
  position: number;
  startedAt: string;
  player: Player;
}

/**
 * Wave's own needle: plays an album, or an album from a chosen song, from
 * the library into the RTMP relay — the same path OBS takes — and keeps
 * the on-air state on the track that is sounding. Nothing is persisted;
 * a restart means silence.
 */
export class TurntableService {
  private deps: TurntableDeps;
  private session: Session | null = null;

  constructor(deps: Partial<TurntableDeps> = {}) {
    this.deps = { ...defaultDeps(), ...deps };
  }

  getState(): Omit<TurntableState, 'live'> {
    const session = this.session;
    if (!session) return { status: 'idle' };
    return {
      status: 'playing',
      albumId: session.albumId,
      songId: session.queue[session.position].songId,
      position: session.position,
      queue: session.queue.map(({ filePath: _path, ...track }) => track),
      startedAt: session.startedAt,
    };
  }

  /** Starts the album, or drops the needle on `songId`; replaces whatever played. */
  async play(
    albumId: number,
    songId?: number,
  ): Promise<Omit<TurntableState, 'live'>> {
    const queue = await this.deps.loadQueue(albumId, songId);
    this.stop();

    const player = this.deps.spawnPlayer(queue);
    const session: Session = {
      albumId,
      queue,
      position: 0,
      startedAt: new Date().toISOString(),
      player,
    };
    this.session = session;

    player.onProgress((playedSec) => {
      if (this.session !== session) return;
      const index = trackIndexAt(queue, playedSec);
      if (index === session.position) return;
      session.position = index;
      this.setTrack(albumId, queue[index].songId);
    });
    player.onExit((code) => {
      if (this.session !== session) return;
      this.session = null;
      this.deps.log(
        code === 0
          ? `played ${queue.length} track(s) of album ${albumId} to the end`
          : `ffmpeg exited with code ${code} on album ${albumId}`,
      );
      this.deps.onFinished();
    });

    await this.setTrack(albumId, queue[0].songId);
    this.deps.log(
      `playing album ${albumId} from song ${queue[0].songId}, ${queue.length} track(s)`,
    );
    return this.getState();
  }

  /** Lifts the needle; returns whether anything was playing. Leaves the on-air state alone. */
  stop(): boolean {
    const session = this.session;
    if (!session) return false;
    this.session = null;
    session.player.stop();
    this.deps.log(`stopped album ${session.albumId}`);
    return true;
  }

  private async setTrack(albumId: number, songId: number) {
    try {
      await this.deps.onTrack(albumId, songId);
    } catch (error) {
      console.error('turntable: failed to set the on-air track', error);
    }
  }
}

export const turntableService = new TurntableService();

// A mark the turntable set before a restart is a lie now: nothing plays.
if (onAirService.getOnAir()?.source === 'turntable') {
  onAirService.clearOnAir();
}
