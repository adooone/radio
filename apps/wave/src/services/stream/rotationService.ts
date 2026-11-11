import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { type PlayableSong, findPlayableSongs } from '@/db/albums';
import { env } from '@/utils/env';
import type { RotationState } from '@radio/types';
import { airStatus } from './airStatus';
import { onAirService } from './onAirService';
import {
  type PlayOptions,
  type QueuedTrack,
  type TurntableService,
  parseDuration,
  probeDurations,
  turntableService,
} from './turntableService';

/** About two hours of music per ffmpeg run: few restarts, small graphs. */
export const BATCH_TARGET_SEC = 2 * 60 * 60;
export const BATCH_MAX_TRACKS = 40;
export const CROSSFADE_SEC = 4;
/** How often the rotation checks that something plays while it is on. */
export const WATCHDOG_MS = 30_000;
/** How many of the coming tracks the admin sees. */
export const UPCOMING_COUNT = 8;

/** What survives a restart: on / off, this pass's played tracks, the asks. */
export interface SavedRotation {
  enabled: boolean;
  played: number[];
  upNext: number[];
}

const EMPTY: SavedRotation = { enabled: false, played: [], upNext: [] };

/**
 * The next batch from the shuffle bag. "Play next" songs lead, in order;
 * then tracks not yet played in this pass, picked at random so that no two
 * neighbours share an album or an artist (relaxed only when nothing else
 * is left). When the bag is empty a new pass begins.
 */
export function pickBatch(
  songs: PlayableSong[],
  played: ReadonlySet<number>,
  upNext: number[],
  random: () => number,
  targetSec = BATCH_TARGET_SEC,
  maxTracks = BATCH_MAX_TRACKS,
): { batch: PlayableSong[]; newPass: boolean } {
  const byId = new Map(songs.map((song) => [song.id, song]));
  let remaining = songs.filter((song) => !played.has(song.id));
  const newPass = remaining.length === 0;
  if (newPass) remaining = [...songs];

  const batch: PlayableSong[] = [];
  const taken = new Set<number>();
  let total = 0;
  const take = (song: PlayableSong) => {
    batch.push(song);
    taken.add(song.id);
    total += parseDuration(song.duration);
  };

  for (const id of upNext) {
    const song = byId.get(id);
    if (song && !taken.has(id)) take(song);
  }

  while (total < targetSec && batch.length < maxTracks) {
    const pool = remaining.filter((song) => !taken.has(song.id));
    if (pool.length === 0) break;
    const prev = batch.at(-1);
    const apart = prev
      ? pool.filter(
          (song) =>
            song.albumId !== prev.albumId && song.artist !== prev.artist,
        )
      : pool;
    const otherAlbum = prev
      ? pool.filter((song) => song.albumId !== prev.albumId)
      : pool;
    const choices =
      apart.length > 0 ? apart : otherAlbum.length > 0 ? otherAlbum : pool;
    take(choices[Math.floor(random() * choices.length)]);
  }
  return { batch, newPass };
}

export interface RotationDeps {
  listSongs: () => Promise<PlayableSong[]>;
  turntable: Pick<
    TurntableService,
    'playTracks' | 'play' | 'stop' | 'getState'
  >;
  /** Someone other than the turntable (OBS) holds the stream. */
  isLiveElsewhere: () => Promise<boolean>;
  probe: (tracks: QueuedTrack[]) => Promise<void>;
  clearOnAir: () => void;
  load: () => SavedRotation;
  save: (state: SavedRotation) => void;
  random: () => number;
  mediaRoot: string;
  log: (line: string) => void;
}

const statePath = () => join(process.cwd(), 'data', 'rotation.json');

const defaultDeps = (): RotationDeps => ({
  listSongs: findPlayableSongs,
  turntable: turntableService,
  isLiveElsewhere: async () =>
    turntableService.getState().status !== 'playing' &&
    (await airStatus.isLive()),
  probe: probeDurations,
  clearOnAir: () => onAirService.clearOnAir(),
  load: () => {
    try {
      const path = statePath();
      if (!existsSync(path)) return { ...EMPTY };
      return { ...EMPTY, ...JSON.parse(readFileSync(path, 'utf8')) };
    } catch (error) {
      console.error('rotation: unreadable state, starting fresh', error);
      return { ...EMPTY };
    }
  },
  save: (state) => {
    const path = statePath();
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, JSON.stringify(state, null, 2), 'utf8');
  },
  random: Math.random,
  mediaRoot: env.mediaRootPath,
  log: (line) => console.log('rotation:', line),
});

/**
 * The station: while on, it keeps the turntable playing shuffled batches
 * of the whole library with crossfades, every track once per pass. A
 * record put on by hand interrupts it; when that record ends the rotation
 * carries on. Going live from OBS means switching the rotation off first —
 * nginx takes one publisher per stream key.
 */
export class RotationService {
  private deps: RotationDeps;
  private state: SavedRotation;
  private libraryTracks = 0;
  private busy = false;
  /** A "play next" waits for the current track to finish. */
  private restartAtNextTrack = false;
  private timer: ReturnType<typeof setInterval> | null = null;

  constructor(deps: Partial<RotationDeps> = {}) {
    this.deps = { ...defaultDeps(), ...deps };
    this.state = this.deps.load();
  }

