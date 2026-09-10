import { useState } from 'react';
import type { FC } from 'react';
import { Button } from '../../components/button';
import { Card } from '../../components/card';
import { Checkbox } from '../../components/checkbox';
import { Input } from '../../components/input';
import { StatsGrid } from '../../components/layout';
import { Panel } from '../../components/panel';
import { ProgressBar } from '../../components/progress-bar';
import { Select } from '../../components/select';
import { StatsCard } from '../../components/stats-card';
import { StatusIndicator } from '../../components/status-indicator';
import { Switch } from '../../components/switch';
import { Tabs } from '../../components/tabs';
import { CodeBlock } from '../components/code-block';
import { Footer } from '../components/footer';

const DashboardExample: FC = () => {
  return (
    <div className="space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatsCard title="Total Users" value={2543} />
        <StatsCard title="Active Now" value={182} isHighlight />
        <StatsCard title="CPU Usage" value={45.2} />
        <StatsCard title="Memory" value={78.9} isHighlight />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card
            title="System Performance"
            actions={<Button variant="green" size="small" title="Refresh" />}
          >
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-400">CPU Load</span>
                  <span className="text-sm text-moss-calm">45%</span>
                </div>
                <ProgressBar variant="green" value={45} lampCount={20} />
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-400">Memory Usage</span>
                  <span className="text-sm text-ember-calm">78%</span>
                </div>
                <ProgressBar variant="red" value={78} lampCount={20} />
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-400">Disk I/O</span>
                  <span className="text-sm text-sun-calm">32%</span>
                </div>
                <ProgressBar variant="yellow" value={32} lampCount={20} />
              </div>
            </div>
          </Card>
        </div>

        <div>
          <Card title="Service Status">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300">API Server</span>
                <StatusIndicator status="running" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300">Database</span>
                <StatusIndicator status="running" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300">Cache</span>
                <StatusIndicator status="initializing" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300">Worker</span>
                <StatusIndicator status="stopped" />
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

const FormExample: FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'user',
    notifications: true,
    marketing: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Form submitted! Check console for data.');
    console.log('Form data:', formData);
  };

  return (
    <Card
      title="Create User"
      actions={<Button variant="green" title="Save" onClick={handleSubmit} />}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Full Name"
            placeholder="John Doe"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <Input
            label="Email"
            type="email"
            placeholder="john@example.com"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
          />
        </div>

        <Select
          label="Role"
          value={formData.role}
          onChange={(e) => setFormData({ ...formData, role: e.target.value })}
          options={[
            { value: 'admin', label: 'Administrator' },
            { value: 'user', label: 'Standard User' },
            { value: 'guest', label: 'Guest' },
          ]}
        />

        <div className="pt-4 border-t border-white/10">
          <h4 className="text-sm font-medium text-gray-400 mb-3">
            Preferences
          </h4>
          <div className="space-y-3">
            <Checkbox
              checked={formData.notifications}
              onChange={(e) =>
                setFormData({ ...formData, notifications: e.target.checked })
              }
              label="Enable email notifications"
            />
            <Checkbox
              checked={formData.marketing}
              onChange={(e) =>
                setFormData({ ...formData, marketing: e.target.checked })
              }
              label="Receive marketing emails"
            />
          </div>
        </div>
      </form>
    </Card>
  );
};

