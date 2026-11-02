import { TabPills } from '@/features/admin/ui';
import { useState } from 'react';
import { JournalFeed } from './journal-feed';
import { MonitoringRows } from './monitoring-rows';
import { SettingsForm } from './settings-form';

const TABS = [
  { id: 'journal', label: 'Журнал' },
  { id: 'monitoring', label: 'Моніторинг' },
  { id: 'settings', label: 'Налаштування' },
];

/** The slab's three pages: the journal, the service, its configuration. */
export const OnAirSlab = () => {
  const [tab, setTab] = useState('journal');

  return (
    <div className="flex min-h-0 flex-col gap-6">
      <TabPills tabs={TABS} active={tab} onChange={setTab} />
      {tab === 'journal' && <JournalFeed />}
      {tab === 'monitoring' && <MonitoringRows />}
      {tab === 'settings' && <SettingsForm />}
    </div>
  );
};
