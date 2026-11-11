import { execFile, spawn } from 'node:child_process';
import { join } from 'node:path';
import { createInterface } from 'node:readline';
import { findAlbumById, findSongsByAlbum } from '@/db/albums';
import { env } from '@/utils/env';
import type {
  TurntableMode,
  TurntableState,
  TurntableTrack,
} from '@radio/types';
import { type OnAirService, onAirService } from './onAirService';

export interface QueuedTrack extends TurntableTrack {
  albumId: number;
  filePath: string;
  /** dB to the station's loudness target; null plays the file as it is. */
  gainDb?: number | null;
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
  /** Plays the tracks back to back, overlapping each join by `overlaps[i]` seconds. */
  spawnPlayer: (tracks: QueuedTrack[], overlaps: number[]) => Player;
  /** Called as each track starts, with the on-air state to set. */
  onTrack: (track: QueuedTrack, next?: QueuedTrack) => Promise<unknown>;
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

/**
 * The crossfade at each join, in seconds: `crossfadeSec`, but never more
 * than half of either track it joins. Zero joins play gaplessly.
 */
export function joinOverlaps(
  tracks: Pick<QueuedTrack, 'durationSec'>[],
  crossfadeSec: number,
): number[] {
  const overlaps: number[] = [];
  for (let i = 0; i < tracks.length - 1; i++) {
    overlaps.push(
      Math.max(
        0,
        Math.min(
          crossfadeSec,
          tracks[i].durationSec / 2,
          tracks[i + 1].durationSec / 2,
        ),
      ),
    );
  }
  return overlaps;
}

/**
 * Which track is playing `playedSec` into the queue. With crossfades the
 * next track takes over halfway through the overlap.
 */
export function trackIndexAt(
  tracks: Pick<QueuedTrack, 'durationSec'>[],
  playedSec: number,
  overlaps: number[] = [],
): number {
  let start = 0;
  for (let i = 0; i < tracks.length - 1; i++) {
    const overlap = overlaps[i] ?? 0;
    start += tracks[i].durationSec - overlap;
    if (playedSec < start + overlap / 2) return i;
  }
  return Math.max(0, tracks.length - 1);
}

/**
 * ffmpeg's filter graph for the queue: every input brought to one format
 * and its own gain, then joined (`acrossfade` per overlapping join,
 * otherwise `concat`), then held to real time with `arealtime` — `-re`
 * would only pace the first input of many.
 */
export function filterGraph(tracks: QueuedTrack[], overlaps: number[]): string {
  const parts = tracks.map(
    (track, i) =>
      `[${i}:a]aresample=48000,aformat=sample_fmts=fltp:channel_layouts=stereo,volume=${track.gainDb ?? 0}dB[a${i}]`,
  );
  let last = '[a0]';
  let run: string[] = ['[a0]'];
  const flushConcat = (label: string) => {
    if (run.length > 1) {
      parts.push(`${run.join('')}concat=n=${run.length}:v=0:a=1${label}`);
      return label;
    }
    return run[0];
  };
  for (let i = 1; i < tracks.length; i++) {
    const overlap = overlaps[i - 1] ?? 0;
    if (overlap > 0) {
      const joined = flushConcat(`[c${i}]`);
      parts.push(
        `${joined}[a${i}]acrossfade=d=${overlap.toFixed(3)}:c1=tri:c2=tri[x${i}]`,
      );
      last = `[x${i}]`;
      run = [last];
    } else {
      run.push(`[a${i}]`);
    }
  }
  last = flushConcat('[joined]');
  parts.push(`${last}arealtime[out]`);
  return parts.join(';');
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
      albumId,
      songId: song.id,
      title: song.title,
      artist: album.artist,
      trackNumber: song.trackNumber,
      durationSec: parseDuration(song.duration),
      gainDb: song.gainDb,
      filePath: join(
        env.mediaRootPath,
        album.folderSlug as string,
        `${song.fileSlug}.m4a`,
      ),
    }));
  if (tracks.length === 0) {
    throw new Error(`Nothing to play: album ${albumId} has no track files`);
  }
  await probeDurations(tracks);
  return tracks;
};

/**
 * The stored durations are rounded to the second; the files know better.
 * A few ffprobes at a time, so a two-hour batch does not start 30 at once
 * on a two-core box.
 */
export async function probeDurations(
  tracks: QueuedTrack[],
  concurrency = 4,
): Promise<void> {
  let next = 0;
  const worker = async () => {
    while (next < tracks.length) {
      const track = tracks[next++];
      const probed = await probeDuration(track.filePath);
      if (probed) track.durationSec = probed;
    }
  };
  await Promise.all(
    Array.from({ length: Math.min(concurrency, tracks.length) }, worker),
  );
}

