import { spawn } from 'node:child_process';

/** The station's loudness target, EBU R128 integrated (streaming-ish). */
export const TARGET_LUFS = -16;
/** Never push a track's true peak above this after its gain. */
export const PEAK_CEILING_DBTP = -1;
/** How far a single track may be turned up or down. */
export const MAX_GAIN_DB = 12;

export interface Loudness {
  /** Integrated loudness, LUFS. */
  integrated: number;
  /** True peak, dBTP (ffmpeg prints it as dBFS). */
  truePeak: number | null;
}

/** Reads the integrated loudness and true peak from ffmpeg's `ebur128` summary. */
export function parseEbur128Summary(stderr: string): Loudness | null {
  const summary = stderr.slice(stderr.lastIndexOf('Summary:'));
  const integrated = /I:\s+(-?\d+(?:\.\d+)?|-inf)\s+LUFS/.exec(summary);
  if (!integrated || integrated[1] === '-inf') return null;
  const peak = /Peak:\s+(-?\d+(?:\.\d+)?|-inf)\s+dBFS/.exec(summary);
  return {
    integrated: Number(integrated[1]),
    truePeak: peak && peak[1] !== '-inf' ? Number(peak[1]) : null,
  };
}

/**
 * The fixed gain that brings a track to the target: louder tracks come
 * down, quiet ones go up only as far as their peaks allow, both within
 * ±MAX_GAIN_DB. Rounded to a tenth of a dB.
 */
export function gainFor({ integrated, truePeak }: Loudness): number {
  let gain = TARGET_LUFS - integrated;
  if (truePeak !== null) gain = Math.min(gain, PEAK_CEILING_DBTP - truePeak);
  gain = Math.max(-MAX_GAIN_DB, Math.min(MAX_GAIN_DB, gain));
  return Math.round(gain * 10) / 10;
}

/** Decodes the whole file through ffmpeg's `ebur128` filter, at low priority. */
export function measureLoudness(filePath: string): Promise<Loudness | null> {
  return new Promise((resolve) => {
    const child = spawn(
      'nice',
      [
        '-n',
        '19',
        'ffmpeg',
        '-hide_banner',
        '-nostats',
        '-i',
        filePath,
        '-vn',
        '-filter_complex',
        'ebur128=peak=true',
        '-f',
        'null',
        '-',
      ],
      { stdio: ['ignore', 'ignore', 'pipe'] },
    );
    let stderr = '';
    child.stderr.on('data', (chunk) => {
      stderr += chunk;
      // Only the summary at the end matters; keep the buffer small.
      if (stderr.length > 64_000) stderr = stderr.slice(-32_000);
    });
    child.on('error', () => resolve(null));
    child.on('exit', (code) =>
      resolve(code === 0 ? parseEbur128Summary(stderr) : null),
    );
  });
}
