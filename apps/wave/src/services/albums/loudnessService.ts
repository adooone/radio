import { join } from 'node:path';
import { type PlayableSong, findPlayableSongs, setSongGain } from '@/db/albums';
import { env } from '@/utils/env';
import { type Loudness, gainFor, measureLoudness } from '@/utils/loudness';

export interface LoudnessDeps {
  listSongs: () => Promise<PlayableSong[]>;
  measure: (filePath: string) => Promise<Loudness | null>;
  saveGain: (songId: number, gainDb: number) => Promise<void>;
  mediaRoot: string;
  log: (line: string) => void;
}

export interface LoudnessResult {
  measured: number;
  failed: number;
  skipped: number;
}

const defaultDeps = (): LoudnessDeps => ({
  listSongs: findPlayableSongs,
  measure: measureLoudness,
  saveGain: setSongGain,
  mediaRoot: env.mediaRootPath,
  log: (line) => console.log('loudness:', line),
});

/**
 * Measures every playable track that has no gain yet (or all of them with
 * `remeasure`), one at a time, and stores the gain that brings it to the
 * station's target. A track that cannot be measured keeps no gain and
 * plays at its own level.
 */
export async function measureMissingGains(
  options: { remeasure?: boolean } = {},
  deps: Partial<LoudnessDeps> = {},
): Promise<LoudnessResult> {
  const { listSongs, measure, saveGain, mediaRoot, log } = {
    ...defaultDeps(),
    ...deps,
  };
  const songs = await listSongs();
  const todo = songs.filter(
    (song) => options.remeasure || song.gainDb === null,
  );
  const result: LoudnessResult = {
    measured: 0,
    failed: 0,
    skipped: songs.length - todo.length,
  };
  for (const [index, song] of todo.entries()) {
    const filePath = join(
      mediaRoot,
      song.folderSlug as string,
      `${song.fileSlug}.m4a`,
    );
    const loudness = await measure(filePath);
    if (!loudness) {
      result.failed++;
      log(`could not measure ${song.folderSlug}/${song.fileSlug}`);
      continue;
    }
    const gain = gainFor(loudness);
    await saveGain(song.id, gain);
    result.measured++;
    log(
      `${index + 1}/${todo.length} ${song.folderSlug}/${song.fileSlug}: ${loudness.integrated} LUFS → ${gain > 0 ? '+' : ''}${gain} dB`,
    );
  }
  return result;
}
