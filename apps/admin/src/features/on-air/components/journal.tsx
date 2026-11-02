import { VinylTabs } from '@/components';
import { useMonitoringData as useMonitoring } from '@/services/api/hooks';
import { sharedStyles } from '@/styles/shared-styles';
import clsx from 'clsx';
import { useState } from 'react';
import { LogsCard } from './panels/logs-card';
import { RtmpConfigCard } from './panels/rtmp-config-card';

const TABS = [
  { id: 'journal', label: 'Журнал' },
  { id: 'monitoring', label: 'Моніторинг' },
  { id: 'configuration', label: 'RTMP' },
];

export const Journal = () => {
  const [activeTab, setActiveTab] = useState('journal');

  return (
    <section className="flex min-h-0 flex-col gap-4">
      <VinylTabs tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} />
      {activeTab === 'journal' && <LogsCard />}
      {activeTab === 'monitoring' && <MonitoringPanel />}
      {activeTab === 'configuration' && <RtmpConfigCard />}
    </section>
  );
};

const MonitoringPanel = () => {
  const { data, isLoading, error } = useMonitoring();

  if (error) {
    return (
      <div className={clsx(sharedStyles.statsCard)}>
        <p className="text-accent">Error loading monitoring data</p>
      </div>
    );
  }

  if (isLoading || !data) {
    return (
      <div className={clsx(sharedStyles.statsCard)}>
        <p className="text-cream/70">Завантаження...</p>
      </div>
    );
  }

  const rtmp = data.services.rtmp;

  return (
    <div className={clsx(sharedStyles.statsCard, 'flex flex-col gap-2')}>
      <Row
        label="Services"
        value={rtmp?.isRunning ? '1/1 Active' : '0/1 Active'}
      />
      <Row label="Container" value={rtmp?.status ?? '—'} />
      <Row
        label="Last update"
        value={new Date(data.timestamp).toLocaleTimeString()}
      />
    </div>
  );
};

const Row = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-baseline justify-between gap-3">
    <span className="font-sans text-xs uppercase tracking-[0.14em] text-cream/45">
      {label}
    </span>
    <span className="font-sans text-sm tabular-nums text-cream">{value}</span>
  </div>
);
