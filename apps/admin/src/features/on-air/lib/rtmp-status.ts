import type { RtmpServiceStats } from '@radio/types';

/* What the RTMP container's docker status means, in the admin's words. */
export const rtmpStatusLabel = (status: string): string => {
  switch (status) {
    case 'running':
      return 'працює';
    case 'exited':
      return 'зупинено';
    case 'created':
      return 'створено';
    case 'restarting':
      return 'перезапуск…';
    case 'paused':
      return 'на паузі';
    case 'dead':
      return 'не відповідає';
    default:
      return status || 'невідомо';
  }
};

/* Docker reports health in prose ("Up 7 hours (healthy)"); read it. */
export const isHealthyStatus = (status: string): boolean => {
  if (!status) return false;
  if (status === 'running') return true;
  if (status.includes('healthy') && !status.includes('unhealthy')) return true;
  if (status.includes('Up') && status.includes('minutes')) return true;
  if (status.includes('Up') && status.includes('hours')) return true;
  return false;
};

export type RtmpLampStatus = 'running' | 'stopped' | 'error' | 'initializing';

/** The service's state for a status lamp. */
export const rtmpLampStatus = (
  stats: RtmpServiceStats | null | undefined,
): RtmpLampStatus => {
  if (!stats?.isRunning) return 'stopped';
  if (stats.status === 'error') return 'error';
  if (stats.status === 'restarting') return 'initializing';
  return 'running';
};

export type RtmpAlert = {
  tone: 'alert' | 'warn' | 'default' | 'muted';
  message: string;
  /** The line offers a restart when the container is in trouble. */
  restart?: boolean;
};

/* One line about the service, in priority: trouble, strain, then the
   healthy states with what they are doing. */
export const rtmpAlert = (
  stats: RtmpServiceStats | null | undefined,
): RtmpAlert | null => {
  if (!stats) return null;

  if (
    stats.status &&
    !isHealthyStatus(stats.status) &&
    stats.status !== 'exited'
  ) {
    return {
      tone: 'alert',
      message: `Контейнер: ${rtmpStatusLabel(stats.status)}`,
      restart: true,
    };
  }

  const container = stats.stats?.container;
  if (container) {
    if (container.cpuPercent > 80) {
      return {
        tone: 'warn',
        message: `Висока завантаженість CPU: ${container.cpuPercent.toFixed(0)} %`,
      };
    }
    if (container.memoryPercent > 90) {
      return {
        tone: 'warn',
        message: `Памʼять майже вичерпано: ${container.memoryPercent.toFixed(0)} %`,
      };
    }
  }

  if (isHealthyStatus(stats.status) && stats.isRunning) {
    const publishers = stats.stats?.rtmp?.activePublishers ?? 0;
    const connections = stats.stats?.rtmp?.totalConnections ?? 0;
    if (publishers > 0) {
      return {
        tone: 'default',
        message: `Потік іде — ${publishers} публікує, ${connections} зʼєднань`,
      };
    }
    if (connections > 0) {
      return {
        tone: 'muted',
        message: `Сервер готовий — ${connections} зʼєднань, чекає на потік`,
      };
    }
    return { tone: 'muted', message: 'Сервер готовий до зʼєднань' };
  }

  if (stats.isRunning && !stats.status) {
    return { tone: 'muted', message: 'Сервер готовий до зʼєднань' };
  }

  return null;
};

export type RtmpRow = { label: string; value: string; highlight?: boolean };

const mb = (bytes: number) => `${(bytes / 1024 / 1024).toFixed(1)} MB`;
const gb = (value: number) => `${value.toFixed(1)} GB`;

/* The service's figures as label / value rows for the monitoring tab. */
export const rtmpRows = (
  stats: RtmpServiceStats | null | undefined,
): RtmpRow[] => {
  if (!stats) return [];
  const rows: RtmpRow[] = [
    {
      label: 'Контейнер',
      value: rtmpStatusLabel(stats.status),
      highlight: !isHealthyStatus(stats.status),
    },
    {
      label: 'Публікують',
      value: String(stats.stats?.rtmp?.activePublishers ?? 0),
    },
    {
      label: 'Зʼєднань',
      value: String(stats.stats?.rtmp?.totalConnections ?? 0),
    },
  ];
  const container = stats.stats?.container;
  if (container) {
    rows.push(
      { label: 'CPU', value: `${container.cpuPercent.toFixed(1)} %` },
      { label: 'Памʼять', value: mb(container.memoryUsage) },
      { label: 'Вхідний трафік', value: gb(container.networkIn) },
      { label: 'Вихідний трафік', value: gb(container.networkOut) },
    );
  }
  return rows;
};

/** The listeners and the bandwidth across every published stream. */
export const streamFigures = (stats: RtmpServiceStats | null | undefined) => {
  const streams =
    stats?.stats?.rtmp?.applications.flatMap((app) => app.streams) ?? [];
  return {
    streams: streams.length,
    listeners: streams.reduce((sum, stream) => sum + stream.clients, 0),
    bandwidth: streams.reduce((sum, stream) => sum + stream.bandwidth, 0),
  };
};
