import type React from 'react';
import clsx from 'clsx';
import { sharedStyles } from '@dendelion/mojo-ui/styles';
import { TelegramConfigCard, RtmpConfigCard } from '../cards';

export const ConfigurationTab: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Stream Configuration */}
      <div className={clsx(sharedStyles.serviceSection)}>
        <h2 className={clsx(sharedStyles.serviceSectionTitle)}>
          Stream Configuration
        </h2>
        <div className={clsx(sharedStyles.serviceGrid)}>
          <TelegramConfigCard />
          <RtmpConfigCard />
        </div>
      </div>
    </div>
  );
};
