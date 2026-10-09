import { StatsCard } from '@/components';
import { sharedStyles } from '@/styles/shared-styles';
import type { MonitoringData } from '@radio/types';
import clsx from 'clsx';
import { RtmpServiceCard } from '../cards';

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

    const rtmpService = monitoring.services.rtmp;
    const rtmpRunning = rtmpService?.isRunning || false;

    const totalServices = 1;
    const runningServices = Number(rtmpRunning);

    return [
      {
        title: 'Services Status',
        value: `${runningServices}/${totalServices} Active`,
        isOnline: runningServices === totalServices,
      },
      {
        title: 'System Uptime',
        value: formatUptime(monitoring.uptime),
      },
      {
        title: 'Last Update',
        value: formatTimestamp(monitoring.timestamp),
      },
    ];
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
