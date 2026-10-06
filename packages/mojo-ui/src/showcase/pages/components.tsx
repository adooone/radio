import { useEffect, useMemo, useState } from 'react';
import type { FC } from 'react';
import { Alert } from '../../components/alert';
import { Badge } from '../../components/badge';
import { Button } from '../../components/button';
import { Card } from '../../components/card';
import { Checkbox } from '../../components/checkbox';
import { CircularProgress } from '../../components/circular-progress';
import { DataTable } from '../../components/data-table';
import type { DataTableColumn } from '../../components/data-table';
import { IconButton } from '../../components/icon-button';
import { Input } from '../../components/input';
import { StatsGrid } from '../../components/layout';
import { Modal } from '../../components/modal';
import { Panel } from '../../components/panel';
import { Popup, PopupItem } from '../../components/popup';
import { ProgressBar } from '../../components/progress-bar';
import { Radio } from '../../components/radio';
import { Select } from '../../components/select';
import { Skeleton } from '../../components/skeleton';
import { Slider } from '../../components/slider';
import { StatsCard } from '../../components/stats-card';
import { StatusIndicator } from '../../components/status-indicator';
import { Switch } from '../../components/switch';
import { Tabs } from '../../components/tabs';
import { Textarea } from '../../components/textarea';
import { ToastContainer, generateToastId } from '../../components/toast';
import type { ToastProps } from '../../components/toast';
import { Tooltip } from '../../components/tooltip';
import { CheckIcon, PlusIcon } from '../../icons';
import { ComponentSection } from '../components/component-section';
import {
  ComponentSidebar,
  componentIds,
} from '../components/component-sidebar';
import { Footer } from '../components/footer';
import type { PropDef } from '../components/prop-table';

// Common props definitions
const variantProp: PropDef = {
  name: 'variant',
  type: "'green' | 'yellow' | 'gray' | 'red'",
  default: "'green'",
  description: 'Visual style variant',
};

const sizeProp: PropDef = {
  name: 'size',
  type: "'small' | 'medium' | 'large'",
  default: "'medium'",
  description: 'Component size',
};

const disabledProp: PropDef = {
  name: 'disabled',
  type: 'boolean',
  default: 'false',
  description: 'Disable interactions',
};

