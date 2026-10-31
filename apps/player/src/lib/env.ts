/** The HLS address of the air; the public stream when the env leaves it unset. */
export const streamUrl: string =
  import.meta.env.VITE_STREAM_URL || 'https://stream.adoo.one/hls/test.m3u8';

/** Wave's WebSocket (chat, now-playing); wave's dev port next to this host by default. */
export const socketUrl: string =
  import.meta.env.VITE_SOCKET_URL ||
  `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.hostname}:6871`;
