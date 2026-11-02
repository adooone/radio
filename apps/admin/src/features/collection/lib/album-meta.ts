import { calculateAlbumCompleteness } from '@/features/collection/utils/album-helpers';
import type { Album, Song } from '@radio/types';

/** Ukrainian plural: one, few (2–4), many. */
export const plural = (
  n: number,
  [one, few, many]: [string, string, string],
): string => {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return `${n} ${one}`;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) {
    return `${n} ${few}`;
  }
  return `${n} ${many}`;
};

export const albumsCount = (n: number) =>
  plural(n, ['альбом', 'альбоми', 'альбомів']);
export const tracksCount = (n: number) =>
  plural(n, ['трек', 'треки', 'треків']);

/** "3:42" or "1:03:42" in seconds; 0 when it can't be read. */
export const parseDuration = (duration: string | null | undefined): number => {
  if (!duration) return 0;
  const parts = duration.split(':').map((p) => Number.parseInt(p, 10));
  if (parts.some(Number.isNaN)) return 0;
  return parts.reduce((total, part) => total * 60 + part, 0);
};

/** Seconds as "42 хв" or "1 год 12 хв". */
export const formatMinutes = (seconds: number): string => {
  const minutes = Math.round(seconds / 60);
  const hours = Math.floor(minutes / 60);
  if (hours > 0) return `${hours} год ${minutes % 60} хв`;
  return `${minutes} хв`;
};

export const totalDuration = (songs: Song[] | undefined) =>
  (songs ?? []).reduce((sum, song) => sum + parseDuration(song.duration), 0);

/** "Квітка Цісик · 1980 · 12 треків · 42 хв" */
export const albumMetaLine = (album: Album, songs?: Song[]): string => {
  const parts = [album.artist];
  const year = album.releaseYear ?? album.year;
  if (year) parts.push(String(year));
  const count = songs?.length ?? album.songCount ?? 0;
  parts.push(tracksCount(count));
  const seconds = totalDuration(songs);
  if (seconds > 0) parts.push(formatMinutes(seconds));
  return parts.join(' · ');
};

/** "оцифровано 2026-10-12 · метадані повні" */
export const albumStateLine = (album: Album): string => {
  const parts: string[] = [];
  if (album.digitizationDate) {
    parts.push(`оцифровано ${album.digitizationDate.substring(0, 10)}`);
  }
  const completeness = calculateAlbumCompleteness(album);
  parts.push(
    completeness >= 100
      ? 'метадані повні'
      : `метадані на ${Math.round(completeness)} %`,
  );
  return parts.join(' · ');
};

export const albumTags = (album: Album): string[] => {
  if (!album.tags) return [];
  try {
    const parsed = JSON.parse(album.tags);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};
