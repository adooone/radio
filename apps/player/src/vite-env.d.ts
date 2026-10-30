/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** The HLS address of the live air. */
  readonly VITE_STREAM_URL?: string;
}
