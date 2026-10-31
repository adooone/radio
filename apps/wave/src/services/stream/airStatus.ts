import { env } from '@/utils/env';

/**
 * nginx-rtmp rewrites the HLS playlist on every fragment (3 s) while a
 * publisher is connected, and leaves it untouched once the publisher
 * goes. Its `Last-Modified` is therefore a publisher signal that needs
 * no nginx change — unlike `/rtmp_stats`, which is per worker.
 */
export const LIVE_MAX_AGE_SEC = 10;

export function isPlaylistLive(
  response: { ok: boolean; lastModified: string | null },
  now: Date = new Date(),
  maxAgeSec = LIVE_MAX_AGE_SEC,
): boolean {
  if (!response.ok || !response.lastModified) return false;
  const written = Date.parse(response.lastModified);
  if (Number.isNaN(written)) return false;
  return now.getTime() - written < maxAgeSec * 1000;
}

type PlaylistFetch = (
  url: string,
) => Promise<{ ok: boolean; lastModified: string | null }>;

const headPlaylist: PlaylistFetch = async (url) => {
  const response = await fetch(url, { method: 'HEAD' });
  return {
    ok: response.ok,
    lastModified: response.headers.get('last-modified'),
  };
};

export class AirStatus {
  constructor(
    private fetchPlaylist: PlaylistFetch = headPlaylist,
    private playlistUrl = `${env.rtmpHttpUrl}/hls/${env.streamKey}.m3u8`,
  ) {}

  /** True while someone is publishing to the player's stream key. */
  async isLive(): Promise<boolean> {
    try {
      return isPlaylistLive(await this.fetchPlaylist(this.playlistUrl));
    } catch {
      // The relay is down; nothing can be on the air.
      return false;
    }
  }
}

export const airStatus = new AirStatus();