  async getState(): Promise<RotationState> {
    const turntable = this.deps.turntable.getState();
    const playing = turntable.status === 'playing';
    if (this.libraryTracks === 0) {
      this.libraryTracks = (await this.deps.listSongs()).length;
    }
    const upcoming =
      playing && turntable.mode === 'rotation' && turntable.queue
        ? turntable.queue.slice(
            (turntable.position ?? 0) + 1,
            (turntable.position ?? 0) + 1 + UPCOMING_COUNT,
          )
        : [];
    return {
      enabled: this.state.enabled,
      mode: playing ? (turntable.mode ?? 'album') : 'idle',
      upcoming,
      upNext: [...this.state.upNext],
      playedInPass: this.state.played.length,
      libraryTracks: this.libraryTracks,
    };
  }

  /** Boot: watch that the station plays while it is on, and start now. */
  start(): void {
    if (this.timer) return;
    this.timer = setInterval(() => void this.tick(), WATCHDOG_MS);
    void this.tick();
  }

  /** For tests and shutdown. */
  shutdown(): void {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
  }

  async enable(): Promise<RotationState> {
    this.state.enabled = true;
    this.persist();
    await this.tick();
    return this.getState();
  }

  /** Off: the rotation's sound stops and the air clears; a hand-put record plays on. */
  async disable(): Promise<RotationState> {
    this.state.enabled = false;
    this.restartAtNextTrack = false;
    this.persist();
    if (this.deps.turntable.getState().mode === 'rotation') {
      this.deps.turntable.stop();
      this.deps.clearOnAir();
    }
    return this.getState();
  }

  /** Moves on now: a fresh batch, the current track counted as played. */
  async skip(): Promise<RotationState> {
    if (!this.state.enabled) throw new Error('The rotation is off');
    this.restartAtNextTrack = false;
    await this.playNextBatch();
    return this.getState();
  }

  /** Plays `songId` after the current track (or now, when nothing plays). */
  async playNext(songId: number): Promise<RotationState> {
    const songs = await this.deps.listSongs();
    if (!songs.some((song) => song.id === songId)) {
      throw new Error(`Song ${songId} is not playable`);
    }
    this.state.upNext = [
      ...this.state.upNext.filter((id) => id !== songId),
      songId,
    ];
    this.persist();
    if (this.deps.turntable.getState().mode === 'rotation') {
      this.restartAtNextTrack = true;
    } else {
      await this.tick();
    }
    return this.getState();
  }

  /** A record put on by hand: interrupts the rotation, which resumes after it. */
  async playAlbum(albumId: number, songId?: number) {
    this.restartAtNextTrack = false;
    return this.deps.turntable.play(albumId, songId, {
      onEnd: () => {
        if (this.state.enabled) void this.tick();
        else this.deps.clearOnAir();
      },
    });
  }

  /** Plays the next batch if the rotation is on, nothing plays and OBS is not live. */
  async tick(): Promise<void> {
    if (!this.state.enabled || this.busy) return;
    if (this.deps.turntable.getState().status === 'playing') return;
    if (await this.deps.isLiveElsewhere()) return;
    await this.playNextBatch();
  }

  private async playNextBatch(): Promise<void> {
    if (this.busy) return;
    this.busy = true;
    try {
      const songs = await this.deps.listSongs();
      this.libraryTracks = songs.length;
      const { batch, newPass } = pickBatch(
        songs,
        new Set(this.state.played),
        this.state.upNext,
        this.deps.random,
      );
      if (batch.length === 0) {
        this.deps.log('nothing to play: the library has no playable tracks');
        return;
      }
      if (newPass) {
        this.state.played = [];
        this.deps.log(`a new pass through ${songs.length} track(s)`);
      }
      const queue: QueuedTrack[] = batch.map((song) => ({
        albumId: song.albumId,
        songId: song.id,
        title: song.title,
        artist: song.artist,
        trackNumber: song.trackNumber,
        durationSec: parseDuration(song.duration),
        gainDb: song.gainDb,
        filePath: join(
          this.deps.mediaRoot,
          song.folderSlug as string,
          `${song.fileSlug}.m4a`,
        ),
      }));
      await this.deps.probe(queue);
      const options: PlayOptions = {
        mode: 'rotation',
        crossfadeSec: CROSSFADE_SEC,
        onTrackStart: (track, index) => this.trackStarted(track, index),
        onEnd: (completed) => {
          if (completed) void this.tick();
          // ffmpeg died: the watchdog tries again on its next round.
          else this.deps.log('the batch broke off; retrying shortly');
        },
      };
      await this.deps.turntable.playTracks(queue, options);
      this.deps.log(`playing a batch of ${queue.length} track(s)`);
    } finally {
      this.busy = false;
    }
  }

  private trackStarted(track: QueuedTrack, index: number) {
    if (index > 0 && this.restartAtNextTrack) {
      // The asked-for song plays now, in place of this one.
      this.restartAtNextTrack = false;
      void this.playNextBatch();
      return;
    }
    if (!this.state.played.includes(track.songId)) {
      this.state.played.push(track.songId);
    }
    this.state.upNext = this.state.upNext.filter((id) => id !== track.songId);
    this.persist();
  }

  private persist() {
    try {
      this.deps.save(this.state);
    } catch (error) {
      console.error('rotation: could not save its state', error);
    }
  }
}

export const rotationService = new RotationService();

/** Wave's boot step for the station; call it once from the entry point. */
export function startRotation(rotation: RotationService = rotationService) {
  rotation.start();
}
