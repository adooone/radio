import { execFile } from 'node:child_process';
import {
  existsSync,
  mkdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { join } from 'node:path';
import type {
  DigitizationCutKind,
  DigitizationPeaks,
  DigitizationSplitApplyResult,
  DigitizationSplitApplySide,
  DigitizationSplitPlan,
  DigitizationSplitPlanResult,
  DigitizationTrackPlan,
  TracklistItem,
} from '@radio/types';
import { readMetadata, resolveDraftFolder } from './inboxService';

const SAMPLE_RATE = 8000;
const PEAK_BUCKET_MS = 50;
const SILENCE_FRAME_MS = 20;
const RMS_WINDOW_SECONDS = 0.5;
const RMS_DIP_FLOOR_DB = -30;
const RMS_DIP_MARGIN_DB = 10;
const EDGE_SILENCE_MAX_SECONDS = 0.5;
const OUTER_PAD_SECONDS = 0.5;
const SHORT_TRACK_SECONDS = 30;

const DEFAULT_NOISE_DB = -40;
const DEFAULT_MIN_SILENCE_SECONDS = 1.0;
const DEFAULT_TOLERANCE_SECONDS = 25.0;

const SIDE_LETTER_PATTERN = /^[a-z]$/;
const AUDIO_FILENAME_PATTERN = /^[a-z0-9-]+\.wav$/;
const CACHE_DIR = '.cache';

interface DecodedAudio {
  samples: Int16Array;
  sampleRate: number;
  duration: number;
}

interface SilenceInterval {
  start: number;
  end: number;
}

function silenceLength(s: SilenceInterval): number {
  return s.end - s.start;
}

function silenceMid(s: SilenceInterval): number {
  return (s.start + s.end) / 2;
}

interface SideTrack {
  position: string;
  title: string;
  expected?: number;
}

export interface PlanSplitsOptions {
  noiseDb?: number;
  minSilence?: number;
  tolerance?: number;
  manualCuts?: Record<string, number[]>;
}

function sideWavName(letter: string): string {
  return `side-${letter}.wav`;
}

function runFfmpegPcm(path: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    execFile(
      'ffmpeg',
      [
        '-i',
        path,
        '-ac',
        '1',
        '-ar',
        String(SAMPLE_RATE),
        '-f',
        's16le',
        '-loglevel',
        'error',
        '-',
      ],
      { encoding: 'buffer', maxBuffer: 1024 * 1024 * 1024 },
      (error, stdout) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(stdout);
      },
    );
  });
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

async function decodeSideWav(path: string): Promise<DecodedAudio> {
  const pcm = await runFfmpegPcm(path);
  const samples = new Int16Array(
    pcm.buffer,
    pcm.byteOffset,
    Math.floor(pcm.length / 2),
  );
  return {
    samples,
    sampleRate: SAMPLE_RATE,
    duration: samples.length / SAMPLE_RATE,
  };
}

function rmsDb(
  samples: Int16Array,
  startIndex: number,
  endIndex: number,
): number {
  const count = endIndex - startIndex;
  if (count <= 0) {
    return -90;
  }
  let sumSquares = 0;
  for (let i = startIndex; i < endIndex; i++) {
    const normalized = samples[i] / 32768;
    sumSquares += normalized * normalized;
  }
  const rms = Math.sqrt(sumSquares / count);
  return rms > 0 ? 20 * Math.log10(rms) : -90;
}

function detectSilences(
  samples: Int16Array,
  sampleRate: number,
  noiseDb: number,
  minSilence: number,
): SilenceInterval[] {
  const frameSize = Math.max(
    1,
    Math.round((sampleRate * SILENCE_FRAME_MS) / 1000),
  );
  const totalFrames = Math.floor(samples.length / frameSize);
  const silences: SilenceInterval[] = [];
  let runStart: number | null = null;

  const closeRun = (endSample: number) => {
    if (runStart === null) {
      return;
    }
    const durationSeconds = (endSample - runStart) / sampleRate;
    if (durationSeconds >= minSilence) {
      silences.push({
        start: runStart / sampleRate,
        end: endSample / sampleRate,
      });
    }
    runStart = null;
  };

  for (let frame = 0; frame < totalFrames; frame++) {
    const start = frame * frameSize;
    const db = rmsDb(samples, start, start + frameSize);
    if (db <= noiseDb) {
      if (runStart === null) {
        runStart = start;
      }
    } else {
      closeRun(start);
    }
  }
  closeRun(totalFrames * frameSize);
  return silences;
}

