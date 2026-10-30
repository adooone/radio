/** The HLS address of the air; the public stream when the env leaves it unset. */
export const streamUrl: string =
  import.meta.env.VITE_STREAM_URL || 'https://stream.adoo.one/hls/test.m3u8';
