import { getSocket, subscribe } from '@/lib/socket';
import { playSound } from '@/lib/sound';
import { useCallback, useEffect, useState } from 'react';
import type { ChatMessage } from './types';

export const useChat = (nickname: string | null) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const onMessage = useCallback(
    (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        if (
          data?.type !== 'chat' ||
          typeof data.text !== 'string' ||
          typeof data.nickname !== 'string'
        ) {
          return;
        }
        setMessages((prev) => [
          ...prev,
          {
            nickname: data.nickname || '',
            text: data.text,
            timestamp: data.timestamp ?? new Date().toISOString(),
          },
        ]);
        if (data.nickname !== nickname) playSound('message');
      } catch {
        // Not JSON — not for us.
      }
    },
    [nickname],
  );

  useEffect(() => {
    let ws: WebSocket | null = null;

    const unsubscribe = subscribe((socket) => {
      ws?.removeEventListener('message', onMessage);
      ws = socket;
      ws.addEventListener('message', onMessage);
    });

    return () => {
      ws?.removeEventListener('message', onMessage);
      unsubscribe();
    };
  }, [onMessage]);

  const sendMessage = useCallback(
    (text: string) => {
      if (!nickname) return;
      try {
        getSocket().send(JSON.stringify({ type: 'chat', nickname, text }));
        playSound('send');
      } catch {
        // The socket is down; the reconnect timer is already on it.
      }
    },
    [nickname],
  );

  return { messages, sendMessage };
};
