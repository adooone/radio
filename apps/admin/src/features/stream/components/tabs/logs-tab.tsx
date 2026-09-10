import type React from 'react';
import { LogsCard } from '../cards';
import { sharedStyles } from '@dendelion/mojo-ui/styles';
import clsx from 'clsx';

export const LogsTab: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className={clsx(sharedStyles.statsCard)}>
        <h2 className={clsx(sharedStyles.statsTitle, 'mb-2')}>System Logs</h2>
        <p className="text-amber-400/80 text-sm">
          Monitor real-time logs from all radio streaming services. Logs are
          automatically refreshed every 5 seconds.
        </p>
      </div>

      <LogsCard />
    </div>
  );
};
