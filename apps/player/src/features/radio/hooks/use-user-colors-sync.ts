import { useEffect, useCallback } from 'react';
import { subscribe } from '@/services/socket';
import { useUserColorsStore } from '@/stores/user-colors-store';

interface UserColorUpdatedMessage {
  type: 'user_color_updated';
  nickname: string;
  color: string | null;
}

interface ListenersMessage {
  type: 'listeners';
  listeners: number;
  users: Array<{
    nickname: string;
    lastSeen: string;
    color?: string | null;
  }>;
}

export const useUserColorsSync = () => {
  const { setUserColor } = useUserColorsStore();

  const handleMessage = useCallback(
    (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);

        // Handle individual color updates
        if (data?.type === 'user_color_updated') {
          const message = data as UserColorUpdatedMessage;
          setUserColor(message.nickname, message.color);
        }

        // Handle user list updates (which may include color info)
        if (data?.type === 'listeners' && Array.isArray(data.users)) {
          const message = data as ListenersMessage;

          // Update colors for all users in the list
          for (const user of message.users) {
            if (user.nickname && user.color !== undefined) {
              setUserColor(user.nickname, user.color);
            }
          }

          // Note: We don't remove users here since the listeners message
          // might not include all users (e.g., anonymous users)
          // User removal should be handled by other mechanisms if needed
        }
      } catch (error) {
        // Ignore invalid JSON messages
      }
    },
    [setUserColor],
  );

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
};
