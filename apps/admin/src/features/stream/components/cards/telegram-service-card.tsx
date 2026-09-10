import type { UseMutationResult } from '@tanstack/react-query';
import type { TelegramServiceStats, RtmpServiceStats } from '@radio/types';
import { Card, Button, StatusIndicator, StatsGrid } from '@dendelion/mojo-ui';
import { InlineServiceAlert } from './inline-service-alert';

interface StatItem {
  label: string;
  value: string | number;
  suffix?: string;
  highlight?: boolean;
}
import {
  useStartTelegramStream,
  useStopTelegramStream,
  useRestartTelegramStream,
  useStartRtmpServer,
} from '@/services/api/hooks/use-stream-control';
import { useNotificationMutations } from '@/hooks/use-notification-mutations';

interface TelegramServiceCardProps {
  stats: TelegramServiceStats | null;
  rtmpStats?: RtmpServiceStats | null;
}

const getStatusDisplayValue = (status: string): string => {
  switch (status) {
    case 'running':
      return 'Running';
    case 'initializing':
      return 'Starting...';
    case 'stopped':
      return 'Stopped';
    case 'error':
      return 'Error';
    default:
      return 'Unknown';
  }
};

export const TelegramServiceCard: React.FC<TelegramServiceCardProps> = ({
  stats,
  rtmpStats,
}) => {
  const rawMutations = {
    start: useStartTelegramStream(),
    stop: useStopTelegramStream(),
    restart: useRestartTelegramStream(),
  };

  const startRtmpMutation = useStartRtmpServer();

  const mutations = useNotificationMutations(
    rawMutations as Record<
      string,
      UseMutationResult<unknown, unknown, unknown>
    >,
    {
      start: {
        loadingMessage: 'Starting Telegram stream...',
        successTitle: 'Telegram Stream Started',
        successMessage: 'Telegram stream is now running',
        errorTitle: 'Failed to Start Stream',
      },
      stop: {
        loadingMessage: 'Stopping Telegram stream...',
        successTitle: 'Telegram Stream Stopped',
        successMessage: 'Telegram stream has been stopped',
        errorTitle: 'Failed to Stop Stream',
      },
      restart: {
        loadingMessage: 'Restarting Telegram stream...',
        successTitle: 'Telegram Stream Restarted',
        successMessage: 'Telegram stream has been restarted',
        errorTitle: 'Failed to Restart Stream',
      },
    },
  );

  const isLoading =
    mutations.start.isPending ||
    mutations.stop.isPending ||
    mutations.restart.isPending;

  const getServiceStats = (): StatItem[] => {
    if (!stats) return [];

    const daemonStatus = stats.daemonStatus?.status || 'unknown';

    const baseStats: StatItem[] = [
      {
        label: 'Status',
        value: getStatusDisplayValue(daemonStatus),
        highlight: daemonStatus === 'error',
      },
    ];

    // Add stream key if available
    if (stats.streamKey) {
      baseStats.push({
        label: 'Stream Key',
        value: stats.streamKey,
        highlight: false,
      });
    }

    if (stats.pm2Status) {
      baseStats.push(
        {
          label: 'CPU',
          value: stats.pm2Status.cpu,
          suffix: '%',
          highlight: false,
        },
        {
          label: 'Memory',
          value: stats.pm2Status.memory,
          suffix: 'MB',
          highlight: false,
        },
      );
    }

    if (stats.daemonStatus?.streamHealth) {
      const health = stats.daemonStatus.streamHealth;
      baseStats.push(
        {
          label: 'Bitrate',
          value: health.currentBitrate,
          suffix: 'kbps',
          highlight: false,
        },
        {
          label: 'Frames Sent',
          value: health.totalFramesSent,
          highlight: false,
        },
      );
    }

    return baseStats;
  };

  // Use daemon status as primary source of truth for consistency
  const daemonStatus = stats?.daemonStatus?.status || 'unknown';
  const isRunning =
    daemonStatus === 'running' || daemonStatus === 'initializing';

  // Check for dependency issues
  const getDependencyAlert = () => {
    if (!stats || !rtmpStats) return null;

    const rtmpRunning = rtmpStats.isRunning || false;
    const telegramRunning = isRunning;

    // Telegram waiting for RTMP server
    if (telegramRunning && !rtmpRunning) {
      return {
        type: 'warning' as const,
        message: 'Waiting for RTMP server to start',
        action: {
          label: 'Start RTMP',
          onClick: () => startRtmpMutation.mutate(),
        },
      };
    }

    // Telegram service error
    if (daemonStatus === 'error') {
      return {
        type: 'error' as const,
        message: 'Service error - check logs for details',
        action: {
          label: 'Restart',
          onClick: () => mutations.restart.mutate(undefined),
        },
      };
    }

    // Stream health issues - use actual metrics instead of unreliable isConnected flag
    const streamHealth = stats.daemonStatus?.streamHealth;
    if (telegramRunning && streamHealth) {
      const hasActiveStream =
        streamHealth.currentBitrate > 0 || streamHealth.totalFramesSent > 0;

      // Only show connection warning if there's no active streaming AND isConnected is explicitly false
      if (!hasActiveStream && streamHealth.isConnected === false) {
        return {
          type: 'warning' as const,
          message: 'Stream not connected to RTMP',
          action: {
            label: 'Restart',
            onClick: () => mutations.restart.mutate(undefined),
          },
        };
      }
    }

    // Show success state when everything is working fine
    if (telegramRunning && rtmpRunning && streamHealth) {
      const bitrate = streamHealth.currentBitrate;
      const frames = streamHealth.totalFramesSent;
      const hasActiveStream = bitrate > 0 || frames > 0;

      if (hasActiveStream) {
        return {
          type: 'success' as const,
          message: `Streaming active - ${bitrate} kbps, ${frames} frames sent`,
        };
      }

      if (streamHealth.isConnected) {
        return {
          type: 'info' as const,
          message: 'Connected and ready for streaming',
        };
      }
    }

    return null;
  };

  const dependencyAlert = getDependencyAlert();

  const statusValue =
    daemonStatus === 'error'
      ? 'error'
      : daemonStatus === 'initializing'
        ? 'initializing'
        : isRunning
          ? 'running'
          : 'stopped';

  return (
    <Card
      title="Telegram Stream"
      footer={<StatusIndicator status={statusValue} />}
      actions={[
        {
          label: isRunning ? 'Stop' : 'Start',
          variant: isRunning ? ('yellow' as const) : ('green' as const),
          onClick: () => {
            if (isRunning) {
              mutations.stop.mutate(undefined);
            } else {
              mutations.start.mutate(undefined);
            }
          },
          disabled: isLoading,
        },
        {
          label: 'Restart',
          variant: 'yellow' as const,
          onClick: () => mutations.restart.mutate(undefined),
          disabled: isLoading || !isRunning,
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
      {dependencyAlert && (
        <div className="mt-3">
          <InlineServiceAlert
            type={dependencyAlert.type}
            message={dependencyAlert.message}
            action={dependencyAlert.action}
          />
        </div>
      )}
    </Card>
  );
};
