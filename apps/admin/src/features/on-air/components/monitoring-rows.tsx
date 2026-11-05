import { Dot, FeedRow } from '@/features/admin/ui';
import { useMonitoringData } from '@/services/api/hooks';
import {
  useRestartRtmpServer,
  useStartRtmpServer,
  useStopRtmpServer,
} from '@/services/api/hooks/use-stream-control';
import { Button } from '@dendelion/func-ui';
import clsx from 'clsx';
import { rtmpAlert, rtmpRows } from '../lib/rtmp-status';

const clock = (timestamp: string) =>
  new Date(timestamp).toLocaleTimeString('uk-UA', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

const Row = ({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) => (
  <div className="flex items-baseline justify-between gap-4 border-b border-cream/[0.08] py-2.5">
    <span className="type-label text-cream/45">{label}</span>
    <span
      className={clsx(
        'font-sans text-sm tabular-nums',
        highlight ? 'text-accent' : 'text-cream',
      )}
    >
      {value}
    </span>
  </div>
);

/** The RTMP service as rows, a line about it, and the three service actions. */
export const MonitoringRows = () => {
  const { data, isLoading, error } = useMonitoringData();
  const start = useStartRtmpServer();
  const stop = useStopRtmpServer();
  const restart = useRestartRtmpServer();

  if (error) {
    return <p className="type-body text-accent">Моніторинг недоступний.</p>;
  }
  if (isLoading || !data) {
    return <p className="type-body text-cream/45">Завантаження…</p>;
  }

  const rtmp = data.services.rtmp;
  const running = Boolean(rtmp?.isRunning);
  const busy = start.isPending || stop.isPending || restart.isPending;
  const alert = rtmpAlert(rtmp);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2.5">
        <Dot tone={running ? 'lit' : 'quiet'} />
        <span className="type-label text-cream/70">
          RTMP-сервер · {running ? 'працює' : 'зупинено'}
        </span>
      </div>

      <div className="flex flex-col">
        {rtmpRows(rtmp).map((row) => (
          <Row key={row.label} {...row} />
        ))}
        <Row label="Оновлено" value={clock(data.timestamp)} />
      </div>

      {alert && (
        <FeedRow time="" tone={alert.tone}>
          {alert.message}
        </FeedRow>
      )}

      <div className="flex flex-wrap gap-3">
        {running ? (
          <Button
            variant="danger"
            size="sm"
            disabled={busy}
            onClick={() => stop.mutate()}
          >
            Зупинити
          </Button>
        ) : (
          <Button
            variant="lit"
            size="sm"
            disabled={busy}
            onClick={() => start.mutate()}
          >
            Запустити
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          disabled={busy}
          onClick={() => restart.mutate()}
        >
          Перезапустити
        </Button>
      </div>
    </div>
  );
};