const SettingsExample: FC = () => {
  const [settings, setSettings] = useState({
    darkMode: true,
    autoSave: true,
    analytics: false,
    betaFeatures: false,
  });

  return (
    <Panel
      title="Application Settings"
      subtitle="Customize your experience"
      maxColumns={2}
      sections={[
        {
          title: 'Appearance',
          content: (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-200">Dark Mode</p>
                  <p className="text-xs text-gray-500">
                    Use dark theme throughout the app
                  </p>
                </div>
                <Switch
                  variant="green"
                  checked={settings.darkMode}
                  onChange={(checked) =>
                    setSettings({ ...settings, darkMode: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-200">
                    Compact View
                  </p>
                  <p className="text-xs text-gray-500">
                    Reduce spacing in lists
                  </p>
                </div>
                <Switch variant="yellow" checked={false} onChange={() => {}} />
              </div>
            </div>
          ),
        },
        {
          title: 'Behavior',
          content: (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-200">Auto-save</p>
                  <p className="text-xs text-gray-500">
                    Automatically save changes
                  </p>
                </div>
                <Switch
                  variant="green"
                  checked={settings.autoSave}
                  onChange={(checked) =>
                    setSettings({ ...settings, autoSave: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-200">Analytics</p>
                  <p className="text-xs text-gray-500">
                    Share usage statistics
                  </p>
                </div>
                <Switch
                  variant="gray"
                  checked={settings.analytics}
                  onChange={(checked) =>
                    setSettings({ ...settings, analytics: checked })
                  }
                />
              </div>
            </div>
          ),
        },
        {
          title: 'Advanced',
          content: (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-200">
                    Beta Features
                  </p>
                  <p className="text-xs text-gray-500">
                    Enable experimental features
                  </p>
                </div>
                <Switch
                  variant="red"
                  checked={settings.betaFeatures}
                  onChange={(checked) =>
                    setSettings({ ...settings, betaFeatures: checked })
                  }
                />
              </div>
              <div className="pt-2">
                <Button variant="red" size="small" title="Reset All Settings" />
              </div>
            </div>
          ),
        },
      ]}
    />
  );
};

const CardGridExample: FC = () => {
  const items = [
    { id: 1, title: 'Project Alpha', status: 'running', progress: 75 },
    { id: 2, title: 'Project Beta', status: 'initializing', progress: 30 },
    { id: 3, title: 'Project Gamma', status: 'stopped', progress: 0 },
    { id: 4, title: 'Project Delta', status: 'running', progress: 90 },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {items.map((item) => (
        <Card
          key={item.id}
          title={item.title}
          footer={
            <div className="flex items-center justify-between w-full">
              <StatusIndicator
                status={item.status as 'running' | 'stopped' | 'initializing'}
              />
              <span className="text-xs text-gray-500">{item.progress}%</span>
            </div>
          }
        >
          <div className="space-y-3">
            <StatsGrid
              columns={2}
              stats={[
                { label: 'Tasks', value: 24 },
                { label: 'Completed', value: 18 },
              ]}
            />
            <ProgressBar
              variant={
                item.progress > 70
                  ? 'green'
                  : item.progress > 30
                    ? 'yellow'
                    : 'red'
              }
              value={item.progress}
              lampCount={10}
            />
          </div>
        </Card>
      ))}
    </div>
  );
};

const NavigationExample: FC = () => {
  const [activeTab] = useState('overview');

  const tabs = [
    {
      id: 'overview',
      label: 'Overview',
      content: (
        <div className="py-4">
          <StatsGrid
            columns={3}
            stats={[
              { label: 'Views', value: 12453 },
              { label: 'Clicks', value: 832 },
              { label: 'Conversions', value: 124 },
            ]}
          />
        </div>
      ),
    },
    {
      id: 'analytics',
      label: 'Analytics',
      content: (
        <div className="py-4 space-y-4">
          <ProgressBar
            variant="green"
            value={85}
            label="Traffic"
            lampCount={15}
          />
          <ProgressBar
            variant="yellow"
            value={62}
            label="Engagement"
            lampCount={15}
          />
          <ProgressBar
            variant="red"
            value={38}
            label="Bounce Rate"
            lampCount={15}
          />
        </div>
      ),
    },
    {
      id: 'settings',
      label: 'Settings',
      content: (
        <div className="py-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-300">Real-time updates</span>
            <Switch variant="green" checked={true} onChange={() => {}} />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-300">Email reports</span>
            <Switch variant="gray" checked={false} onChange={() => {}} />
          </div>
        </div>
      ),
    },
  ];

  return (
    <Card title="Dashboard Tabs">
      <Tabs variant="green" tabs={tabs} defaultTab={activeTab} />
    </Card>
  );
};

export const LayoutPage: FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-8 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-white mb-4">Layout Examples</h1>
        <p className="text-gray-400 text-lg">
          Real-world layout patterns demonstrating how Mojo UI components work
          together to create functional interfaces.
        </p>
      </div>

      <div className="space-y-16">
        {/* Dashboard Layout */}
        <section>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white mb-2">
              Dashboard Layout
            </h2>
            <p className="text-gray-400">
              A typical admin dashboard with stats cards, performance metrics,
              and service status.
            </p>
          </div>
          <div className="p-6 rounded-xl bg-coal-deep border border-white/10 mb-6">
            <DashboardExample />
          </div>
          <CodeBlock
            filename="dashboard.tsx"
            code={`// Dashboard with StatsGrid, Cards, ProgressBars
<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
  <StatsCard title="Total Users" value={2543} />
  <StatsCard title="Active Now" value={182} isHighlight />
  // ...
</div>`}
          />
        </section>

        {/* Form Layout */}
        <section>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white mb-2">Form Layout</h2>
            <p className="text-gray-400">
              User creation form with validation-ready inputs and preference
              toggles.
            </p>
          </div>
          <div className="max-w-2xl p-6 rounded-xl bg-coal-deep border border-white/10 mb-6">
            <FormExample />
          </div>
          <CodeBlock
            filename="form.tsx"
            code={`// Form with Inputs, Select, Checkboxes
<Card title="Create User" actions={<Button title="Save" />}>
  <div className="grid grid-cols-2 gap-4">
    <Input label="Name" value={name} onChange={...} />
    <Input label="Email" type="email" value={email} onChange={...} />
  </div>
  <Select label="Role" options={[...]} />
</Card>`}
          />
        </section>

        {/* Settings Panel */}
        <section>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white mb-2">
              Settings Panel
            </h2>
            <p className="text-gray-400">
              Multi-section settings interface using the Panel component with
              switches.
            </p>
          </div>
          <div className="p-6 rounded-xl bg-coal-deep border border-white/10 mb-6">
            <SettingsExample />
          </div>
          <CodeBlock
            filename="settings.tsx"
            code={`// Settings with Panel and Switches
<Panel
  title="Application Settings"
  sections={[
    { title: 'Appearance', content: <Switch ... /> },
    { title: 'Behavior', content: <Switch ... /> },
  ]}
/>`}
          />
        </section>

        {/* Card Grid */}
        <section>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white mb-2">
              Project Cards Grid
            </h2>
            <p className="text-gray-400">
              A responsive grid of project cards with progress indicators and
              status badges.
            </p>
          </div>
          <div className="p-6 rounded-xl bg-coal-deep border border-white/10 mb-6">
            <CardGridExample />
          </div>
          <CodeBlock
            filename="card-grid.tsx"
            code={`// Responsive card grid
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  {projects.map(project => (
    <Card 
      key={project.id}
      title={project.title}
      footer={<StatusIndicator status={project.status} />}
    >
      <ProgressBar value={project.progress} />
    </Card>
  ))}
</div>`}
          />
        </section>

        {/* Tabbed Navigation */}
        <section>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white mb-2">
              Tabbed Content
            </h2>
            <p className="text-gray-400">
              Content organization using tabs with different content types.
            </p>
          </div>
          <div className="max-w-2xl p-6 rounded-xl bg-coal-deep border border-white/10 mb-6">
            <NavigationExample />
          </div>
          <CodeBlock
            filename="tabs.tsx"
            code={`// Tabbed interface
<Tabs 
  variant="green"
  tabs={[
    { id: 'overview', label: 'Overview', content: <StatsGrid ... /> },
    { id: 'analytics', label: 'Analytics', content: <ProgressBar ... /> },
  ]}
/>`}
          />
        </section>
      </div>

      <Footer />
    </div>
  );
};

export default LayoutPage;
