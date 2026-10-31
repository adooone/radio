import { subscribe } from '@/lib/socket';
import { useCallback, useEffect, useState } from 'react';
import type { User, UserWithStatus } from './types';

const FIVE_MINUTES_MS = 5 * 60 * 1_000;

const isUserOnline = (lastSeen: string): boolean => {
  const lastSeenDate = new Date(lastSeen);
  if (Number.isNaN(lastSeenDate.getTime())) return false;
  return Date.now() - lastSeenDate.getTime() <= FIVE_MINUTES_MS;
};

/** Who is listening, from wave's `listeners` broadcasts; quiet ones count as Anonymous. */
export const useUserList = (): UserWithStatus[] => {
  const [users, setUsers] = useState<User[]>([]);

  const onMessage = useCallback((msg: MessageEvent) => {
    try {
      const data = JSON.parse(msg.data);
      if (data?.type !== 'listeners' || !Array.isArray(data.users)) return;
      const list: User[] = [...data.users];
      if (typeof data.listeners === 'number' && data.listeners > list.length) {
        for (let i = list.length; i < data.listeners; i++) {
          list.push({
            nickname: 'Anonymous',
            lastSeen: new Date().toISOString(),
          });
        }
      }
      setUsers(list);
    } catch {
      // Not JSON — not for us.
    }
  }, []);

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

  return users.map((user) => ({
    ...user,
    isOnline: isUserOnline(user.lastSeen),
  }));
};
