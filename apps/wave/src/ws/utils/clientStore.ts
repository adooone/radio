import type { ServerWebSocket } from 'bun';
import type { WebSocketData } from '../types';

export class ClientStore {
  private clients: Set<ServerWebSocket<WebSocketData>> = new Set();
  private lastPongMap: Map<ServerWebSocket<WebSocketData>, number> = new Map();
  private lastActivityMap: Map<ServerWebSocket<WebSocketData>, number> =
    new Map();

  addClient(ws: ServerWebSocket<WebSocketData>) {
    try {
      this.clients.add(ws);
      const now = Date.now();
      this.lastPongMap.set(ws, now);
      this.lastActivityMap.set(ws, now);
    } catch (error) {
      console.error('Error adding client:', error);
    }
  }

  removeClient(ws: ServerWebSocket<WebSocketData>) {
    try {
      this.clients.delete(ws);
      this.lastPongMap.delete(ws);
      this.lastActivityMap.delete(ws);
    } catch (error) {
      console.error('Error removing client:', error);
    }
  }

  updateLastPong(ws: ServerWebSocket<WebSocketData>) {
    try {
      const now = Date.now();
      this.lastPongMap.set(ws, now);
      this.lastActivityMap.set(ws, now);
    } catch (error) {
      console.error('Error updating last pong:', error);
    }
  }

  updateLastActivity(ws: ServerWebSocket<WebSocketData>) {
    try {
      this.lastActivityMap.set(ws, Date.now());
    } catch (error) {
      console.error('Error updating last activity:', error);
    }
  }

  getLastPong(ws: ServerWebSocket<WebSocketData>): number {
    try {
      return this.lastPongMap.get(ws) ?? 0;
    } catch (error) {
      console.error('Error getting last pong:', error);
      return 0;
    }
  }

  getLastActivity(ws: ServerWebSocket<WebSocketData>): number {
    try {
      return this.lastActivityMap.get(ws) ?? 0;
    } catch (error) {
      console.error('Error getting last activity:', error);
      return 0;
    }
  }

  getClients(): Set<ServerWebSocket<WebSocketData>> {
    return new Set(this.clients); // Return a copy to prevent external modification
  }

  getClientCount(): number {
    try {
      return this.clients.size;
    } catch (error) {
      console.error('Error getting client count:', error);
      return 0;
    }
  }

  broadcast(message: string) {
    const disconnectedClients: ServerWebSocket<WebSocketData>[] = [];

    for (const ws of this.clients) {
      try {
        if (ws.readyState === 1) {
          // WebSocket.OPEN
          ws.send(message);
        } else {
          disconnectedClients.push(ws);
        }
      } catch (error) {
        console.error('Error broadcasting message to client:', error);
        disconnectedClients.push(ws);
      }
    }

    // Clean up disconnected clients
    for (const ws of disconnectedClients) {
      this.removeClient(ws);
    }
  }

  // Clean up dead connections
  cleanupDeadConnections() {
    const deadClients: ServerWebSocket<WebSocketData>[] = [];

    for (const ws of this.clients) {
      try {
        if (ws.readyState !== 1) {
          // Not WebSocket.OPEN
          deadClients.push(ws);
        }
      } catch (error) {
        console.error('Error checking client state:', error);
        deadClients.push(ws);
      }
    }

    for (const ws of deadClients) {
      this.removeClient(ws);
    }

    return deadClients.length > 0;
  }
}

export const clientStore = new ClientStore();
