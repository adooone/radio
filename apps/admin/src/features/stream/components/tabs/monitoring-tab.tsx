import clsx from 'clsx';
import { StatsCard } from '@dendelion/mojo-ui';
import { sharedStyles } from '@dendelion/mojo-ui/styles';
import { TelegramServiceCard, RtmpServiceCard } from '../cards';
import type { MonitoringData } from '@radio/types';

interface MonitoringTabProps {
  monitoring: MonitoringData | undefined;
  isLoading: boolean;
}

export const MonitoringTab: React.FC<MonitoringTabProps> = ({
  monitoring,
  isLoading,
}) => {
  const getStreamOverviewStats = () => {
    if (!monitoring) return [];

    const telegramService = monitoring.services.telegram;
    const rtmpService = monitoring.services.rtmp;
    const streamHealth = telegramService?.daemonStatus?.streamHealth;

    // Determine telegram status based on daemon status for consistency
    const telegramStatus = telegramService?.daemonStatus?.status || 'unknown';
    const telegramRunning =
      telegramStatus === 'running' || telegramStatus === 'initializing';
    const rtmpRunning = rtmpService?.isRunning || false;

    const totalServices = 2;
    const runningServices = Number(telegramRunning) + Number(rtmpRunning);

    const stats = [
      {
        title: 'Services Status',
        value: `${runningServices}/${totalServices} Active`,
        isOnline: runningServices === totalServices,
      },
      {
        title: 'System Uptime',
        value: formatUptime(monitoring.uptime),
      },
    ];

    // Add stream health stats if available
    if (streamHealth) {
      stats.push(
        {
          title: 'Stream Status',
          value: streamHealth.isConnected ? 'Connected' : 'Disconnected',
          isOnline: streamHealth.isConnected,
        },
        {
          title: 'Current Bitrate',
          value: `${streamHealth.currentBitrate} kbps`,
        },
        {
          title: 'Frames Sent',
          value: streamHealth.totalFramesSent.toString(),
        },
        {
          title: 'Last Update',
          value: formatTimestamp(monitoring.timestamp),
        },
      );
    } else {
      // Fallback when no stream health data
      stats.push({
        title: 'Last Update',
        value: formatTimestamp(monitoring.timestamp),
      });
    }

    return stats;
  };

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  };

  return (
    <div className="space-y-6">
      {/* Service Control */}
      <div className={clsx(sharedStyles.serviceSection)}>
        <h2 className={clsx(sharedStyles.serviceSectionTitle)}>
          Service Control
        </h2>
        <div className={clsx(sharedStyles.serviceGrid)}>
          <RtmpServiceCard stats={monitoring?.services.rtmp || null} />
          <TelegramServiceCard
            stats={monitoring?.services.telegram || null}
            rtmpStats={monitoring?.services.rtmp || null}
          />
        </div>

        <div className="grid grid-cols-6 gap-4 mt-10">
          {getStreamOverviewStats().map((stat) => (
            <StatsCard
              key={stat.title}
              title={stat.title}
              value={stat.value}
              isHighlight={stat.isOnline}
            />
          ))}
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className={clsx(sharedStyles.statsCard)}>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ember/60" />
            <p className="ml-3 text-ember/70">Loading monitoring data...</p>
          </div>
        </div>
      )}
    </div>
  );
};
