import { subscribe } from '@/lib/socket';
import { useCallback, useEffect, useState } from 'react';
import type { User, UserWithStatus } from './types';

const FIVE_MINUTES_MS = 5 * 60 * 1_000;

const isUserOnline = (lastSeen: string): boolean => {
  const lastSeenDate = new Date(lastSeen);
  if (Number.isNaN(lastSeenDate.getTime())) return false;
  return Date.now() - lastSeenDate.getTime() <= FIVE_MINUTES_MS;
};

/** Wave's `listeners` broadcast, with quiet seats padded in nameless. */
export const applyListenersMessage = (data: unknown): User[] | null => {
  if (
    typeof data !== 'object' ||
    data === null ||
    (data as { type?: unknown }).type !== 'listeners' ||
    !Array.isArray((data as { users?: unknown }).users)
  ) {
    return null;
  }
  const payload = data as { users: User[]; listeners?: number };
  const list: User[] = [...payload.users];
  if (
    typeof payload.listeners === 'number' &&
    payload.listeners > list.length
  ) {
    for (let i = list.length; i < payload.listeners; i++) {
      list.push({
        nickname: '',
        lastSeen: new Date().toISOString(),
        color: null,
      });
    }
  }
  return list;
};

/** A lone colour change from `user_color_updated`, folded into the roster between broadcasts. */
export const applyColorUpdateMessage = (
  users: User[],
  data: unknown,
): User[] | null => {
  if (
    typeof data !== 'object' ||
    data === null ||
    (data as { type?: unknown }).type !== 'user_color_updated' ||
    typeof (data as { nickname?: unknown }).nickname !== 'string'
  ) {
    return null;
  }
  const payload = data as { nickname: string; color: string | null };
  return users.map((user) =>
    user.nickname === payload.nickname
      ? { ...user, color: payload.color ?? null }
      : user,
  );
};

/** Who is listening, from wave's `listeners` broadcasts and the odd colour update in between. */
export const useUserList = (): UserWithStatus[] => {
  const [users, setUsers] = useState<User[]>([]);

  const onMessage = useCallback((msg: MessageEvent) => {
    try {
      const data = JSON.parse(msg.data);
      const listeners = applyListenersMessage(data);
      if (listeners) {
        setUsers(listeners);
        return;
      }
      setUsers(
        (previous) => applyColorUpdateMessage(previous, data) ?? previous,
      );
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
