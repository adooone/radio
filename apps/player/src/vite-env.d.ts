/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** The HLS address of the live air. */
  readonly VITE_STREAM_URL?: string;
  /** Wave's WebSocket address (chat, now-playing). */
  readonly VITE_SOCKET_URL?: string;
}
