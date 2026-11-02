import clsx from 'clsx';
import { Pill } from './pill';

export type TabItem = { id: string; label: string };

type TabPillsProps = {
  tabs: TabItem[];
  active: string;
  onChange: (id: string) => void;
  className?: string;
};

/** A row of pills, the open one lit, the others quiet — the mockups' tabs. */
export const TabPills = ({ tabs, active, onChange, className }: TabPillsProps) => (
  <div className={clsx('flex items-center gap-2', className)}>
    {tabs.map((tab) => {
      const open = tab.id === active;
      return (
        <Pill
          key={tab.id}
          size="sm"
          tone={open ? 'lit' : 'quiet'}
          aria-pressed={open}
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
        </Pill>
      );
    })}
  </div>
);
