import { subscribe } from '@/lib/socket';
import { useEffect, useRef, useState } from 'react';

export interface NowPlaying {
  artist: string;
  title: string;
  cover?: string;
  /** A photo from the album's sessions, for the room behind the record. */
  backdrop?: string;
}

/** Seconds this listener hears behind the air, or null while not listening. */
export type LagSource = () => number | null;

/**
 * How long to hold a song's details before showing them: the listener's
 * lag behind the air, less the time the song has already been on air.
 * Shown at once when nothing is playing, or when the music is already there.
 */
export const holdFor = (lagSec: number | null, elapsedMs: number): number =>
  lagSec === null ? 0 : Math.max(0, Math.round(lagSec * 1000 - elapsedMs));

/** Reads a now_playing message; undefined for anything else. */
export const parseNowPlaying = (
  raw: string,
): { song: NowPlaying | null; elapsedMs: number } | undefined => {
  let data: Record<string, unknown>;
  try {
    data = JSON.parse(raw);
  } catch {
    return undefined; // Not JSON — not for us.
  }
  if (data?.type !== 'now_playing') return undefined;
  const text = (value: unknown) =>
    typeof value === 'string' && value ? value : undefined;
  const title = text(data.title);
  return {
    song: title
      ? {
          artist: text(data.artist) ?? '',
          title,
          cover: text(data.cover),
          backdrop: text(data.backdrop),
        }
      : null,
    elapsedMs:
      typeof data.elapsedMs === 'number' && data.elapsedMs > 0
        ? data.elapsedMs
        : 0,
  };
};

/** Starts fetching an image, so it is ready the moment it is shown. */
const preload = (url?: string) => {
  if (!url || typeof Image === 'undefined') return;
  const image = new Image();
  image.src = url;
};

/**
 * The song this listener is hearing. Wave announces each song as it starts
 * sending it, but the stream reaches a listener some seconds later; so each
 * announcement is held for the listener's own lag (from `getLag`) less how
 * long the song has been on air, and only then shown — title, cover and
 * session photo together with the music. Images start loading at once.
 * Null until a song is announced; the sleeve then shows the house label.
 */
export const useNowPlaying = (getLag: LagSource = () => null) => {
  const [song, setSong] = useState<NowPlaying | null>(null);
  const lagRef = useRef(getLag);
  lagRef.current = getLag;

  useEffect(() => {
    let ws: WebSocket | null = null;
    let received = 0;
    let shown = 0;
    const timers = new Set<number>();

    const onMessage = (event: MessageEvent) => {
      const message = parseNowPlaying(String(event.data));
      if (!message) return;
      const id = ++received;
      preload(message.song?.cover);
      preload(message.song?.backdrop);
      // A later announcement already shown wins over an earlier one.
      const show = () => {
        if (id < shown) return;
        shown = id;
        setSong(message.song);
      };
      const wait = holdFor(lagRef.current(), message.elapsedMs);
      if (wait === 0) {
        show();
        return;
      }
      const timer = window.setTimeout(() => {
        timers.delete(timer);
        show();
      }, wait);
      timers.add(timer);
    };

    const unsubscribe = subscribe((socket) => {
      ws?.removeEventListener('message', onMessage);
      ws = socket;
      ws.addEventListener('message', onMessage);
    });

    return () => {
      ws?.removeEventListener('message', onMessage);
      unsubscribe();
      for (const timer of timers) window.clearTimeout(timer);
    };
  }, []);

  return song;
};
