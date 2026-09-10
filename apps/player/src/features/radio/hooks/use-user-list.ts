import { useEffect, useState, useCallback } from 'react';
import { subscribe } from '@/services/socket';

export interface User {
  nickname: string;
  lastSeen: string;
}

export interface UserWithStatus extends User {
  isOnline: boolean;
}

// Helper function to determine if user is online based on lastSeen
const isUserOnline = (lastSeen: string): boolean => {
  try {
    // Parse the ISO string and convert to local timezone
    const lastSeenDate = new Date(lastSeen);
    const now = new Date();

    // Calculate the difference in milliseconds
    const timeDifference = now.getTime() - lastSeenDate.getTime();
    const fiveMinutesInMs = 5 * 60 * 1000; // 5 minutes in milliseconds

    // User is online if they were seen within the last 5 minutes
    return timeDifference <= fiveMinutesInMs;
  } catch (error) {
    // If there's an error parsing the date, assume user is offline
    console.warn('Error parsing lastSeen date:', lastSeen, error);
    return false;
  }
};

// Helper function to enrich user with status information
const enrichUserWithStatus = (user: User): UserWithStatus => {
  return {
    ...user,
    isOnline: isUserOnline(user.lastSeen),
  };
};

export const useUserList = (): UserWithStatus[] => {
  const [users, setUsers] = useState<User[]>([]);

  const handleMessage = useCallback((msg: MessageEvent) => {
    try {
      const data = JSON.parse(msg.data);

      if (data?.type === 'listeners' && Array.isArray(data.users)) {
        const userList = [...data.users];

        if (
          typeof data.listeners === 'number' &&
          data.listeners > userList.length
        ) {
          const anonymousCount = data.listeners - userList.length;
          for (let i = 0; i < anonymousCount; i++) {
            userList.push({
              nickname: 'Анонім',
              lastSeen: new Date().toISOString(),
            });
          }
        }

        setUsers(userList);
      }
    } catch {}
  }, []);

  useEffect(() => {
    let ws: WebSocket | null = null;

    const attach = (socket: WebSocket) => {
      ws?.removeEventListener('message', handleMessage);
      ws = socket;
      ws.addEventListener('message', handleMessage);
    };

    const unsubscribe = subscribe(attach);

    return () => {
      ws?.removeEventListener('message', handleMessage);
      unsubscribe();
    };
  }, [handleMessage]);

  // Return users enriched with status information
  return users.map(enrichUserWithStatus);
};