const spawnFfmpegPlayer: TurntableDeps['spawnPlayer'] = (tracks, overlaps) => {
  const child = spawn(
    'ffmpeg',
    [
      '-hide_banner',
      '-loglevel',
      'error',
      '-nostats',
      ...tracks.flatMap((track) => ['-i', track.filePath]),
      '-filter_complex',
      filterGraph(tracks, overlaps),
      '-map',
      '[out]',
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
  onTrack: (track, next) =>
    onAirService.setOnAir(
      track.albumId,
      track.songId,
      'turntable',
      next && { albumId: next.albumId, songId: next.songId },
    ),
  onFinished: () => onAirService.clearOnAir(),
  log: (line) => console.log('turntable:', line),
});

/** What a playing session reports back to whoever started it. */
export interface PlayOptions {
  /** Seconds of crossfade at each join; 0 (the default) plays gaplessly. */
  crossfadeSec?: number;
  /** `album`: a record put on by hand; `rotation`: the station's own pick. */
  mode?: TurntableMode;
  /** Each track as it takes over the air, the first one included. */
  onTrackStart?: (track: QueuedTrack, index: number) => void;
  /**
   * Called when the queue has played out (`true`) or ffmpeg died
   * (`false`); not on a stop or a replacement. Without it the on-air
   * mark is cleared.
   */
  onEnd?: (completed: boolean) => void;
}

interface Session {
  queue: QueuedTrack[];
  overlaps: number[];
  position: number;
  startedAt: string;
  player: Player;
  mode: TurntableMode;
}

/**
 * Wave's own needle: plays a queue of library tracks into the RTMP relay —
 * the same path OBS takes — and keeps the on-air state on the track that
 * is sounding. A record put on by hand plays its tracks gaplessly; the
 * station's rotation hands it shuffled batches to crossfade. Nothing is
 * persisted here; the rotation keeps its own state.
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
    const current = session.queue[session.position];
    return {
      status: 'playing',
      mode: session.mode,
      albumId: current.albumId,
      songId: current.songId,
      position: session.position,
      queue: session.queue.map(
        ({ filePath: _path, gainDb: _gain, ...track }) => track,
      ),
      startedAt: session.startedAt,
    };
  }

  /** Starts the album, or drops the needle on `songId`; replaces whatever played. */
  async play(
    albumId: number,
    songId?: number,
    options: Omit<PlayOptions, 'mode' | 'crossfadeSec'> = {},
  ): Promise<Omit<TurntableState, 'live'>> {
    const queue = await this.deps.loadQueue(albumId, songId);
    return this.playTracks(queue, { ...options, mode: 'album' });
  }

  /** Plays `queue` from its first track; replaces whatever played. */
  async playTracks(
    queue: QueuedTrack[],
    options: PlayOptions = {},
  ): Promise<Omit<TurntableState, 'live'>> {
    if (queue.length === 0) throw new Error('Nothing to play: empty queue');
    this.stop();

    const overlaps = joinOverlaps(queue, options.crossfadeSec ?? 0);
    const player = this.deps.spawnPlayer(queue, overlaps);
    const session: Session = {
      queue,
      overlaps,
      position: 0,
      startedAt: new Date().toISOString(),
      player,
      mode: options.mode ?? 'album',
    };
    this.session = session;

    player.onProgress((playedSec) => {
      if (this.session !== session) return;
      const index = trackIndexAt(queue, playedSec, overlaps);
      if (index === session.position) return;
      session.position = index;
      this.trackStarted(queue, index, options);
    });
    player.onExit((code) => {
      if (this.session !== session) return;
      this.session = null;
      this.deps.log(
        code === 0
          ? `played ${queue.length} track(s) to the end`
          : `ffmpeg exited with code ${code}`,
      );
      if (options.onEnd) options.onEnd(code === 0);
      else this.deps.onFinished();
    });

    await this.trackStarted(queue, 0, options);
    this.deps.log(
      `playing ${queue.length} track(s) (${session.mode}) from song ${queue[0].songId}`,
    );
    return this.getState();
  }

  /** Lifts the needle; returns whether anything was playing. Leaves the on-air state alone. */
  stop(): boolean {
    const session = this.session;
    if (!session) return false;
    this.session = null;
    session.player.stop();
    this.deps.log(`stopped (${session.mode})`);
    return true;
  }

  private async trackStarted(
    queue: QueuedTrack[],
    index: number,
    options: PlayOptions,
  ) {
    const track = queue[index];
    try {
      options.onTrackStart?.(track, index);
    } catch (error) {
      console.error('turntable: track start handler failed', error);
    }
    try {
      await this.deps.onTrack(track, queue[index + 1]);
    } catch (error) {
      console.error('turntable: failed to set the on-air track', error);
    }
  }
}

export const turntableService = new TurntableService();

/**
 * Wave's boot step for the turntable; call it once from the entry point.
 * Kept out of module scope so importing this file (tests do) never
 * touches the on-air file or the process's signals.
 */
export function startTurntable({
  onAir = onAirService,
  turntable = turntableService,
}: {
  onAir?: Pick<OnAirService, 'getOnAir' | 'clearOnAir'>;
  turntable?: Pick<TurntableService, 'stop'>;
} = {}): void {
  // A mark the turntable set before a restart is a lie now: nothing plays.
  if (onAir.getOnAir()?.source === 'turntable') {
    onAir.clearOnAir();
  }

  // pm2 stops wave with a signal; the needle must not keep publishing alone.
  // Once stopped, the signal is re-raised so the default exit still happens.
  for (const signal of ['SIGINT', 'SIGTERM'] as const) {
    process.once(signal, () => {
      turntable.stop();
      process.kill(process.pid, signal);
    });
  }
}