export const ComponentsPage: FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [switchState, setSwitchState] = useState(true);
  const [checkboxState, setCheckboxState] = useState(true);
  const [inputValue, setInputValue] = useState('');
  const [selectValue, setSelectValue] = useState('option1');
  const [activeSection, setActiveSection] = useState('button');
  const [radioValue, setRadioValue] = useState('option1');
  const [sliderValue, setSliderValue] = useState(50);
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const selectOptions = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3' },
  ];

  const radioOptions = [
    { value: 'option1', label: 'Standard' },
    { value: 'option2', label: 'Premium' },
    { value: 'option3', label: 'Enterprise' },
  ];

  // Sample data for DataTable
  interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    status: 'active' | 'inactive';
  }

  const tableData: User[] = useMemo(
    () => [
      {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'Admin',
        status: 'active',
      },
      {
        id: '2',
        name: 'Jane Smith',
        email: 'jane@example.com',
        role: 'User',
        status: 'active',
      },
      {
        id: '3',
        name: 'Bob Wilson',
        email: 'bob@example.com',
        role: 'Editor',
        status: 'inactive',
      },
      {
        id: '4',
        name: 'Alice Brown',
        email: 'alice@example.com',
        role: 'User',
        status: 'active',
      },
    ],
    [],
  );

  const tableColumns: DataTableColumn<User>[] = useMemo(
    () => [
      { key: 'name', header: 'Name', cell: (row) => row.name },
      { key: 'email', header: 'Email', cell: (row) => row.email },
      {
        key: 'role',
        header: 'Role',
        cell: (row) => <Badge variant="default">{row.role}</Badge>,
      },
      {
        key: 'status',
        header: 'Status',
        cell: (row) => (
          <Badge variant={row.status === 'active' ? 'success' : 'default'}>
            {row.status}
          </Badge>
        ),
      },
    ],
    [],
  );

  const addToast = (
    variant: 'info' | 'success' | 'warning' | 'error',
    title: string,
    message: string,
  ) => {
    const newToast: ToastProps = {
      id: generateToastId(),
      variant,
      title,
      message,
      duration: 5000,
    };
    setToasts((prev) => [...prev, newToast]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Intersection Observer for active section detection
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        }
      },
      {
        rootMargin: '-20% 0px -60% 0px',
        threshold: 0,
      },
    );

    for (const id of componentIds) {
      const element = document.getElementById(id);
      if (element) {
        observer.observe(element);
      }
    }

    return () => observer.disconnect();
  }, []);

  const handleNavigate = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-white mb-4">
          Components Gallery
        </h1>
        <p className="text-gray-400 text-lg">
          A comprehensive collection of 21+ retro-styled UI components with 3D
          depth, elegant gradients, and glowing effects.
        </p>
      </div>

      <div className="flex gap-8">
        {/* Sidebar */}
        <ComponentSidebar
          activeSection={activeSection}
          onNavigate={handleNavigate}
        />

        {/* Main Content */}
        <div className="flex-1 min-w-0 space-y-16">
          {/* Basic Components */}
          <ComponentSection
            id="button"
            title="Button"
            description="Interactive button component with multiple variants and sizes."
            category="basic"
            codeExample={`import { Button } from '@radio/mojo-ui';

<Button variant="green" size="medium" title="Click me" onClick={handleClick} />
<Button variant="red" size="small" title="Danger" />
<Button variant="yellow" size="large" title="Warning" disabled />`}
            props={[
              {
                name: 'variant',
                type: "'green' | 'yellow' | 'gray' | 'red'",
                default: "'green'",
                description: 'Visual style variant',
              },
              {
                name: 'size',
                type: "'small' | 'medium' | 'large'",
                default: "'medium'",
                description: 'Button size',
              },
              {
                name: 'title',
                type: 'string',
                required: true,
                description: 'Button text',
              },
              {
                name: 'onClick',
                type: '() => void',
                description: 'Click handler',
              },
              disabledProp,
            ]}
          >
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="green" title="Primary" />
              <Button variant="yellow" title="Warning" />
              <Button variant="red" title="Danger" />
              <Button variant="gray" title="Neutral" />
              <Button variant="green" title="Disabled" disabled />
            </div>
          </ComponentSection>

          <ComponentSection
            id="icon-button"
            title="IconButton"
            description="Circular button designed for icon content."
            category="basic"
            codeExample={`import { IconButton } from '@radio/mojo-ui';
import { PlusIcon } from '@radio/mojo-ui/icons';

<IconButton variant="green" size="medium">
  <PlusIcon />
</IconButton>`}
            props={[
              variantProp,
              sizeProp,
              {
                name: 'children',
                type: 'ReactNode',
                required: true,
                description: 'Icon content',
              },
              disabledProp,
            ]}
          >
            <div className="flex items-center gap-3">
              <IconButton variant="green">
                <PlusIcon />
              </IconButton>
              <IconButton variant="yellow">
                <CheckIcon />
              </IconButton>
              <IconButton variant="red">
                <PlusIcon />
              </IconButton>
              <IconButton variant="gray">
                <PlusIcon />
              </IconButton>
            </div>
          </ComponentSection>

          <ComponentSection
            id="card"
            title="Card"
            description="Container component with subtle borders and optional actions."
            category="layout"
            codeExample={`import { Card } from '@radio/mojo-ui';

<Card 
  title="Card Title"
  actions={<Button variant="green" title="Action" />}
  footer={<span>Footer content</span>}
>
  <p>Card content goes here</p>
</Card>`}
            props={[
              {
                name: 'title',
                type: 'string',
                description: 'Card header title',
              },
              {
                name: 'children',
                type: 'ReactNode',
                required: true,
                description: 'Card content',
              },
              {
                name: 'actions',
                type: 'ReactNode',
                description: 'Action buttons in header',
              },
              {
                name: 'footer',
                type: 'ReactNode',
                description: 'Footer content',
              },
            ]}
          >
            <Card
              title="Example Card"
              actions={<Button variant="green" size="small" title="Action" />}
            >
              <p className="text-gray-300">
                This is a card with header actions and content.
              </p>
            </Card>
          </ComponentSection>

          {/* Form Components */}
          <ComponentSection
            id="input"
            title="Input"
            description="Text input field with label support and multiple sizes."
            category="form"
            codeExample={`import { Input } from '@radio/mojo-ui';

<Input 
  size="medium"
  label="Email"
  placeholder="Enter your email"
  value={value}
  onChange={(e) => setValue(e.target.value)}
/>`}
            props={[
              sizeProp,
              { name: 'label', type: 'string', description: 'Input label' },
              {
                name: 'placeholder',
                type: 'string',
                description: 'Placeholder text',
              },
              { name: 'value', type: 'string', description: 'Input value' },
              {
                name: 'onChange',
                type: '(e: ChangeEvent) => void',
                description: 'Change handler',
              },
              disabledProp,
            ]}
          >
            <div className="w-full max-w-sm space-y-4">
              <Input
                size="medium"
                label="Username"
                placeholder="Enter username"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
              <Input size="small" placeholder="Small input" />
              <Input size="large" placeholder="Large input" />
            </div>
          </ComponentSection>

          <ComponentSection
            id="select"
            title="Select"
            description="Dropdown select component with custom styling."
            category="form"
            codeExample={`import { Select } from '@radio/mojo-ui';

<Select
  label="Choose option"
  value={selectedValue}
  onChange={(e) => setSelectedValue(e.target.value)}
  options={[
    { value: '1', label: 'Option 1' },
    { value: '2', label: 'Option 2' },
  ]}
/>`}
            props={[
              { name: 'label', type: 'string', description: 'Select label' },
              {
                name: 'value',
                type: 'string',
                required: true,
                description: 'Selected value',
              },
              {
                name: 'options',
                type: 'SelectOption[]',
                required: true,
                description: 'Option list',
              },
              {
                name: 'onChange',
                type: '(e: ChangeEvent) => void',
                description: 'Change handler',
              },
            ]}
          >
            <div className="w-full max-w-sm">
              <Select
                label="Select an option"
                value={selectValue}
                onChange={(e) => setSelectValue(e.target.value)}
                options={selectOptions}
              />
            </div>
          </ComponentSection>

          <ComponentSection
            id="textarea"
            title="Textarea"
            description="Multi-line text input with auto-resize support."
            category="form"
            codeExample={`import { Textarea } from '@radio/mojo-ui';

<Textarea
  label="Description"
  placeholder="Enter description..."
  rows={4}
  resize="vertical"
/>`}
            props={[
              { name: 'label', type: 'string', description: 'Textarea label' },
              {
                name: 'placeholder',
                type: 'string',
                description: 'Placeholder text',
              },
              {
                name: 'rows',
                type: 'number',
                default: '3',
                description: 'Number of rows',
              },
              {
                name: 'resize',
                type: "'none' | 'vertical' | 'horizontal' | 'both'",
                default: "'vertical'",
                description: 'Resize behavior',
              },
            ]}
          >
            <div className="w-full max-w-sm">
              <Textarea
                label="Comments"
                placeholder="Enter your comments..."
                rows={3}
              />
            </div>
          </ComponentSection>

          <ComponentSection
            id="checkbox"
            title="Checkbox"
            description="Toggle checkbox with label support."
            category="form"
            codeExample={`import { Checkbox } from '@radio/mojo-ui';

<Checkbox
  checked={isChecked}
  onChange={(e) => setIsChecked(e.target.checked)}
  label="Enable notifications"
/>`}
            props={[
              {
                name: 'checked',
                type: 'boolean',
                required: true,
                description: 'Checked state',
              },
              {
                name: 'onChange',
                type: '(e: ChangeEvent) => void',
                required: true,
                description: 'Change handler',
              },
              { name: 'label', type: 'string', description: 'Checkbox label' },
              disabledProp,
            ]}
          >
            <div className="space-y-3">
              <Checkbox
                checked={checkboxState}
                onChange={(e) => setCheckboxState(e.target.checked)}
                label="Enable feature"
              />
              <Checkbox
                checked={false}
                onChange={() => {}}
                label="Disabled option"
                disabled
              />
            </div>
          </ComponentSection>

          <ComponentSection
            id="switch"
            title="Switch"
            description="Toggle switch with multiple color variants."
            category="form"
            codeExample={`import { Switch } from '@radio/mojo-ui';

<Switch
  variant="green"
  size="medium"
  checked={isOn}
  onChange={setIsOn}
/>`}
            props={[
              variantProp,
              sizeProp,
              {
                name: 'checked',
                type: 'boolean',
                required: true,
                description: 'Switch state',
              },
              {
                name: 'onChange',
                type: '(checked: boolean) => void',
                required: true,
                description: 'Change handler',
              },
              disabledProp,
            ]}
          >
            <div className="flex items-center gap-4">
              <Switch
                variant="green"
                checked={switchState}
                onChange={setSwitchState}
              />
              <Switch
                variant="yellow"
                checked={switchState}
                onChange={setSwitchState}
              />
              <Switch
                variant="red"
                checked={switchState}
                onChange={setSwitchState}
              />
              <Switch variant="gray" checked={false} onChange={() => {}} />
            </div>
          </ComponentSection>

          {/* Layout Components */}
          <ComponentSection
            id="panel"
            title="Panel"
            description="Multi-section container with retro panel styling."
            category="layout"
            codeExample={`import { Panel } from '@radio/mojo-ui';

<Panel
  title="Control Panel"
  subtitle="System settings"
  maxColumns={2}
  sections={[
    { title: 'Section 1', content: <div>Content</div> },
    { title: 'Section 2', content: <div>Content</div> },
  ]}
/>`}
            props={[
              {
                name: 'title',
                type: 'string',
                required: true,
                description: 'Panel title',
              },
              {
                name: 'subtitle',
                type: 'string',
                description: 'Panel subtitle',
              },
              {
                name: 'sections',
                type: 'PanelSection[]',
                required: true,
                description: 'Panel sections',
              },
              {
                name: 'maxColumns',
                type: 'number',
                default: '2',
                description: 'Max columns for grid',
              },
            ]}
          >
            <div className="w-full">
              <Panel
                title="Demo Panel"
                subtitle="Example panel content"
                maxColumns={2}
                sections={[
                  {
                    title: 'Section A',
                    content: (
                      <p className="text-gray-300 text-sm">
                        First section content
                      </p>
                    ),
                  },
                  {
                    title: 'Section B',
                    content: (
                      <p className="text-gray-300 text-sm">
                        Second section content
                      </p>
                    ),
                  },
                ]}
              />
            </div>
          </ComponentSection>

          <ComponentSection
            id="stats-grid"
            title="StatsGrid"
            description="Grid layout for displaying statistics."
            category="layout"
            codeExample={`import { StatsGrid } from '@radio/mojo-ui';

<StatsGrid
  columns={2}
  stats={[
    { label: 'CPU', value: 45, suffix: '%' },
    { label: 'Memory', value: 2048, suffix: 'MB' },
  ]}
/>`}
            props={[
              {
                name: 'stats',
                type: 'StatItem[]',
                required: true,
                description: 'Statistics to display',
              },
              {
                name: 'columns',
                type: 'number',
                default: '2',
                description: 'Number of columns',
              },
            ]}
          >
            <div className="w-full max-w-md">
              <StatsGrid
                columns={2}
                stats={[
                  { label: 'Users', value: 2543 },
                  { label: 'CPU', value: 45, suffix: '%' },
                  { label: 'Memory', value: 78, suffix: '%' },
                  { label: 'Errors', value: 12, highlight: true },
                ]}
              />
            </div>
          </ComponentSection>

          {/* Navigation Components */}
          <ComponentSection
            id="tabs"
            title="Tabs"
            description="Tab navigation with animated content switching."
            category="navigation"
            codeExample={`import { Tabs } from '@radio/mojo-ui';

<Tabs
  variant="green"
  tabs={[
    { id: '1', label: 'Tab 1', content: <div>Content 1</div> },
    { id: '2', label: 'Tab 2', content: <div>Content 2</div> },
  ]}
/>`}
            props={[
              variantProp,
              {
                name: 'tabs',
                type: 'TabItem[]',
                required: true,
                description: 'Tab definitions',
              },
              {
                name: 'defaultTab',
                type: 'string',
                description: 'Default active tab',
              },
            ]}
          >
            <div className="w-full max-w-md">
              <Tabs
                variant="green"
                tabs={[
                  {
                    id: '1',
                    label: 'Overview',
                    content: (
                      <p className="text-gray-300 text-sm py-2">
                        Overview content
                      </p>
                    ),
                  },
                  {
                    id: '2',
                    label: 'Details',
                    content: (
                      <p className="text-gray-300 text-sm py-2">
                        Details content
                      </p>
                    ),
                  },
                  {
                    id: '3',
                    label: 'Settings',
                    content: (
                      <p className="text-gray-300 text-sm py-2">
                        Settings content
                      </p>
                    ),
                  },
                ]}
              />
            </div>
          </ComponentSection>

          <ComponentSection
            id="navigation-island"
            title="NavigationIsland"
            description="Floating navigation bar with pill-style tabs."
            category="navigation"
            codeExample={`import { NavigationIsland } from '@radio/mojo-ui';

<NavigationIsland
  items={[
    { path: '/', label: 'Home', icon: <HomeIcon /> },
    { path: '/settings', label: 'Settings', icon: <SettingsIcon /> },
  ]}
  currentPath="/"
/>`}
            props={[
              {
                name: 'items',
                type: 'NavigationItem[]',
                required: true,
                description: 'Navigation items',
              },
              {
                name: 'currentPath',
                type: 'string',
                required: true,
                description: 'Current active path',
              },
              { name: 'logo', type: 'ReactNode', description: 'Logo element' },
              {
                name: 'actions',
                type: 'ReactNode',
                description: 'Action elements',
              },
            ]}
          >
            <div className="p-4 bg-coal-deep/50 rounded-xl">
              <p className="text-sm text-gray-400 text-center">
                NavigationIsland is used in the showcase header above. It
                provides a floating navigation bar with glassmorphism effects.
              </p>
            </div>
          </ComponentSection>

          {/* Feedback Components */}
          <ComponentSection
            id="progress-bar"
            title="ProgressBar"
            description="Segmented progress bar with lamp-style indicators."
            category="feedback"
            codeExample={`import { ProgressBar } from '@radio/mojo-ui';

<ProgressBar
  variant="green"
  value={75}
  lampCount={10}
  label="Progress"
/>`}
            props={[
              variantProp,
              {
                name: 'value',
                type: 'number',
                required: true,
                description: 'Progress value (0-100)',
              },
              {
                name: 'lampCount',
                type: 'number',
                default: '10',
                description: 'Number of lamp segments',
              },
              { name: 'label', type: 'string', description: 'Progress label' },
            ]}
          >
            <div className="w-full max-w-md space-y-4">
              <ProgressBar
                variant="green"
                value={75}
                lampCount={10}
                label="Loading"
              />
              <ProgressBar variant="yellow" value={50} lampCount={8} />
              <ProgressBar variant="red" value={25} lampCount={6} />
            </div>
          </ComponentSection>

          <ComponentSection
            id="circular-progress"
            title="CircularProgress"
            description="Circular progress indicator with percentage display."
            category="feedback"
            codeExample={`import { CircularProgress } from '@radio/mojo-ui';

<CircularProgress
  percentage={65}
  size={80}
  strokeWidth={6}
  showLabel
/>`}
            props={[
              {
                name: 'percentage',
                type: 'number',
                required: true,
                description: 'Progress value (0-100)',
              },
              {
                name: 'size',
                type: 'number',
                default: '120',
                description: 'Circle size',
              },
              {
                name: 'strokeWidth',
                type: 'number',
                default: '8',
                description: 'Stroke width',
              },
              {
                name: 'color',
                type: 'string',
                default: "'#47f57d'",
                description: 'Progress color',
              },
              {
                name: 'showLabel',
                type: 'boolean',
                default: 'true',
                description: 'Show percentage text',
              },
            ]}
          >
            <div className="flex items-center gap-6">
              <CircularProgress percentage={75} size={80} strokeWidth={6} />
              <CircularProgress percentage={45} size={60} strokeWidth={4} />
              <CircularProgress
                percentage={90}
                size={50}
                strokeWidth={3}
                showLabel={false}
              />
            </div>
          </ComponentSection>

          <ComponentSection
            id="stats-card"
            title="StatsCard"
            description="Compact card for displaying a single statistic."
            category="feedback"
            codeExample={`import { StatsCard } from '@radio/mojo-ui';

<StatsCard
  title="Active Users"
  value={2543}
  isHighlight
/>`}
            props={[
              {
                name: 'title',
                type: 'string',
                required: true,
                description: 'Statistic title',
              },
              {
                name: 'value',
                type: 'string | number',
                required: true,
                description: 'Statistic value',
              },
              {
                name: 'isHighlight',
                type: 'boolean',
                default: 'false',
                description: 'Highlight styling',
              },
            ]}
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-2xl">
              <StatsCard title="Users" value={2543} />
              <StatsCard title="CPU" value={45.2} isHighlight={false} />
              <StatsCard title="Memory" value={78.9} isHighlight />
              <StatsCard title="Uptime" value="99.9%" />
            </div>
          </ComponentSection>

          <ComponentSection
            id="status-indicator"
            title="StatusIndicator"
            description="Visual status badge with animated dot indicator."
            category="feedback"
            codeExample={`import { StatusIndicator } from '@radio/mojo-ui';

<StatusIndicator status="running" />
<StatusIndicator status="stopped" />
<StatusIndicator status="error" />`}
            props={[
              {
                name: 'status',
                type: "'running' | 'stopped' | 'initializing' | 'error'",
                required: true,
                description: 'Status state',
              },
            ]}
          >
            <div className="flex items-center gap-6">
              <StatusIndicator status="running" />
              <StatusIndicator status="stopped" />
              <StatusIndicator status="initializing" />
              <StatusIndicator status="error" />
            </div>
          </ComponentSection>

          <ComponentSection
            id="skeleton"
            title="Skeleton"
            description="Loading placeholder with pulse animation."
            category="feedback"
            codeExample={`import { Skeleton, SkeletonText } from '@radio/mojo-ui';

<Skeleton variant="rectangular" width={200} height={20} />
<Skeleton variant="circular" width={40} height={40} />
<SkeletonText lines={3} />`}
            props={[
              {
                name: 'width',
                type: 'number | string',
                default: "'100%'",
                description: 'Skeleton width',
              },
              {
                name: 'height',
                type: 'number | string',
                description: 'Skeleton height',
              },
              {
                name: 'variant',
                type: "'text' | 'rectangular' | 'circular'",
                default: "'rectangular'",
                description: 'Skeleton shape',
              },
              {
                name: 'animated',
                type: 'boolean',
                default: 'true',
                description: 'Enable animation',
              },
            ]}
          >
            <div className="w-full max-w-sm space-y-3">
              <Skeleton width={200} height={20} />
              <Skeleton width="100%" height={12} />
              <Skeleton width="80%" height={12} />
              <div className="flex items-center gap-3 pt-2">
                <Skeleton width={40} height={40} variant="circular" />
                <div className="flex-1">
                  <Skeleton width={120} height={14} />
                  <div className="mt-2">
                    <Skeleton width="60%" height={10} />
                  </div>
                </div>
              </div>
            </div>
          </ComponentSection>

          {/* Overlay Components */}
          <ComponentSection
            id="modal"
            title="Modal"
            description="Dialog overlay for important interactions."
            category="overlay"
            codeExample={`import { Modal } from '@radio/mojo-ui';

<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Confirm Action"
>
  <p>Are you sure you want to proceed?</p>
  <div className="flex gap-2 mt-4">
    <Button variant="gray" title="Cancel" />
    <Button variant="green" title="Confirm" />
  </div>
</Modal>`}
            props={[
              {
                name: 'isOpen',
                type: 'boolean',
                required: true,
                description: 'Modal visibility',
              },
              {
                name: 'onClose',
                type: '() => void',
                required: true,
                description: 'Close handler',
              },
              { name: 'title', type: 'string', description: 'Modal title' },
              {
                name: 'children',
                type: 'ReactNode',
                description: 'Modal content',
              },
              {
                name: 'maxWidth',
                type: 'string',
                default: "'max-w-4xl'",
                description: 'Max width',
              },
            ]}
          >
            <div>
              <Button
                variant="green"
                title="Open Modal"
                onClick={() => setIsModalOpen(true)}
              />
              <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Example Modal"
              >
                <p className="text-gray-300 mb-4">
                  This is an example modal dialog.
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="gray"
                    title="Cancel"
                    onClick={() => setIsModalOpen(false)}
                  />
                  <Button
                    variant="green"
                    title="Confirm"
                    onClick={() => setIsModalOpen(false)}
                  />
                </div>
              </Modal>
            </div>
          </ComponentSection>

          <ComponentSection
            id="popup"
            title="Popup"
            description="Dropdown menu for actions and navigation."
            category="overlay"
            codeExample={`import { Popup, PopupItem } from '@radio/mojo-ui';

<Popup trigger={<Button title="Menu" />}>
  <PopupItem onClick={handleEdit}>Edit</PopupItem>
  <PopupItem onClick={handleDelete}>Delete</PopupItem>
</Popup>`}
            props={[
              {
                name: 'trigger',
                type: 'ReactNode',
                description: 'Trigger element',
              },
              { name: 'label', type: 'string', description: 'Button label' },
              {
                name: 'align',
                type: "'left' | 'right' | 'center'",
                default: "'left'",
                description: 'Alignment',
              },
            ]}
          >
            <div>
              <Popup trigger={<Button variant="green" title="Open Menu" />}>
                <PopupItem onClick={() => {}}>Edit item</PopupItem>
                <PopupItem onClick={() => {}}>Duplicate</PopupItem>
                <PopupItem onClick={() => {}}>Delete</PopupItem>
              </Popup>
            </div>
          </ComponentSection>

          <ComponentSection
            id="tooltip"
            title="Tooltip"
            description="Hover information tooltip with multiple placement options."
            category="overlay"
            codeExample={`import { Tooltip } from '@radio/mojo-ui';

<Tooltip content="This is helpful information" placement="top">
  <Button title="Hover me" />
</Tooltip>`}
            props={[
              {
                name: 'content',
                type: 'ReactNode',
                required: true,
                description: 'Tooltip content',
              },
              {
                name: 'children',
                type: 'ReactNode',
                required: true,
                description: 'Trigger element',
              },
              {
                name: 'placement',
                type: "'top' | 'bottom' | 'left' | 'right'",
                default: "'top'",
                description: 'Tooltip position',
              },
              {
                name: 'delay',
                type: 'number',
                default: '200',
                description: 'Show delay in ms',
              },
            ]}
          >
            <div className="flex items-center gap-4 flex-wrap">
              <Tooltip content="Top tooltip">
                <Button variant="green" size="small" title="Top" />
              </Tooltip>
              <Tooltip content="Bottom tooltip" placement="bottom">
                <Button variant="yellow" size="small" title="Bottom" />
              </Tooltip>
              <Tooltip content="Left tooltip" placement="left">
                <Button variant="red" size="small" title="Left" />
              </Tooltip>
              <Tooltip content="Right tooltip" placement="right">
                <Button variant="gray" size="small" title="Right" />
              </Tooltip>
            </div>
          </ComponentSection>

          {/* Phase 3 Components */}
          <ComponentSection
            id="radio"
            title="Radio"
            description="Radio button group with horizontal and vertical layouts."
            category="form"
            codeExample={`import { Radio } from '@radio/mojo-ui';

<Radio
  name="plan"
  label="Select Plan"
  value={selectedValue}
  onChange={setSelectedValue}
  options={[
    { value: 'basic', label: 'Basic' },
    { value: 'pro', label: 'Pro' },
  ]}
/>`}
            props={[
              {
                name: 'options',
                type: 'RadioOption[]',
                required: true,
                description: 'Radio options',
              },
              {
                name: 'name',
                type: 'string',
                required: true,
                description: 'Radio group name',
              },
              {
                name: 'value',
                type: 'string',
                description: 'Selected value',
              },
              {
                name: 'onChange',
                type: '(value: string) => void',
                description: 'Change handler',
              },
              {
                name: 'layout',
                type: "'horizontal' | 'vertical'",
                default: "'vertical'",
                description: 'Layout direction',
              },
              sizeProp,
            ]}
          >
            <div className="space-y-6">
              <div className="w-full max-w-sm">
                <Radio
                  name="plan-vertical"
                  label="Vertical Layout"
                  value={radioValue}
                  onChange={setRadioValue}
                  options={radioOptions}
                />
              </div>
              <div className="w-full max-w-sm">
                <Radio
                  name="plan-horizontal"
                  label="Horizontal Layout"
                  value={radioValue}
                  onChange={setRadioValue}
                  options={radioOptions}
                  layout="horizontal"
                />
              </div>
            </div>
          </ComponentSection>

          <ComponentSection
            id="slider"
            title="Slider"
            description="Range slider with analog retro feel and real-time value display."
            category="form"
            codeExample={`import { Slider } from '@radio/mojo-ui';

<Slider
  value={volume}
  onChange={setVolume}
  min={0}
  max={100}
  step={1}
  label="Volume"
  showValue
/>`}
            props={[
              {
                name: 'value',
                type: 'number',
                description: 'Current value',
              },
              {
                name: 'min',
                type: 'number',
                default: '0',
                description: 'Minimum value',
              },
              {
                name: 'max',
                type: 'number',
                default: '100',
                description: 'Maximum value',
              },
              {
                name: 'step',
                type: 'number',
                default: '1',
                description: 'Step increment',
              },
              {
                name: 'label',
                type: 'string',
                description: 'Slider label',
              },
              {
                name: 'showValue',
                type: 'boolean',
                default: 'true',
                description: 'Show value display',
              },
              sizeProp,
              disabledProp,
            ]}
          >
            <div className="w-full max-w-md space-y-6">
              <Slider
                value={sliderValue}
                onChange={setSliderValue}
                label="Volume Control"
                min={0}
                max={100}
              />
              <Slider
                value={30}
                onChange={() => {}}
                label="Small Size"
                size="small"
              />
              <Slider
                value={70}
                onChange={() => {}}
                label="Large Size"
                size="large"
              />
            </div>
          </ComponentSection>

          <ComponentSection
            id="badge"
            title="Badge"
            description="Status and label badges with dot indicators and pulse animation."
            category="feedback"
            codeExample={`import { Badge } from '@radio/mojo-ui';

<Badge variant="success" dot>Online</Badge>
<Badge variant="warning">Pending</Badge>
<Badge variant="error" pulse>Alert</Badge>`}
            props={[
              {
                name: 'variant',
                type: "'default' | 'success' | 'warning' | 'error' | 'info' | 'moss' | 'ember' | 'sun' | 'river'",
                default: "'default'",
                description: 'Badge style variant',
              },
              sizeProp,
              {
                name: 'dot',
                type: 'boolean',
                default: 'false',
                description: 'Show dot indicator',
              },
              {
                name: 'pulse',
                type: 'boolean',
                default: 'false',
                description: 'Pulse animation',
              },
            ]}
          >
            <div className="space-y-4">
              <div className="flex items-center gap-3 flex-wrap">
                <Badge variant="default">Default</Badge>
                <Badge variant="success" dot>
                  Success
                </Badge>
                <Badge variant="warning" dot>
                  Warning
                </Badge>
                <Badge variant="error" dot>
                  Error
                </Badge>
                <Badge variant="info" dot>
                  Info
                </Badge>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <Badge variant="moss">Moss</Badge>
                <Badge variant="ember">Ember</Badge>
                <Badge variant="sun">Sun</Badge>
                <Badge variant="river">River</Badge>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <Badge variant="success" pulse dot>
                  Pulsing
                </Badge>
                <Badge variant="warning" size="small">
                  Small
                </Badge>
                <Badge variant="error" size="large">
                  Large
                </Badge>
              </div>
            </div>
          </ComponentSection>

          <ComponentSection
            id="alert"
            title="Alert"
            description="Alert banners for important messages with icons and dismiss actions."
            category="feedback"
            codeExample={`import { Alert } from '@radio/mojo-ui';

<Alert
  variant="success"
  title="Success"
  onClose={handleClose}
>
  Your changes have been saved.
</Alert>`}
            props={[
              {
                name: 'variant',
                type: "'info' | 'success' | 'warning' | 'error'",
                default: "'info'",
                description: 'Alert style variant',
              },
              {
                name: 'title',
                type: 'string',
                description: 'Alert title',
              },
              {
                name: 'children',
                type: 'ReactNode',
                required: true,
                description: 'Alert message',
              },
              {
                name: 'onClose',
                type: '() => void',
                description: 'Close handler',
              },
            ]}
          >
            <div className="space-y-4 w-full max-w-xl">
              <Alert variant="info" title="Information">
                This is an informational message for the user.
              </Alert>
              <Alert variant="success" title="Success">
                Your changes have been saved successfully.
              </Alert>
              <Alert variant="warning" title="Warning">
                Please review your settings before continuing.
              </Alert>
              <Alert variant="error" title="Error" onClose={() => {}}>
                Something went wrong. Please try again.
              </Alert>
            </div>
          </ComponentSection>

          <ComponentSection
            id="toast"
            title="Toast"
            description="Notification toasts with auto-dismiss and progress indicator."
            category="feedback"
            codeExample={`import { Toast, ToastContainer, generateToastId } from '@radio/mojo-ui';

const addToast = () => {
  const toast = {
    id: generateToastId(),
    variant: 'success',
    title: 'Success',
    message: 'Operation completed',
  };
  setToasts(prev => [...prev, toast]);
};`}
            props={[
              {
                name: 'variant',
                type: "'info' | 'success' | 'warning' | 'error'",
                default: "'info'",
                description: 'Toast style variant',
              },
              {
                name: 'title',
                type: 'string',
                description: 'Toast title',
              },
              {
                name: 'message',
                type: 'ReactNode',
                required: true,
                description: 'Toast message',
              },
              {
                name: 'duration',
                type: 'number',
                default: '5000',
                description: 'Auto-dismiss duration (ms)',
              },
              {
                name: 'onClose',
                type: '(id: string) => void',
                description: 'Close handler',
              },
            ]}
          >
            <div className="space-y-3">
              <div className="flex gap-3 flex-wrap">
                <Button
                  variant="green"
                  size="small"
                  title="Success Toast"
                  onClick={() =>
                    addToast(
                      'success',
                      'Success!',
                      'Your action was completed.',
                    )
                  }
                />
                <Button
                  variant="yellow"
                  size="small"
                  title="Warning Toast"
                  onClick={() =>
                    addToast('warning', 'Warning', 'Please check your input.')
                  }
                />
                <Button
                  variant="red"
                  size="small"
                  title="Error Toast"
                  onClick={() =>
                    addToast('error', 'Error', 'Something went wrong.')
                  }
                />
                <Button
                  variant="gray"
                  size="small"
                  title="Info Toast"
                  onClick={() =>
                    addToast('info', 'Info', 'Here is some information.')
                  }
                />
              </div>
            </div>
          </ComponentSection>

          <ComponentSection
            id="data-table"
            title="DataTable"
            description="Table component with retro styling, sorting, and row selection."
            category="data-display"
            codeExample={`import { DataTable } from '@radio/mojo-ui';

<DataTable
  data={users}
  columns={columns}
  keyExtractor={(row) => row.id}
  striped
  hoverable
/>`}
            props={[
              {
                name: 'data',
                type: 'T[]',
                required: true,
                description: 'Table data',
              },
              {
                name: 'columns',
                type: 'DataTableColumn<T>[]',
                required: true,
                description: 'Column definitions',
              },
              {
                name: 'keyExtractor',
                type: '(row: T) => string',
                required: true,
                description: 'Unique key extractor',
              },
              {
                name: 'striped',
                type: 'boolean',
                default: 'true',
                description: 'Striped rows',
              },
              {
                name: 'hoverable',
                type: 'boolean',
                default: 'true',
                description: 'Hover effects',
              },
            ]}
          >
            <div className="w-full">
              <DataTable
                data={tableData}
                columns={tableColumns}
                keyExtractor={(row) => row.id}
                striped
                hoverable
              />
            </div>
          </ComponentSection>
        </div>
      </div>

      <ToastContainer
        toasts={toasts}
        position="bottom-right"
        onClose={removeToast}
      />
      <Footer />
    </div>
  );
};

export default ComponentsPage;
