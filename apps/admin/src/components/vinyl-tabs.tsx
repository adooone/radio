import clsx from 'clsx';
import type { FC } from 'react';
import { useState } from 'react';

export interface VinylTabItem {
  id: string;
  label: string;
}

export interface VinylTabsProps {
  tabs: VinylTabItem[];
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
  className?: string;
}

export const VinylTabs: FC<VinylTabsProps> = ({
  tabs,
  activeTab: controlledActiveTab,
  onTabChange,
  className,
}) => {
  const [internalActiveTab, setInternalActiveTab] = useState(
    controlledActiveTab || tabs[0]?.id,
  );

  const activeTab = controlledActiveTab ?? internalActiveTab;

  const handleTabClick = (tabId: string) => {
    if (!controlledActiveTab) {
      setInternalActiveTab(tabId);
    }
    onTabChange?.(tabId);
  };

  return (
    <div
      className={clsx(
        'bg-stone-900/90 backdrop-blur-xl border border-white/20 rounded-full px-2.5 py-2 sm:px-4 sm:py-3',
        'shadow-2xl',
        'flex items-center max-w-full w-fit',
        className,
      )}
    >
      <div className="flex items-center space-x-2 overflow-x-auto [scrollbar-width:none] sm:space-x-4 [&::-webkit-scrollbar]:hidden">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => handleTabClick(tab.id)}
            className={clsx(
              'flex flex-shrink-0 flex-col items-center transition-all duration-300',
              'px-2.5 py-1.5 border rounded-full font-small font-bold font-display text-xs uppercase sm:px-4 sm:py-2 sm:text-sm',
              activeTab === tab.id && [
                'bg-gradient-to-b from-sun/25 to-sun/15 text-sun backdrop-blur-sm',
                'shadow-xl border-sun/40',
              ],
              activeTab !== tab.id && [
                'text-gray-400 hover:text-gray-300 border-sun/0',
                'hover:bg-white/5',
              ],
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
};
