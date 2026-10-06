import { queryClient } from '@/services/api/clients/query-client';
import { useNotificationStore } from '@/stores/notification-store';

interface WebSocketMessage {
  type: 'notification' | 'system_status' | 'stream_event';
  data: unknown;
  timestamp: string;
}

interface SystemNotification {
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
}

interface StreamEvent {
  service: 'rtmp';
  event: 'started' | 'stopped' | 'error' | 'connected' | 'disconnected';
  message?: string;
}

class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000; // Start with 1 second
  private isConnecting = false;
  private shouldReconnect = true;

  constructor(private url: string) {
    this.connect();
  }

  private connect() {
    if (
      this.isConnecting ||
      (this.ws && this.ws.readyState === WebSocket.CONNECTING)
    ) {
      return;
    }

    this.isConnecting = true;

    try {
      this.ws = new WebSocket(this.url);
      this.setupEventListeners();
    } catch (error) {
      console.error('WebSocket connection error:', error);
      this.handleReconnect();
    }
  }

  private setupEventListeners() {
    if (!this.ws) return;

    this.ws.onopen = () => {
      console.log('WebSocket connected');
      this.isConnecting = false;
      this.reconnectAttempts = 0;
      this.reconnectDelay = 1000;

      // Send initial connection message
      this.send({
        type: 'connection',
        data: { client: 'admin-panel' },
        timestamp: new Date().toISOString(),
      });
    };

    this.ws.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        this.handleMessage(message);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    this.ws.onclose = (event) => {
      console.log('WebSocket disconnected:', event.code, event.reason);
      this.isConnecting = false;

      if (this.shouldReconnect) {
        this.handleReconnect();
      }
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      this.isConnecting = false;
    };
  }

  private handleMessage(message: WebSocketMessage) {
    const { addNotification } = useNotificationStore.getState();

    switch (message.type) {
      case 'notification': {
        const notification = message.data as SystemNotification;
        addNotification({
          type: notification.type,
          title: notification.title,
          message: notification.message,
          duration: notification.duration,
        });
        break;
      }

      case 'stream_event': {
        const streamEvent = message.data as StreamEvent;
        this.handleStreamEvent(streamEvent);
        break;
      }

      case 'system_status':
        // Handle system status updates
        console.log('System status update:', message.data);
        break;

      default:
        console.log('Unknown WebSocket message type:', message.type);
    }
  }

  private handleStreamEvent(event: StreamEvent) {
    const { addNotification } = useNotificationStore.getState();

    const serviceNames = {
      rtmp: 'RTMP Server',
    };

    const serviceName = serviceNames[event.service];

    // Invalidate monitoring data for real-time UI updates
    queryClient.invalidateQueries({ queryKey: ['monitoring', 'data'] });
    queryClient.refetchQueries({ queryKey: ['monitoring', 'data'] });

    switch (event.event) {
      case 'started':
        addNotification({
          type: 'success',
          title: `${serviceName} Started`,
          message: event.message || `${serviceName} is now running`,
        });
        break;

      case 'stopped':
        addNotification({
          type: 'info',
          title: `${serviceName} Stopped`,
          message: event.message || `${serviceName} has been stopped`,
        });
        break;

      case 'error':
        addNotification({
          type: 'error',
          title: `${serviceName} Error`,
          message: event.message || `${serviceName} encountered an error`,
          duration: 0, // Persistent for errors
        });
        break;

      case 'connected':
        addNotification({
          type: 'success',
          title: `${serviceName} Connected`,
          message: event.message || `${serviceName} connection established`,
        });
        break;

      case 'disconnected':
        addNotification({
          type: 'warning',
          title: `${serviceName} Disconnected`,
          message: event.message || `${serviceName} connection lost`,
        });
        break;
    }
  }

  private handleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      const { addNotification } = useNotificationStore.getState();
      addNotification({
        type: 'error',
        title: 'Connection Lost',
        message: 'Unable to connect to server. Real-time updates disabled.',
        duration: 0,
        action: {
          label: 'Retry Connection',
          onClick: () => {
            this.reconnectAttempts = 0;
            this.connect();
          },
        },
      });
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(
      this.reconnectDelay * 2 ** (this.reconnectAttempts - 1),
      30000,
    );

    console.log(
      `Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`,
    );

    setTimeout(() => {
      this.connect();
    }, delay);
  }

  private send(message: Record<string, unknown>) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }

  public disconnect() {
    this.shouldReconnect = false;
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  public isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

// Create singleton instance
let webSocketService: WebSocketService | null = null;

export const initializeWebSocket = (url: string) => {
  if (!webSocketService) {
    webSocketService = new WebSocketService(url);
  }
  return webSocketService;
};

export const getWebSocketService = () => webSocketService;

export { WebSocketService };
