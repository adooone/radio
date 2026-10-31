import { subscribe } from '@/lib/socket';
import { useEffect, useState } from 'react';

export interface NowPlaying {
  artist: string;
  title: string;
  cover?: string;
}

/**
 * The song on air, when the backend announces it. Wave has no now-playing
 * source yet (IDEA-11's open question), so this listens for a `now_playing`
 * message on the shared socket and stays null until one arrives — the sleeve
 * then shows the house label instead of a cover.
 */
export const useNowPlaying = () => {
  const [song, setSong] = useState<NowPlaying | null>(null);

  useEffect(() => {
    let ws: WebSocket | null = null;

    const onMessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        if (data?.type !== 'now_playing') return;
        setSong(
          typeof data.title === 'string' && data.title
            ? {
                artist: typeof data.artist === 'string' ? data.artist : '',
                title: data.title,
                cover: typeof data.cover === 'string' ? data.cover : undefined,
              }
            : null,
        );
      } catch {
        // Not JSON — not for us.
      }
    };

    const unsubscribe = subscribe((socket) => {
      ws?.removeEventListener('message', onMessage);
      ws = socket;
      ws.addEventListener('message', onMessage);
    });

    return () => {
      ws?.removeEventListener('message', onMessage);
      unsubscribe();
    };
  }, []);

  return song;
};
