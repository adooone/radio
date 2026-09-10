import type { FC } from 'react';
import { CodeBlock } from '../components/code-block';
import { Footer } from '../components/footer';
import { type PropDef, PropTable } from '../components/prop-table';

const quickStartCode = `// 1. Install the package
npm install @radio/mojo-ui

// 2. Import the Tailwind preset
import { mojoPreset } from '@radio/mojo-ui/tailwind';

// 3. Update tailwind.config.js
export default {
  presets: [mojoPreset],
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
};

// 4. Import global styles in your app entry
import '@radio/mojo-ui/globals.scss';`;

const usageExample = `import { Button, Card, Input } from '@radio/mojo-ui';

function App() {
  return (
    <Card title="Welcome">
      <Input label="Email" placeholder="Enter email" />
      <Button variant="green" title="Submit" />
    </Card>
  );
}`;

const componentList: Array<{
  name: string;
  category: string;
  description: string;
  props: PropDef[];
}> = [
  {
    name: 'Button',
    category: 'Basic',
    description: 'Interactive button with multiple variants.',
    props: [
      {
        name: 'variant',
        type: "'green' | 'yellow' | 'gray' | 'red'",
        default: "'green'",
        description: 'Visual style',
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
      { name: 'onClick', type: '() => void', description: 'Click handler' },
      {
        name: 'disabled',
        type: 'boolean',
        default: 'false',
        description: 'Disable button',
      },
    ],
  },
  {
    name: 'IconButton',
    category: 'Basic',
    description: 'Circular button for icon content.',
    props: [
      {
        name: 'variant',
        type: "'green' | 'yellow' | 'gray' | 'red'",
        default: "'green'",
        description: 'Visual style',
      },
      {
        name: 'size',
        type: "'small' | 'medium' | 'large'",
        default: "'medium'",
        description: 'Button size',
      },
      {
        name: 'children',
        type: 'ReactNode',
        required: true,
        description: 'Icon content',
      },
      {
        name: 'disabled',
        type: 'boolean',
        default: 'false',
        description: 'Disable button',
      },
    ],
  },
  {
    name: 'Card',
    category: 'Layout',
    description: 'Container component with optional header and footer.',
    props: [
      { name: 'title', type: 'string', description: 'Card header title' },
      {
        name: 'children',
        type: 'ReactNode',
        required: true,
        description: 'Card content',
      },
      { name: 'actions', type: 'ReactNode', description: 'Header actions' },
      { name: 'footer', type: 'ReactNode', description: 'Footer content' },
    ],
  },
  {
    name: 'Input',
    category: 'Form',
    description: 'Text input with label support.',
    props: [
      {
        name: 'size',
        type: "'small' | 'medium' | 'large'",
        default: "'medium'",
        description: 'Input size',
      },
      { name: 'label', type: 'string', description: 'Input label' },
      { name: 'placeholder', type: 'string', description: 'Placeholder text' },
      { name: 'error', type: 'string', description: 'Error message' },
      {
        name: 'disabled',
        type: 'boolean',
        default: 'false',
        description: 'Disable input',
      },
    ],
  },
  {
    name: 'Select',
    category: 'Form',
    description: 'Dropdown select component.',
    props: [
      { name: 'label', type: 'string', description: 'Select label' },
      {
        name: 'options',
        type: 'SelectOption[]',
        required: true,
        description: 'Option list',
      },
      { name: 'error', type: 'string', description: 'Error message' },
      {
        name: 'disabled',
        type: 'boolean',
        default: 'false',
        description: 'Disable select',
      },
    ],
  },
  {
    name: 'Textarea',
    category: 'Form',
    description: 'Multi-line text input.',
    props: [
      { name: 'label', type: 'string', description: 'Textarea label' },
      { name: 'placeholder', type: 'string', description: 'Placeholder text' },
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
    ],
  },
  {
    name: 'Checkbox',
    category: 'Form',
    description: 'Toggle checkbox with label.',
    props: [
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
      {
        name: 'disabled',
        type: 'boolean',
        default: 'false',
        description: 'Disable checkbox',
      },
    ],
  },
  {
    name: 'Switch',
    category: 'Form',
    description: 'Toggle switch with variants.',
    props: [
      {
        name: 'variant',
        type: "'green' | 'yellow' | 'gray' | 'red'",
        default: "'green'",
        description: 'Visual style',
      },
      {
        name: 'size',
        type: "'small' | 'medium' | 'large'",
        default: "'medium'",
        description: 'Switch size',
      },
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
    ],
  },
  {
    name: 'Panel',
    category: 'Layout',
    description: 'Multi-section container.',
    props: [
      {
        name: 'title',
        type: 'string',
        required: true,
        description: 'Panel title',
      },
      { name: 'subtitle', type: 'string', description: 'Panel subtitle' },
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
        description: 'Max columns',
      },
    ],
  },
  {
    name: 'StatsGrid',
    category: 'Layout',
    description: 'Grid for displaying statistics.',
    props: [
      {
        name: 'stats',
        type: 'StatItem[]',
        required: true,
        description: 'Statistics array',
      },
      {
        name: 'columns',
        type: 'number',
        default: '2',
        description: 'Column count',
      },
    ],
  },
  {
    name: 'Tabs',
    category: 'Navigation',
    description: 'Tab navigation component.',
    props: [
      {
        name: 'variant',
        type: "'green' | 'yellow' | 'gray' | 'red'",
        default: "'green'",
        description: 'Visual style',
      },
      {
        name: 'tabs',
        type: 'TabItem[]',
        required: true,
        description: 'Tab definitions',
      },
      { name: 'defaultTab', type: 'string', description: 'Default active tab' },
    ],
  },
  {
    name: 'NavigationIsland',
    category: 'Navigation',
    description: 'Floating navigation bar.',
    props: [
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
        description: 'Active path',
      },
      { name: 'logo', type: 'ReactNode', description: 'Logo element' },
      { name: 'actions', type: 'ReactNode', description: 'Action elements' },
    ],
  },
  {
    name: 'ProgressBar',
    category: 'Feedback',
    description: 'Segmented progress indicator.',
    props: [
      {
        name: 'variant',
        type: "'green' | 'yellow' | 'gray' | 'red'",
        default: "'green'",
        description: 'Visual style',
      },
      {
        name: 'value',
        type: 'number',
        required: true,
        description: 'Progress (0-100)',
      },
      {
        name: 'lampCount',
        type: 'number',
        default: '10',
        description: 'Segment count',
      },
      { name: 'label', type: 'string', description: 'Progress label' },
    ],
  },
  {
    name: 'CircularProgress',
    category: 'Feedback',
    description: 'Circular progress indicator.',
    props: [
      {
        name: 'percentage',
        type: 'number',
        required: true,
        description: 'Progress (0-100)',
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
        description: 'Show percentage',
      },
    ],
  },
  {
    name: 'StatsCard',
    category: 'Feedback',
    description: 'Statistic display card.',
    props: [
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
        description: 'Highlight style',
      },
    ],
  },
  {
    name: 'StatusIndicator',
    category: 'Feedback',
    description: 'Status badge with animation.',
    props: [
      {
        name: 'status',
        type: "'running' | 'stopped' | 'initializing' | 'error'",
        required: true,
        description: 'Status state',
      },
    ],
  },
  {
    name: 'Skeleton',
    category: 'Feedback',
    description: 'Loading placeholder.',
    props: [
      {
        name: 'width',
        type: 'string | number',
        default: "'100%'",
        description: 'Skeleton width',
      },
      {
        name: 'height',
        type: 'string | number',
        description: 'Skeleton height',
      },
      {
        name: 'variant',
        type: "'text' | 'rectangular' | 'circular'",
        default: "'rectangular'",
        description: 'Shape variant',
      },
      {
        name: 'animated',
        type: 'boolean',
        default: 'true',
        description: 'Enable animation',
      },
    ],
  },
  {
    name: 'Modal',
    category: 'Overlay',
    description: 'Dialog overlay.',
    props: [
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
      { name: 'children', type: 'ReactNode', description: 'Modal content' },
      {
        name: 'maxWidth',
        type: 'string',
        default: "'max-w-4xl'",
        description: 'Max width',
      },
    ],
  },
  {
    name: 'Popup',
    category: 'Overlay',
    description: 'Dropdown menu.',
    props: [
      { name: 'trigger', type: 'ReactNode', description: 'Trigger element' },
      { name: 'label', type: 'string', description: 'Button label' },
      {
        name: 'align',
        type: "'left' | 'right' | 'center'",
        default: "'left'",
        description: 'Alignment',
      },
    ],
  },
];

