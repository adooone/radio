import clsx from 'clsx';
import { PageLayout, VinylTabs } from '@dendelion/mojo-ui';
import { sharedStyles } from '@dendelion/mojo-ui/styles';
import { useMonitoringData } from '@/services/api/hooks';
import { useWebSocket } from '@/hooks/use-websocket';
import { MonitoringTab, ConfigurationTab, LogsTab } from './components';
import { useState } from 'react';

export const StreamControlPage = () => {
  const { data: monitoring, isLoading, error } = useMonitoringData();
  const [activeTab, setActiveTab] = useState<
    'monitoring' | 'logs' | 'configuration'
  >('monitoring');

  useWebSocket({ autoConnect: true });

  const tabs = [
    { id: 'monitoring', label: 'Monitoring' },
    { id: 'logs', label: 'Logs' },
    { id: 'configuration', label: 'Configuration' },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'monitoring':
        return <MonitoringTab monitoring={monitoring} isLoading={isLoading} />;
      case 'logs':
        return <LogsTab />;
      case 'configuration':
        return <ConfigurationTab />;
      default:
        return null;
    }
  };

  if (error) {
    return (
      <PageLayout
        title="Stream Control"
        headerRight={
          <VinylTabs
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={(tabId) =>
              setActiveTab(tabId as 'monitoring' | 'logs' | 'configuration')
            }
          />
        }
      >
        <div className={clsx(sharedStyles.statsCard)}>
          <p className="text-red-400">Error loading monitoring data</p>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title="Stream Control"
      headerRight={
        <VinylTabs
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={(tabId) =>
            setActiveTab(tabId as 'monitoring' | 'logs' | 'configuration')
          }
        />
      }
    >
      <div className="w-full">{renderTabContent()}</div>
    </PageLayout>
  );
};
