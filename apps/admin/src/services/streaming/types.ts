export interface StreamHealth {
  isConnected: boolean;
  lastConnectionTime: string | null;
  totalFramesSent: number;
  currentBitrate: number;
  connectionErrors: number;
  lastHealthCheck: string;
}

export interface RtmpStats {
  isRunning: boolean;
  activePublishers: number;
  totalConnections: number;
  applications: Array<{
    name: string;
    streams: Array<{
      name: string;
      bandwidth: number;
      clients: number;
    }>;
  }>;
}

export interface WebsiteStats {
  activeViewers: number;
  totalViews: number;
  peakViewers: number;
  averageViewTime: number;
}

export interface PM2Status {
  pid: number;
  status: string;
  cpu: number;
  memory: number;
  uptime: number;
}

export interface DaemonStatus {
  isRunning: boolean;
  streamHealth?: StreamHealth;
  lastUpdate: string;
}

export interface ServiceStatus {
  isRunning: boolean;
  status?: string;
  error?: string;
  message?: string;
}

export interface MonitoringDashboard {
  services: {
    rtmp: {
      stats: RtmpStats | null;
    };
    website: {
      stats: WebsiteStats | null;
    };
  };
}
