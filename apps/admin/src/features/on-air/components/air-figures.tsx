import { Stat } from '@/features/admin/ui';
import { useMonitoringData, useStats } from '@/services/api/hooks';
import { formatDuration } from '@/utils/format-duration';
import { streamFigures } from '../lib/rtmp-status';

/**
 * Four figures on the ink, no tiles: the RTMP service with its lamp and
 * uptime, who is listening, how fast the stream flows, and how much music
 * the station holds.
 */
export const AirFigures = () => {
  const { data: monitoring } = useMonitoringData();
  const { data: stats } = useStats();
  const rtmp = monitoring?.services.rtmp ?? null;
  const { streams, listeners, bandwidth } = streamFigures(rtmp);
  const running = Boolean(rtmp?.isRunning);

  return (
    <section className="grid grid-cols-4 gap-6">
      <Stat
        label="RTMP"
        dot={running ? 'lit' : 'quiet'}
        value={monitoring ? (running ? 'працює' : 'зупинено') : '—'}
        note={monitoring ? `аптайм ${formatDuration(monitoring.uptime)}` : ' '}
      />
      <Stat
        label="Слухачі"
        value={monitoring ? listeners : '—'}
        note="зараз на хвилі"
      />
      <Stat
        label="Бітрейт"
        value={monitoring ? `${Math.round(bandwidth / 1000)} kb/s` : '—'}
        note={streams > 0 ? 'потік іде' : 'потоку немає'}
      />
      <Stat
        label="Ефірний час"
        value={stats ? formatDuration(stats.totals.totalDuration) : '—'}
        note="усієї колекції"
      />
    </section>
  );
};
