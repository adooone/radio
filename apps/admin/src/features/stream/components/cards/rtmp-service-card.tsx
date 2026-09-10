import type { RtmpServiceStats } from '@radio/types';
import { Card, Button, StatusIndicator, StatsGrid } from '@dendelion/mojo-ui';
import { InlineServiceAlert } from './inline-service-alert';

interface StatItem {
  label: string;
  value: string | number;
  suffix?: string;
  highlight?: boolean;
}
import {
  useStartRtmpServer,
  useStopRtmpServer,
  useRestartRtmpServer,
} from '@/services/api/hooks/use-stream-control';

interface RtmpServiceCardProps {
  stats: RtmpServiceStats | null;
}

const getRtmpStatusDisplayValue = (status: string): string => {
  switch (status) {
    case 'running':
      return 'Running';
    case 'exited':
      return 'Stopped';
    case 'created':
      return 'Created';
    case 'restarting':
      return 'Restarting...';
    case 'paused':
      return 'Paused';
    case 'dead':
      return 'Dead';
    default:
      return status || 'Unknown';
  }
};

const isHealthyStatus = (status: string): boolean => {
  if (!status) return false;

  // Check for healthy status patterns
  if (status === 'running') return true;
  if (status.includes('healthy')) return true;
  if (status.includes('Up') && status.includes('minutes')) return true;
  if (status.includes('Up') && status.includes('hours')) return true;

  // Check for unhealthy status patterns
  if (status === 'exited') return false;
  if (status === 'dead') return false;
  if (status === 'restarting') return false;
  if (status.includes('unhealthy')) return false;
  if (status.includes('error')) return false;

  // Default to false for unknown statuses
  return false;
};

export const RtmpServiceCard: React.FC<RtmpServiceCardProps> = ({ stats }) => {
  const startMutation = useStartRtmpServer();
  const stopMutation = useStopRtmpServer();
  const restartMutation = useRestartRtmpServer();

  const isLoading =
    startMutation.isPending ||
    stopMutation.isPending ||
    restartMutation.isPending;

  const getServiceStats = (): StatItem[] => {
    if (!stats) return [];

    const baseStats: StatItem[] = [
      {
        label: 'Container',
        value: getRtmpStatusDisplayValue(stats.status),
        highlight: !isHealthyStatus(stats.status),
      },
      {
        label: 'Publishers',
        value: stats.stats?.rtmp?.activePublishers || 0,
        highlight: false,
      },
      {
        label: 'Connections',
        value: stats.stats?.rtmp?.totalConnections || 0,
        highlight: false,
      },
    ];

    if (stats.stats?.container) {
      const container = stats.stats.container;
      baseStats.push(
        {
          label: 'CPU',
          value: container.cpuPercent,
          suffix: '%',
          highlight: false,
        },
        {
          label: 'Memory',
          value: container.memoryUsage,
          suffix: 'MB',
          highlight: false,
        },
        {
          label: 'Network In',
          value: container.networkIn,
          suffix: 'GB',
          highlight: false,
        },
        {
          label: 'Network Out',
          value: container.networkOut,
          suffix: 'GB',
          highlight: false,
        },
      );
    }

    return baseStats;
  };

  const isRunning = stats?.isRunning || false;

  // Check for RTMP service status and issues
  const getServiceAlert = () => {
    if (!stats) return null;

    // RTMP server error states - only show error for actually unhealthy statuses
    if (
      stats.status &&
      !isHealthyStatus(stats.status) &&
      stats.status !== 'exited'
    ) {
      return {
        type: 'error' as const,
        message: `Container error: ${getRtmpStatusDisplayValue(stats.status)}`,
        action: {
          label: 'Restart',
          onClick: () => restartMutation.mutate(),
        },
      };
    }

    // High resource usage warnings
    if (stats.stats?.container) {
      const container = stats.stats.container;
      if (container.cpuPercent > 80) {
        return {
          type: 'warning' as const,
          message: `High CPU usage: ${container.cpuPercent}%`,
        };
      }
      if (container.memoryPercent > 90) {
        return {
          type: 'warning' as const,
          message: `High memory usage: ${container.memoryPercent}%`,
        };
      }
    }

    // Show success state when everything is working fine
    if (isHealthyStatus(stats.status) && stats.isRunning) {
      const activePublishers = stats.stats?.rtmp?.activePublishers || 0;
      const totalConnections = stats.stats?.rtmp?.totalConnections || 0;

      if (activePublishers > 0) {
        return {
          type: 'success' as const,
          message: `Streaming active - ${activePublishers} publisher(s), ${totalConnections} connection(s)`,
        };
      }
      if (totalConnections > 0) {
        return {
          type: 'info' as const,
          message: `Server ready - ${totalConnections} connection(s), waiting for stream`,
        };
      }
      return {
        type: 'success' as const,
        message: 'Server running and ready for connections',
      };
    }

    // Also show success if just isRunning is true (fallback)
    if (stats.isRunning && !stats.status) {
      return {
        type: 'success' as const,
        message: 'Server running and ready for connections',
      };
    }

    return null;
  };

  const serviceAlert = getServiceAlert();

  const statusValue = stats?.isRunning
    ? stats?.status === 'error'
      ? 'error'
      : stats?.status === 'restarting'
        ? 'initializing'
        : 'running'
    : 'stopped';

  return (
    <Card
      title="RTMP Server"
      footer={<StatusIndicator status={statusValue} />}
      actions={[
        {
          label: isRunning ? 'Stop' : 'Start',
          variant: isRunning ? ('yellow' as const) : ('green' as const),
          onClick: () => {
            if (isRunning) {
              stopMutation.mutate();
            } else {
              startMutation.mutate();
            }
          },
          disabled: isLoading,
        },
        {
          label: 'Restart',
          variant: 'gray' as const,
          onClick: () => restartMutation.mutate(),
          disabled: isLoading,
        },
      ].map((action) => (
        <Button
          key={action.label}
          variant={action.variant}
          title={action.label}
          onClick={action.onClick}
          disabled={action.disabled}
        />
      ))}
    >
      <StatsGrid stats={getServiceStats()} columns={2} />
      {serviceAlert && (
        <div className="mt-3">
          <InlineServiceAlert
            type={serviceAlert.type}
            message={serviceAlert.message}
            action={serviceAlert.action}
          />
        </div>
      )}
    </Card>
  );
};
