import type { FC } from 'react';

interface ComponentItem {
  id: string;
  title: string;
}

interface ComponentGroup {
  category: string;
  items: ComponentItem[];
}

const componentGroups: ComponentGroup[] = [
  {
    category: 'Basic',
    items: [
      { id: 'button', title: 'Button' },
      { id: 'icon-button', title: 'IconButton' },
      { id: 'card', title: 'Card' },
    ],
  },
  {
    category: 'Form',
    items: [
      { id: 'input', title: 'Input' },
      { id: 'select', title: 'Select' },
      { id: 'textarea', title: 'Textarea' },
      { id: 'checkbox', title: 'Checkbox' },
      { id: 'switch', title: 'Switch' },
      { id: 'radio', title: 'Radio' },
      { id: 'slider', title: 'Slider' },
    ],
  },
  {
    category: 'Layout',
    items: [
      { id: 'panel', title: 'Panel' },
      { id: 'stats-grid', title: 'StatsGrid' },
    ],
  },
  {
    category: 'Navigation',
    items: [
      { id: 'tabs', title: 'Tabs' },
      { id: 'navigation-island', title: 'NavigationIsland' },
    ],
  },
  {
    category: 'Feedback',
    items: [
      { id: 'progress-bar', title: 'ProgressBar' },
      { id: 'circular-progress', title: 'CircularProgress' },
      { id: 'stats-card', title: 'StatsCard' },
      { id: 'status-indicator', title: 'StatusIndicator' },
      { id: 'skeleton', title: 'Skeleton' },
      { id: 'badge', title: 'Badge' },
      { id: 'alert', title: 'Alert' },
      { id: 'toast', title: 'Toast' },
    ],
  },
  {
    category: 'Overlay',
    items: [
      { id: 'modal', title: 'Modal' },
      { id: 'popup', title: 'Popup' },
      { id: 'tooltip', title: 'Tooltip' },
    ],
  },
  {
    category: 'Data Display',
    items: [{ id: 'data-table', title: 'DataTable' }],
  },
];

interface ComponentSidebarProps {
  activeSection: string;
  onNavigate: (id: string) => void;
}

export const ComponentSidebar: FC<ComponentSidebarProps> = ({
  activeSection,
  onNavigate,
}) => {
  return (
    <aside className="hidden lg:block w-64 shrink-0">
      <div className="sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-coal-fog scrollbar-track-transparent">
        <nav className="space-y-6">
          {componentGroups.map((group) => (
            <div key={group.category}>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-3">
                {group.category}
              </h3>
              <ul className="space-y-1">
                {group.items.map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => onNavigate(item.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                        activeSection === item.id
                          ? 'bg-moss-DEFAULT/20 text-moss-calm font-medium'
                          : 'text-gray-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      {item.title}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>
    </aside>
  );
};

export const componentIds = componentGroups.flatMap((g) =>
  g.items.map((i) => i.id),
);

export default ComponentSidebar;