function rmsProfile(
  samples: Int16Array,
  sampleRate: number,
  start: number,
  duration: number,
  window: number = RMS_WINDOW_SECONDS,
): Array<[number, number]> {
  const windowSamples = Math.round(window * sampleRate);
  const startSample = Math.max(0, Math.round(start * sampleRate));
  const endSample = Math.min(
    samples.length,
    Math.round((start + duration) * sampleRate),
  );
  const out: Array<[number, number]> = [];
  for (
    let s = startSample;
    s + windowSamples <= endSample;
    s += windowSamples
  ) {
    const db = rmsDb(samples, s, s + windowSamples);
    out.push([(s + windowSamples / 2) / sampleRate, db]);
  }
  return out;
}

function refineCut(
  samples: Int16Array,
  sampleRate: number,
  target: number,
  tolerance: number,
): number | null {
  const profile = rmsProfile(
    samples,
    sampleRate,
    target - tolerance,
    2 * tolerance,
  );
  if (profile.length === 0) {
    return null;
  }
  let minTime = profile[0][0];
  let minDb = profile[0][1];
  let maxDb = profile[0][1];
  for (const [time, db] of profile) {
    if (db < minDb) {
      minDb = db;
      minTime = time;
    }
    if (db > maxDb) {
      maxDb = db;
    }
  }
  if (minDb > RMS_DIP_FLOOR_DB || maxDb - minDb < RMS_DIP_MARGIN_DB) {
    return null;
  }
  return minTime;
}

function computePeaks(
  samples: Int16Array,
  sampleRate: number,
  bucketMs: number,
): DigitizationPeaks {
  const bucketSamples = Math.max(1, Math.round((sampleRate * bucketMs) / 1000));
  const bucketCount = Math.ceil(samples.length / bucketSamples) || 1;
  const min = new Array<number>(bucketCount);
  const max = new Array<number>(bucketCount);
  for (let bucket = 0; bucket < bucketCount; bucket++) {
    const start = bucket * bucketSamples;
    const end = Math.min(samples.length, start + bucketSamples);
    let bucketMin = 1;
    let bucketMax = -1;
    for (let i = start; i < end; i++) {
      const value = samples[i] / 32768;
      if (value < bucketMin) bucketMin = value;
      if (value > bucketMax) bucketMax = value;
    }
    min[bucket] = Math.round(bucketMin * 1000) / 1000;
    max[bucket] = Math.round(bucketMax * 1000) / 1000;
  }
  return { bucketMs, min, max };
}

function peaksCachePath(folderPath: string, wavFile: string): string {
  return join(folderPath, CACHE_DIR, `${wavFile}.peaks.json`);
}

function readCachedPeaks(
  folderPath: string,
  wavFile: string,
  sourceSize: number,
  sourceMtimeMs: number,
): DigitizationPeaks | undefined {
  const cachePath = peaksCachePath(folderPath, wavFile);
  if (!existsSync(cachePath)) {
    return undefined;
  }
  try {
    const cached = JSON.parse(readFileSync(cachePath, 'utf-8')) as {
      sourceSize: number;
      sourceMtimeMs: number;
      peaks: DigitizationPeaks;
    };
    if (
      cached.sourceSize === sourceSize &&
      cached.sourceMtimeMs === sourceMtimeMs
    ) {
      return cached.peaks;
    }
  } catch {
    return undefined;
  }
  return undefined;
}

function writeCachedPeaks(
  folderPath: string,
  wavFile: string,
  sourceSize: number,
  sourceMtimeMs: number,
  peaks: DigitizationPeaks,
): void {
  mkdirSync(join(folderPath, CACHE_DIR), { recursive: true });
  writeFileSync(
    peaksCachePath(folderPath, wavFile),
    JSON.stringify({ sourceSize, sourceMtimeMs, peaks }),
  );
}