const categories = [
  'Basic',
  'Form',
  'Layout',
  'Navigation',
  'Feedback',
  'Overlay',
];

const categoryColors: Record<string, string> = {
  Basic: 'bg-moss-DEFAULT/20 text-moss-calm',
  Form: 'bg-river-DEFAULT/20 text-river-calm',
  Layout: 'bg-bark-DEFAULT/20 text-bark-calm',
  Navigation: 'bg-sun-DEFAULT/20 text-sun-calm',
  Feedback: 'bg-ember-DEFAULT/20 text-ember-calm',
  Overlay: 'bg-clay-DEFAULT/20 text-clay-DEFAULT',
};

export const DocsPage: FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-8 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-white mb-4">Documentation</h1>
        <p className="text-gray-400 text-lg">
          Complete API reference for all Mojo UI components including props,
          usage examples, and installation instructions.
        </p>
      </div>

      <div className="space-y-16">
        {/* Installation */}
        <section>
          <h2 className="text-2xl font-bold text-white mb-4">Installation</h2>
          <p className="text-gray-400 mb-6">
            Get started with Mojo UI in your React project.
          </p>
          <CodeBlock filename="setup.sh" code={quickStartCode} />
        </section>

        {/* Usage */}
        <section>
          <h2 className="text-2xl font-bold text-white mb-4">Basic Usage</h2>
          <p className="text-gray-400 mb-6">
            Import and use components in your React application.
          </p>
          <CodeBlock filename="App.tsx" code={usageExample} />
        </section>

        {/* Component List */}
        <section>
          <h2 className="text-2xl font-bold text-white mb-6">
            Component API Reference
          </h2>

          {categories.map((category) => {
            const components = componentList.filter(
              (c) => c.category === category,
            );
            if (components.length === 0) return null;

            return (
              <div key={category} className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <h3 className="text-xl font-semibold text-white">
                    {category}
                  </h3>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${categoryColors[category]}`}
                  >
                    {components.length} components
                  </span>
                </div>

                <div className="space-y-8">
                  {components.map((component) => (
                    <div
                      key={component.name}
                      id={component.name.toLowerCase()}
                      className="bg-coal-deep rounded-xl p-6 border border-white/5 scroll-mt-24"
                    >
                      <div className="mb-4">
                        <code className="text-lg text-moss-calm font-mono">
                          {component.name}
                        </code>
                        <p className="text-gray-400 mt-1">
                          {component.description}
                        </p>
                      </div>
                      <PropTable props={component.props} />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </section>

        {/* Icons */}
        <section>
          <h2 className="text-2xl font-bold text-white mb-4">Icons</h2>
          <p className="text-gray-400 mb-6">
            Mojo UI includes a set of SVG icons that can be imported
            individually.
          </p>

          <CodeBlock
            filename="icons.tsx"
            code={`import { 
  CheckIcon, 
  PlusIcon, 
  MenuIcon, 
  CloseIcon,
  SearchIcon,
  SettingsIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  FilterIcon,
  SortIcon 
} from '@radio/mojo-ui/icons';

// Use in components
<IconButton variant="green">
  <PlusIcon />
</IconButton>`}
          />
        </section>

        {/* Shared Styles */}
        <section>
          <h2 className="text-2xl font-bold text-white mb-4">Shared Styles</h2>
          <p className="text-gray-400 mb-6">
            Import predefined style objects for consistent layouts.
          </p>

          <CodeBlock
            filename="styles.tsx"
            code={`import { 
  container, 
  content, 
  title,
  statsCard,
  statsGrid,
  serviceSection,
  glassmorphism 
} from '@radio/mojo-ui/styles';

// Use Tailwind classes from the library
<div className={container}>
  <div className={content}>
    <h1 className={title}>Page Title</h1>
  </div>
</div>`}
          />
        </section>

        {/* Best Practices */}
        <section>
          <h2 className="text-2xl font-bold text-white mb-4">Best Practices</h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-coal-deep rounded-xl p-6 border border-white/5">
              <h3 className="text-lg font-semibold text-moss-calm mb-3">Do</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-start gap-2">
                  <span className="text-moss-DEFAULT">✓</span>
                  Use semantic color variants (green for success, red for
                  danger)
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-moss-DEFAULT">✓</span>
                  Keep button labels concise (1-3 words)
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-moss-DEFAULT">✓</span>
                  Use Card components for related content groups
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-moss-DEFAULT">✓</span>
                  Include labels for form inputs
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-moss-DEFAULT">✓</span>
                  Use consistent spacing (4px grid multiples)
                </li>
              </ul>
            </div>

            <div className="bg-coal-deep rounded-xl p-6 border border-white/5">
              <h3 className="text-lg font-semibold text-ember-calm mb-3">
                Don't
              </h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-start gap-2">
                  <span className="text-ember-DEFAULT">✗</span>
                  Mix multiple button variants in the same group
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-ember-DEFAULT">✗</span>
                  Use red variant for non-destructive actions
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-ember-DEFAULT">✗</span>
                  Nest Cards within Cards
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-ember-DEFAULT">✗</span>
                  Skip loading states for async operations
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-ember-DEFAULT">✗</span>
                  Use arbitrary Tailwind values
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* TypeScript */}
        <section>
          <h2 className="text-2xl font-bold text-white mb-4">
            TypeScript Support
          </h2>
          <p className="text-gray-400 mb-6">
            Mojo UI is built with TypeScript and exports all type definitions.
          </p>

          <CodeBlock
            filename="types.tsx"
            code={`import type { 
  ButtonProps,
  CardProps, 
  InputProps,
  SelectProps,
  SwitchProps,
  ModalProps,
  TabItem,
  StatItem 
} from '@radio/mojo-ui';

// Use types in your components
interface MyComponentProps {
  buttonProps: ButtonProps;
  tabs: TabItem[];
}`}
          />
        </section>
      </div>

      <Footer />
    </div>
  );
};

export default DocsPage;
