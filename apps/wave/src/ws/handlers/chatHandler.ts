import type { ServerWebSocket } from 'bun';
import { addMessage } from '../../utils/chatStore';
import type {
  ChatPayload,
  ColorUpdatePayload,
  JoinPayload,
  WebSocketData,
} from '../types';
import { clientStore } from '../utils/clientStore';

function setUserNickname(
  ws: ServerWebSocket<WebSocketData>,
  nickname: string,
): boolean {
  // Return true if nickname was actually set (not already set)
  if (ws.data?.nickname === nickname) {
    return false; // No change
  }

  ws.data = { ...ws.data, nickname };
  return true; // Nickname was set/changed
}

function setUserColor(
  ws: ServerWebSocket<WebSocketData>,
  color: string | null,
): boolean {
  // Return true if color was actually changed
  if (ws.data?.color === color) {
    return false; // No change
  }

  ws.data = { ...ws.data, color };
  return true; // Color was set/changed
}

export function handleChatMessage(
  ws: ServerWebSocket<WebSocketData>,
  message: string | Buffer,
) {
  try {
    const data = JSON.parse(message.toString()) as
      | ChatPayload
      | JoinPayload
      | ColorUpdatePayload;

    if (data?.type === 'join') {
      const joinData = data as JoinPayload;
      if (joinData.nickname) {
        const wasChanged = setUserNickname(ws, joinData.nickname);
        // Update user activity on join
        clientStore.updateLastActivity(ws);
        // Broadcast will be handled by server.ts broadcastListeners
        // Only trigger if this is a new nickname
        if (wasChanged) {
          // The server will handle broadcasting through broadcastListeners
        }
      }
    } else if (data?.type === 'color_update') {
      const colorData = data as ColorUpdatePayload;
      if (colorData.nickname && ws.data?.nickname === colorData.nickname) {
        const wasChanged = setUserColor(ws, colorData.color);
        // Update user activity on color change
        clientStore.updateLastActivity(ws);

        if (wasChanged) {
          // Broadcast the color update to all clients
          const updateMessage = {
            type: 'user_color_updated',
            nickname: colorData.nickname,
            color: colorData.color,
          };
          clientStore.broadcast(JSON.stringify(updateMessage));
        }
      }
    } else if (data?.type === 'chat') {
      const chatData = data as ChatPayload;
      const payload: ChatPayload = {
        type: 'chat',
        nickname: chatData.nickname,
        text: chatData.text,
        timestamp: new Date().toISOString(),
      };

      if (chatData.nickname) {
        setUserNickname(ws, chatData.nickname);
        // Don't broadcast user changes here - let broadcastListeners handle it
      }

      // Update user activity on chat message
      clientStore.updateLastActivity(ws);

      addMessage(payload);
      clientStore.broadcast(JSON.stringify(payload));
    }
  } catch (error) {
    console.error('Error handling chat message:', error);
  }
}