function getOrComputePeaks(
  folderPath: string,
  wavFile: string,
  wavPath: string,
  audio: DecodedAudio,
): DigitizationPeaks {
  const stat = statSync(wavPath);
  const cached = readCachedPeaks(folderPath, wavFile, stat.size, stat.mtimeMs);
  if (cached) {
    return cached;
  }
  const peaks = computePeaks(audio.samples, audio.sampleRate, PEAK_BUCKET_MS);
  writeCachedPeaks(folderPath, wavFile, stat.size, stat.mtimeMs, peaks);
  return peaks;
}

function parseDuration(text: string): number | undefined {
  const parts = text.trim().split(':');
  if (parts.length === 0 || !parts.every((part) => /^\d+$/.test(part.trim()))) {
    return undefined;
  }
  let seconds = 0;
  for (const part of parts) {
    seconds = seconds * 60 + Number(part);
  }
  return seconds;
}

function stripCombiningMarks(text: string): string {
  return Array.from(text)
    .filter((char) => {
      const codePoint = char.codePointAt(0) ?? 0;
      return codePoint < 0x0300 || codePoint > 0x036f;
    })
    .join('');
}

function slugify(text: string): string {
  return stripCombiningMarks(text.normalize('NFKD'))
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function trackFilename(track: SideTrack): string {
  return `${track.position.toLowerCase()}-${slugify(track.title)}.wav`;
}

function groupTracksBySide(
  tracklist: TracklistItem[],
): Record<string, SideTrack[]> {
  const sides: Record<string, SideTrack[]> = {};
  for (const item of tracklist) {
    const position = (item.position ?? '').trim();
    const title = (item.title ?? '').trim();
    if (!position || !title) {
      continue;
    }
    const letter = /[a-z]/i.test(position[0]) ? position[0].toLowerCase() : 'a';
    const expected = item.duration ? parseDuration(item.duration) : undefined;
    const bucket = sides[letter] ?? [];
    bucket.push({ position, title, expected });
    sides[letter] = bucket;
  }
  return sides;
}

function planByDuration(
  audio: DecodedAudio,
  interior: SilenceInterval[],
  tracks: SideTrack[],
  audioStart: number,
  audioEnd: number,
  tolerance: number,
): { cuts: number[]; kinds: DigitizationCutKind[] } {
  const expectedTotal = tracks.reduce(
    (sum, track) => sum + (track.expected ?? 0),
    0,
  );
  const scale =
    expectedTotal > 0 ? (audioEnd - audioStart) / expectedTotal : 1.0;
  const candidates = [...interior].sort(
    (a, b) => silenceMid(a) - silenceMid(b),
  );
  const cuts: number[] = [];
  const kinds: DigitizationCutKind[] = [];
  let cumulative = 0;

  for (const track of tracks.slice(0, -1)) {
    cumulative += track.expected ?? 0;
    const target = audioStart + cumulative * scale;
    const near = candidates.filter(
      (s) => Math.abs(silenceMid(s) - target) <= tolerance,
    );
    if (near.length > 0) {
      const best = near.reduce((a, b) =>
        silenceLength(b) > silenceLength(a) ? b : a,
      );
      cuts.push(silenceMid(best));
      kinds.push('gap');
      continue;
    }
    const refined = refineCut(
      audio.samples,
      audio.sampleRate,
      target,
      tolerance,
    );
    if (refined !== null) {
      cuts.push(refined);
      kinds.push('refined');
    } else {
      cuts.push(target);
      kinds.push('expected');
    }
  }

  return { cuts, kinds };
}

async function planSide(
  folderPath: string,
  wavFile: string,
  wavPath: string,
  tracks: SideTrack[],
  params: {
    noiseDb: number;
    minSilence: number;
    tolerance: number;
    manualCuts?: number[];
  },
): Promise<DigitizationSplitPlan> {
  const audio = await decodeSideWav(wavPath);
  const peaks = getOrComputePeaks(folderPath, wavFile, wavPath, audio);

  const silences = params.manualCuts
    ? []
    : detectSilences(
        audio.samples,
        audio.sampleRate,
        params.noiseDb,
        params.minSilence,
      );

  let audioStart = 0;
  let audioEnd = audio.duration;
  const interior: SilenceInterval[] = [];
  for (const s of silences) {
    if (s.start <= EDGE_SILENCE_MAX_SECONDS) {
      audioStart = Math.max(audioStart, s.end);
    } else if (s.end >= audio.duration - EDGE_SILENCE_MAX_SECONDS) {
      audioEnd = Math.min(audioEnd, s.start);
    } else {
      interior.push(s);
    }
  }

  let cuts: number[];
  let kinds: DigitizationCutKind[];

  if (params.manualCuts) {
    if (params.manualCuts.length !== tracks.length - 1) {
      throw new Error(
        `${wavFile}: ${tracks.length} track(s) need exactly ${tracks.length - 1} cut(s), got ${params.manualCuts.length}`,
      );
    }
    if (params.manualCuts.some((cut) => cut <= 0 || cut >= audio.duration)) {
      throw new Error(
        `${wavFile}: manual cut points must lie within the recording (0–${audio.duration.toFixed(1)}s)`,
      );
    }
    cuts = [...params.manualCuts].sort((a, b) => a - b);
    kinds = cuts.map(() => 'manual' as const);
  } else {
    const needed = tracks.length - 1;
    if (needed === 0) {
      cuts = [];
      kinds = [];
    } else if (tracks.every((track) => track.expected !== undefined)) {
      const result = planByDuration(
        audio,
        interior,
        tracks,
        audioStart,
        audioEnd,
        params.tolerance,
      );
      cuts = result.cuts;
      kinds = result.kinds;
    } else {
      if (interior.length < needed) {
        throw new Error(
          `${wavFile}: found only ${interior.length} gap(s), need ${needed}. Try a higher noise threshold (e.g. -35) or shorter minSilence, or add durations to data.json.`,
        );
      }
      const chosen = [...interior]
        .sort((a, b) => silenceLength(b) - silenceLength(a))
        .slice(0, needed);
      cuts = chosen.map(silenceMid).sort((a, b) => a - b);
      kinds = cuts.map(() => 'gap' as const);
    }
  }

  const sorted = [...cuts].sort((a, b) => a - b);
  if (cuts.some((cut, i) => cut !== sorted[i])) {
    throw new Error(
      `${wavFile}: computed cut points are out of order — track durations in data.json are probably very wrong. Fix them or cut manually.`,
    );
  }

  const bounds = [
    Math.max(0, audioStart - OUTER_PAD_SECONDS),
    ...cuts,
    Math.min(audio.duration, audioEnd + OUTER_PAD_SECONDS),
  ];

  const warnings: string[] = [];
  const trackPlans: DigitizationTrackPlan[] = tracks.map((track, i) => {
    const start = bounds[i];
    const end = bounds[i + 1];
    const kind: DigitizationCutKind = i === 0 ? 'gap' : (kinds[i - 1] ?? 'gap');
    const fileSlug = trackFilename(track);
    const trackWarnings: string[] = [];
    if (end - start < SHORT_TRACK_SECONDS) {
      trackWarnings.push('suspiciously short');
    }
    if (kind === 'expected') {
      trackWarnings.push('no gap or quiet point found, cut at expected time');
    } else if (kind === 'refined') {
      trackWarnings.push('no clean gap, cut at quietest point nearby');
    }
    for (const warning of trackWarnings) {
      warnings.push(`${fileSlug}: ${warning}`);
    }
    return {
      index: i,
      fileSlug,
      position: track.position,
      title: track.title,
      start,
      end,
      expectedDuration: track.expected,
      warnings: trackWarnings,
    };
  });

  return {
    side: wavFile,
    duration: audio.duration,
    cuts: cuts.map((time, i) => ({ time, kind: kinds[i] })),
    tracks: trackPlans,
    warnings,
    peaks,
  };
}

export async function planSplits(
  inboxPath: string,
  slug: string,
  options: PlanSplitsOptions = {},
): Promise<DigitizationSplitPlanResult> {
  const folderPath = resolveDraftFolder(inboxPath, slug);
  const metadata = readMetadata(folderPath);
  const tracksBySide = groupTracksBySide(metadata?.tracklist ?? []);
  if (Object.keys(tracksBySide).length === 0) {
    throw new Error('data.json has no usable tracklist');
  }

  const noiseDb = options.noiseDb ?? DEFAULT_NOISE_DB;
  const minSilence = options.minSilence ?? DEFAULT_MIN_SILENCE_SECONDS;
  const tolerance = options.tolerance ?? DEFAULT_TOLERANCE_SECONDS;

  const missingSides: string[] = [];
  const sides: DigitizationSplitPlan[] = [];

  for (const letter of Object.keys(tracksBySide).sort()) {
    const wavFile = sideWavName(letter);
    const wavPath = join(folderPath, wavFile);
    if (!existsSync(wavPath) || statSync(wavPath).size === 0) {
      missingSides.push(wavFile);
      continue;
    }
    const plan = await planSide(
      folderPath,
      wavFile,
      wavPath,
      tracksBySide[letter],
      {
        noiseDb,
        minSilence,
        tolerance,
        manualCuts: options.manualCuts?.[letter],
      },
    );
    sides.push(plan);
  }

  if (sides.length === 0) {
    throw new Error(
      `No side recordings found (expected: ${missingSides.join(', ')}).`,
    );
  }

  return { missingSides, sides };
}

export async function applySplits(
  inboxPath: string,
  slug: string,
  sides: DigitizationSplitApplySide[],
): Promise<DigitizationSplitApplyResult> {
  const folderPath = resolveDraftFolder(inboxPath, slug);

  const jobs: Array<{
    wavPath: string;
    targetPath: string;
    fileSlug: string;
    start: number;
    end: number;
  }> = [];
  for (const sidePlan of sides) {
    if (!SIDE_LETTER_PATTERN.test(sidePlan.side)) {
      throw new Error(`Invalid side: ${sidePlan.side}`);
    }
    const wavFile = sideWavName(sidePlan.side);
    const wavPath = join(folderPath, wavFile);
    if (!existsSync(wavPath) || statSync(wavPath).size === 0) {
      throw new Error(`Missing recording: ${wavFile}`);
    }
    for (const track of sidePlan.tracks) {
      if (!AUDIO_FILENAME_PATTERN.test(track.fileSlug)) {
        throw new Error(`Invalid filename: ${track.fileSlug}`);
      }
      if (track.start < 0 || track.end <= track.start) {
        throw new Error(`Invalid cut range for ${track.fileSlug}`);
      }
      const targetPath = join(folderPath, track.fileSlug);
      if (existsSync(targetPath) && statSync(targetPath).size > 0) {
        throw new Error(`${track.fileSlug} already exists and is not empty`);
      }
      jobs.push({
        wavPath,
        targetPath,
        fileSlug: track.fileSlug,
        start: track.start,
        end: track.end,
      });
    }
  }

  const written: string[] = [];
  for (const job of jobs) {
    await runFfmpeg([
      '-i',
      job.wavPath,
      '-ss',
      job.start.toFixed(3),
      '-to',
      job.end.toFixed(3),
      '-c',
      'copy',
      '-loglevel',
      'error',
      '-y',
      job.targetPath,
    ]);
    written.push(job.fileSlug);
  }
  return { written };
}

export function resolveDraftAudioPath(
  inboxPath: string,
  slug: string,
  file: string,
): string {
  const folderPath = resolveDraftFolder(inboxPath, slug);
  if (!AUDIO_FILENAME_PATTERN.test(file)) {
    throw new Error('Not found');
  }
  const filePath = join(folderPath, file);
  if (!existsSync(filePath) || !statSync(filePath).isFile()) {
    throw new Error('Not found');
  }
  return filePath;
}
