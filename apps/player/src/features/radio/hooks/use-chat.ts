import { useEffect, useState, useCallback } from 'react';
import { subscribe, getSocket } from '@/services/socket';
import { useSound } from './use-sound';

export interface ChatMessage {
  nickname: string;
  text: string;
  timestamp: string;
}

export const useChat = (nickname: string | null) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const { play } = useSound();

  const onMessage = useCallback(
    (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        if (
          data?.type === 'chat' &&
          typeof data.text === 'string' &&
          typeof data.nickname === 'string'
        ) {
          const newMessage = {
            nickname: data.nickname || 'Анонім',
            text: data.text,
            timestamp: data.timestamp ?? new Date().toISOString(),
          };

          setMessages((prev) => [...prev, newMessage]);

          // Play sound only for messages from other users
          if (data.nickname !== nickname) {
            play('message');
          }
        }
      } catch {}
    },
    [nickname, play],
  );

  useEffect(() => {
    let ws: WebSocket | null = null;

    const attach = (socket: WebSocket) => {
      ws?.removeEventListener('message', onMessage);
      ws = socket;
      ws.addEventListener('message', onMessage);
    };

    const unsubscribe = subscribe(attach);

    return () => {
      ws?.removeEventListener('message', onMessage);
      unsubscribe();
    };
  }, [onMessage]);

  const sendMessage = useCallback(
    (text: string) => {
      if (!nickname) return;
      const ws = getSocket();
      ws.send(JSON.stringify({ type: 'chat', nickname, text }));
      play('send');
    },
    [nickname, play],
  );

  return { messages, sendMessage };
};
