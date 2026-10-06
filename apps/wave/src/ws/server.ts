import { serve } from 'bun';
import type { ServerWebSocket } from 'bun';
import { getHistory } from '../utils/chatStore';
import { handleChatMessage } from './handlers/chatHandler';
import type { WebSocketData, WebSocketServer } from './types';
import { clientStore } from './utils/clientStore';

// Debounce broadcasts to prevent excessive updates
let broadcastTimeout: ReturnType<typeof setTimeout> | null = null;

function debouncedBroadcastListeners() {
  if (broadcastTimeout) {
    clearTimeout(broadcastTimeout);
  }
  broadcastTimeout = setTimeout(() => {
    broadcastListeners();
    broadcastTimeout = null;
  }, 100); // 100ms debounce
}

export function startWsServer(port = 6871): WebSocketServer {
  const server = serve({
    fetch(req, server) {
      if (server.upgrade(req)) return;
      return new Response('ws only', { status: 400 });
    },
    websocket: {
      open(ws: ServerWebSocket<WebSocketData>) {
        try {
          clientStore.addClient(ws);

          // Send chat history
          for (const msg of getHistory()) {
            try {
              ws.send(JSON.stringify({ type: 'chat', ...msg }));
            } catch (error) {
              console.error('Error sending chat history:', error);
              break; // Stop sending if there's an error
            }
          }

          // Broadcast updated listener count (debounced)
          debouncedBroadcastListeners();
        } catch (error) {
          console.error('Error in websocket open handler:', error);
        }
      },

      close(ws: ServerWebSocket<WebSocketData>) {
        try {
          clientStore.removeClient(ws);
          debouncedBroadcastListeners();
        } catch (error) {
          console.error('Error in websocket close handler:', error);
        }
      },

      message(ws: ServerWebSocket<WebSocketData>, message: string | Buffer) {
        try {
          handleChatMessage(ws, message);
          // Only broadcast if there might be nickname changes
          debouncedBroadcastListeners();
        } catch (error) {
          console.error('Error in websocket message handler:', error);
        }
      },

      pong(ws: ServerWebSocket<WebSocketData>) {
        try {
          clientStore.updateLastPong(ws);
        } catch (error) {
          console.error('Error in websocket pong handler:', error);
        }
      },
    },
    port,
  });

  const interval = setInterval(() => {
    try {
      const now = Date.now();
      let hasChanges = false;

      // Clean up dead connections first
      if (clientStore.cleanupDeadConnections()) {
        hasChanges = true;
      }

      for (const ws of clientStore.getClients()) {
        try {
          const last = clientStore.getLastPong(ws);
          if (now - last > 30000) {
            try {
              ws.close();
            } catch (error) {
              console.error('Error closing timed out websocket:', error);
            }
            clientStore.removeClient(ws);
            hasChanges = true;
            continue;
          }
          try {
            ws.ping();
          } catch (error) {
            console.error('Error pinging websocket:', error);
            // Remove client if ping fails
            clientStore.removeClient(ws);
            hasChanges = true;
          }
        } catch (error) {
          console.error('Error processing websocket in interval:', error);
          // Remove problematic client
          clientStore.removeClient(ws);
          hasChanges = true;
        }
      }

      // Only broadcast if there were actual changes
      if (hasChanges) {
        debouncedBroadcastListeners();
      }
    } catch (error) {
      console.error('Error in websocket maintenance interval:', error);
    }
  }, 10000);

  return {
    stop() {
      try {
        clearInterval(interval);
        if (broadcastTimeout) {
          clearTimeout(broadcastTimeout);
        }
        server.stop();
      } catch (error) {
        console.error('Error stopping websocket server:', error);
      }
    },
  };
}

function broadcastListeners() {
  try {
    const count = clientStore.getClientCount();

    // Get connected users with nicknames, lastSeen info, and colors
    const connectedUsers: {
      nickname: string;
      lastSeen: string;
      color?: string | null;
    }[] = [];

    for (const ws of clientStore.getClients()) {
      try {
        if (ws.data?.nickname) {
          const lastActivityTime = clientStore.getLastActivity(ws);
          connectedUsers.push({
            nickname: ws.data.nickname,
            lastSeen: new Date(lastActivityTime).toISOString(),
            color: ws.data.color, // Include user's color setting
          });
        }
      } catch (error) {
        console.error('Error processing user data:', error);
      }
    }

    const message = JSON.stringify({
      type: 'listeners',
      listeners: count,
      users: connectedUsers,
    });

    clientStore.broadcast(message);
  } catch (error) {
    console.error('Error in broadcastListeners:', error);
  }
}
