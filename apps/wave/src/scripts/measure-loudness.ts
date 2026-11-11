/**
 * Measures the library's loudness for the station (IDEA-21): every playable
 * track without a gain, or all of them with --all. Runs ffmpeg one track at
 * a time at low priority; safe to stop and run again.
 */
import { measureMissingGains } from '@/services/albums/loudnessService';

const remeasure = process.argv.includes('--all');
const result = await measureMissingGains({ remeasure });
console.log(
  `measured ${result.measured}, failed ${result.failed}, already had a gain ${result.skipped}`,
);
process.exit(result.failed > 0 ? 1 : 0);
