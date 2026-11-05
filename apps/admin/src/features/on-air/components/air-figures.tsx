import { useMonitoringData, useStats } from '@/services/api/hooks';
import { formatDuration } from '@/utils/format-duration';
import { StatusDot } from '@dendelion/func-ui';
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

  const figures: Array<{
    label: string;
    value: string | number;
    note: string;
    lamp?: 'warning' | 'neutral';
  }> = [
    {
      label: 'RTMP',
      lamp: running ? 'warning' : 'neutral',
      value: monitoring ? (running ? 'працює' : 'зупинено') : '—',
      note: monitoring ? `аптайм ${formatDuration(monitoring.uptime)}` : ' ',
    },
    {
      label: 'Слухачі',
      value: monitoring ? listeners : '—',
      note: 'зараз на хвилі',
    },
    {
      label: 'Бітрейт',
      value: monitoring ? `${Math.round(bandwidth / 1000)} kb/s` : '—',
      note: streams > 0 ? 'потік іде' : 'потоку немає',
    },
    {
      label: 'Ефірний час',
      value: stats ? formatDuration(stats.totals.totalDuration) : '—',
      note: 'усієї колекції',
    },
  ];

  return (
    <section className="grid grid-cols-4 gap-6">
      {figures.map((figure) => (
        <div key={figure.label} className="flex min-w-0 flex-col gap-2">
          <span className="type-label flex items-center gap-2 text-cream/60">
            {figure.lamp && <StatusDot variant={figure.lamp} />}
            {figure.label}
          </span>
          <span className="truncate font-serif text-[26px] font-semibold leading-none tabular-nums text-cream">
            {figure.value}
          </span>
          <span className="font-sans text-[11px] text-cream/60">
            {figure.note}
          </span>
        </div>
      ))}
    </section>
  );
};
