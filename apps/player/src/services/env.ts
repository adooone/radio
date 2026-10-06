import pkg from '../../package.json';

export const version = pkg.version;

export const getEnv = () => import.meta.env.VITE_APP_ENV;

function getDefaultApiUrl(): string {
  if (typeof window !== 'undefined') {
    const { protocol, hostname } = window.location;
    return `${protocol}//${hostname}:6870`;
  }
  return 'http://localhost:6870';
}

function getDefaultSocketUrl(): string {
  if (typeof window !== 'undefined') {
    const { protocol, hostname } = window.location;
    const wsProtocol = protocol === 'https:' ? 'wss:' : 'ws:';
    return `${wsProtocol}//${hostname}:6871`;
  }
  return 'ws://localhost:6871';
}

export const apiUrl = import.meta.env.VITE_API_URL || getDefaultApiUrl();
export const socketUrl =
  import.meta.env.VITE_SOCKET_URL || getDefaultSocketUrl();
export const streamUrl = import.meta.env.VITE_STREAM_URL;

export const isDev = getEnv() === 'development';
export const isProd = getEnv() === 'production';
export const isPreview = getEnv() === 'preview';
