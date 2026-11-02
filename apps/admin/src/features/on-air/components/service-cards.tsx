import { StatsCard } from '@/components';
import { useMonitoringData, useStats } from '@/services/api/hooks';
import { formatDuration } from '@/utils/format-duration';
import { RtmpServiceCard } from './panels/rtmp-service-card';

export const ServiceCards = () => {
  const { data: monitoring } = useMonitoringData();
  const { data: stats } = useStats();
  const rtmp = monitoring?.services.rtmp ?? null;
  const streams =
    rtmp?.stats?.rtmp?.applications.flatMap((app) => app.streams) ?? [];
  const listeners = streams.reduce((sum, stream) => sum + stream.clients, 0);
  const bandwidth = streams.reduce((sum, stream) => sum + stream.bandwidth, 0);

  return (
    <section className="flex flex-col gap-4">
      <RtmpServiceCard stats={rtmp} />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatsCard
          title="Аптайм"
          value={monitoring ? formatDuration(monitoring.uptime) : '—'}
        />
        <StatsCard title="Слухачі" value={monitoring ? listeners : '—'} />
        <StatsCard
          title="Бітрейт"
          value={monitoring ? `${Math.round(bandwidth / 1000)} kb/s` : '—'}
        />
        <StatsCard
          title="Ефірний час"
          value={stats ? formatDuration(stats.totals.totalDuration) : '—'}
        />
      </div>
    </section>
  );
};
