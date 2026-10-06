import type { FC } from 'react';
import { CodeBlock } from '../components/code-block';
import { Footer } from '../components/footer';

// Color definitions from tailwind.config.js
const colors = {
  moss: {
    name: 'Moss',
    description: 'Primary success, growth, active states',
    shades: [
      { name: 'fog', value: '#c4d8c1', textDark: true },
      { name: 'calm', value: '#a9c5a2', textDark: true },
      { name: 'default', value: '#8aa982', textDark: true },
      { name: 'deep', value: '#5c7459', textDark: true },
      { name: 'relic', value: '#394d37', textDark: false },
    ],
  },
  bark: {
    name: 'Bark',
    description: 'Earthy, neutral secondary elements',
    shades: [
      { name: 'fog', value: '#e2d2b7', textDark: true },
      { name: 'calm', value: '#c8b48f', textDark: true },
      { name: 'default', value: '#a18763', textDark: true },
      { name: 'deep', value: '#7a6144', textDark: true },
      { name: 'relic', value: '#4e3c2d', textDark: false },
    ],
  },
  coal: {
    name: 'Coal',
    description: 'Dark backgrounds, surfaces',
    shades: [
      { name: 'fog', value: '#4a4a4a', textDark: false },
      { name: 'calm', value: '#3c3c3c', textDark: false },
      { name: 'default', value: '#2e2e2e', textDark: false },
      { name: 'deep', value: '#1f1f1f', textDark: false },
      { name: 'relic', value: '#151515', textDark: false },
    ],
  },
  clay: {
    name: 'Clay',
    description: 'Warm accents, clay-like elements',
    shades: [
      { name: 'fog', value: '#fef8f6', textDark: true },
      { name: 'calm', value: '#f7cfc4', textDark: true },
      { name: 'default', value: '#f0a596', textDark: true },
      { name: 'deep', value: '#d78878', textDark: true },
      { name: 'relic', value: '#aa5a52', textDark: false },
    ],
  },
  river: {
    name: 'River',
    description: 'Cool accents, water-like elements',
    shades: [
      { name: 'fog', value: '#c4ddeb', textDark: true },
      { name: 'calm', value: '#8ac5e6', textDark: true },
      { name: 'default', value: '#4b9ac3', textDark: false },
      { name: 'deep', value: '#2f6d91', textDark: false },
      { name: 'relic', value: '#1a3c57', textDark: false },
    ],
  },
  paper: {
    name: 'Paper',
    description: 'Light elements, parchment feel',
    shades: [
      { name: 'fog', value: '#FCF3DA', textDark: true },
      { name: 'calm', value: '#f0e6d2', textDark: true },
      { name: 'default', value: '#d9cbb0', textDark: true },
      { name: 'deep', value: '#b8a487', textDark: true },
      { name: 'relic', value: '#a39480', textDark: true },
    ],
  },
  sun: {
    name: 'Sun',
    description: 'Warm highlights, golden accents',
    shades: [
      { name: 'fog', value: '#ffe7a0', textDark: true },
      { name: 'calm', value: '#ffc857', textDark: true },
      { name: 'default', value: '#ff9f1c', textDark: true },
      { name: 'deep', value: '#ff6f00', textDark: true },
      { name: 'relic', value: '#d45500', textDark: false },
    ],
  },
  ember: {
    name: 'Ember',
    description: 'Warning, fire-like urgency',
    shades: [
      { name: 'fog', value: '#f2855d', textDark: true },
      { name: 'calm', value: '#ff926b', textDark: true },
      { name: 'default', value: '#e4572e', textDark: false },
      { name: 'deep', value: '#bc4b26', textDark: false },
      { name: 'relic', value: '#803e2d', textDark: false },
    ],
  },
};

const typography = {
  families: [
    {
      name: 'font-display',
      font: 'Tiny5',
      usage: 'Headlines, display text',
      style: 'Retro, pixelated',
    },
    {
      name: 'font-sans',
      font: 'KyivType Sans',
      usage: 'UI elements, buttons',
      style: 'Clean, modern',
    },
    {
      name: 'font-serif',
      font: 'KyivType Serif',
      usage: 'Body text, paragraphs',
      style: 'Elegant, readable',
    },
    {
      name: 'font-mono',
      font: 'JetBrains Mono',
      usage: 'Code, technical text',
      style: 'Technical',
    },
  ],
  sizes: [
    {
      name: 'text-xs',
      size: '12px',
      rem: '0.75rem',
      usage: 'Captions, labels',
    },
    {
      name: 'text-sm',
      size: '14px',
      rem: '0.875rem',
      usage: 'Small text, buttons',
    },
    { name: 'text-base', size: '16px', rem: '1rem', usage: 'Body text' },
    {
      name: 'text-lg',
      size: '18px',
      rem: '1.125rem',
      usage: 'Large body text',
    },
    { name: 'text-xl', size: '20px', rem: '1.25rem', usage: 'Subheadings' },
    { name: 'text-2xl', size: '24px', rem: '1.5rem', usage: 'Headings' },
    {
      name: 'text-3xl',
      size: '30px',
      rem: '1.875rem',
      usage: 'Large headings',
    },
    { name: 'text-4xl', size: '36px', rem: '2.25rem', usage: 'Display text' },
  ],
};

const spacing = [
  { name: '0', value: '0px', rem: '0' },
  { name: '0.5', value: '2px', rem: '0.125rem' },
  { name: '1', value: '4px', rem: '0.25rem' },
  { name: '2', value: '8px', rem: '0.5rem' },
  { name: '3', value: '12px', rem: '0.75rem' },
  { name: '4', value: '16px', rem: '1rem' },
  { name: '5', value: '20px', rem: '1.25rem' },
  { name: '6', value: '24px', rem: '1.5rem' },
  { name: '8', value: '32px', rem: '2rem' },
  { name: '10', value: '40px', rem: '2.5rem' },
  { name: '12', value: '48px', rem: '3rem' },
  { name: '16', value: '64px', rem: '4rem' },
  { name: '20', value: '80px', rem: '5rem' },
  { name: '24', value: '96px', rem: '6rem' },
];

const borderRadius = [
  { name: 'rounded-none', value: '0' },
  { name: 'rounded-sm', value: '2px' },
  { name: 'rounded', value: '4px' },
  { name: 'rounded-md', value: '6px' },
  { name: 'rounded-lg', value: '8px' },
  { name: 'rounded-xl', value: '12px' },
  { name: 'rounded-2xl', value: '16px' },
  { name: 'rounded-3xl', value: '24px' },
  { name: 'rounded-full', value: '9999px' },
];

const shadows = [
  {
    name: 'shadow-sm',
    value: '0 1px 2px rgba(0,0,0,0.3)',
    usage: 'Subtle elevation',
  },
  {
    name: 'shadow',
    value: '0 1px 3px rgba(0,0,0,0.4)',
    usage: 'Default elevation',
  },
  {
    name: 'shadow-md',
    value: '0 4px 6px rgba(0,0,0,0.4)',
    usage: 'Cards, panels',
  },
  {
    name: 'shadow-lg',
    value: '0 10px 15px rgba(0,0,0,0.5)',
    usage: 'Dropdowns, modals',
  },
  {
    name: 'shadow-xl',
    value: '0 20px 25px rgba(0,0,0,0.5)',
    usage: 'Floating elements',
  },
];

const ColorSwatch: FC<{ name: string; value: string; textDark: boolean }> = ({
  name,
  value,
  textDark,
}) => (
  <div
    className="rounded-lg p-3 flex flex-col justify-between h-20"
    style={{ backgroundColor: value }}
  >
    <span
      className={`text-xs font-medium ${textDark ? 'text-black/60' : 'text-white/60'}`}
    >
      {name}
    </span>
    <span
      className={`text-xs font-mono ${textDark ? 'text-black/80' : 'text-white/80'}`}
    >
      {value}
    </span>
  </div>
);

export const TokensPage: FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-8 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-white mb-4">Design Tokens</h1>
        <p className="text-gray-400 text-lg">
          Complete reference for Mojo UI's design system tokens including
          colors, typography, spacing, and more.
        </p>
      </div>

      <div className="space-y-16">
        {/* Colors Section */}
        <section>
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">Colors</h2>
            <p className="text-gray-400">
              Nature-inspired color palette with semantic naming. Each color has
              fog, calm, default, deep, and relic variants.
            </p>
          </div>

          <div className="space-y-8">
            {Object.entries(colors).map(([key, color]) => (
              <div
                key={key}
                className="bg-coal-deep rounded-xl p-6 border border-white/5"
              >
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-white capitalize">
                    {color.name}
                  </h3>
                  <p className="text-sm text-gray-500">{color.description}</p>
                </div>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                  {color.shades.map((shade) => (
                    <ColorSwatch
                      key={shade.name}
                      name={
                        shade.name === 'default' ? key : `${key}-${shade.name}`
                      }
                      value={shade.value}
                      textDark={shade.textDark}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8">
            <CodeBlock
              filename="example.tsx"
              code={`// Using colors in Tailwind classes
// Use color name alone for default shade
<div className="bg-moss text-coal-fog">
  <p className="text-ember-deep">Warning message</p>
  <span className="bg-sun-calm">Highlighted</span>
</div>`}
            />
          </div>
        </section>

        {/* Typography Section */}
        <section>
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">Typography</h2>
            <p className="text-gray-400">
              Four font families with distinct purposes and a consistent type
              scale.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Font Families */}
            <div className="bg-coal-deep rounded-xl p-6 border border-white/5">
              <h3 className="text-lg font-semibold text-white mb-4">
                Font Families
              </h3>
              <div className="space-y-6">
                {typography.families.map((font) => (
                  <div
                    key={font.name}
                    className="py-3 border-b border-white/5 last:border-0"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <code className="text-xs text-moss-calm font-mono">
                        {font.name}
                      </code>
                      <span className="text-xs text-gray-500">{font.font}</span>
                    </div>
                    <p className={`${font.name} text-xl text-gray-200 mb-1`}>
                      The quick brown fox
                    </p>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-400">{font.usage}</span>
                      <span className="text-gray-600">{font.style}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Type Scale */}
            <div className="bg-coal-deep rounded-xl p-6 border border-white/5">
              <h3 className="text-lg font-semibold text-white mb-4">
                Type Scale
              </h3>
              <div className="space-y-3">
                {typography.sizes.map((size) => (
                  <div
                    key={size.name}
                    className="flex items-center justify-between"
                  >
                    <span className={`${size.name} text-gray-200`}>Aa</span>
                    <div className="text-right">
                      <code className="text-xs text-moss-calm font-mono">
                        {size.name}
                      </code>
                      <span className="text-xs text-gray-500 ml-2">
                        {size.size}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8">
            <CodeBlock
              filename="example.tsx"
              code={`// Typography classes
<h1 className="font-display text-3xl">Display Heading</h1>
<p className="font-serif text-base">Body text in serif</p>
<button className="font-sans text-sm">Button Label</button>
<code className="font-mono text-xs">code snippet</code>`}
            />
          </div>
        </section>

        {/* Spacing Section */}
        <section>
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">Spacing</h2>
            <p className="text-gray-400">
              4px-based spacing scale for consistent layouts.
            </p>
          </div>

          <div className="bg-coal-deep rounded-xl p-6 border border-white/5">
            <div className="space-y-3">
              {spacing.map((space) => (
                <div key={space.name} className="flex items-center gap-4">
                  <code className="w-16 text-xs text-moss-calm font-mono">
                    {space.name}
                  </code>
                  <div
                    className="h-4 bg-moss-default/30 rounded"
                    style={{
                      width: space.value === '0px' ? '4px' : space.value,
                    }}
                  />
                  <span className="text-xs text-gray-500">
                    {space.rem} ({space.value})
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8">
            <CodeBlock
              filename="example.tsx"
              code={`// Spacing classes
<div className="p-4 m-2 gap-3">
  <div className="px-6 py-4">Content with padding</div>
  <div className="space-y-2">Stacked items</div>
</div>`}
            />
          </div>
        </section>

        {/* Border Radius */}
        <section>
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">
              Border Radius
            </h2>
            <p className="text-gray-400">
              Consistent corner rounding for different element types.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {borderRadius.map((radius) => (
              <div
                key={radius.name}
                className="bg-coal-deep rounded-xl p-4 border border-white/5 text-center"
              >
                <div className="relative h-24 mx-auto mb-3 flex items-center justify-center">
                  <div
                    className="w-20 h-20 bg-gradient-to-br from-moss-calm to-moss"
                    style={{ borderRadius: radius.value }}
                  />
                </div>
                <code className="text-xs text-moss-calm font-mono block mb-1">
                  {radius.name}
                </code>
                <span className="text-xs text-gray-500">{radius.value}</span>
              </div>
            ))}
          </div>

          <div className="mt-8">
            <CodeBlock
              filename="example.tsx"
              code={`// Border radius classes
<button className="rounded-full">Pill Button</button>
<div className="rounded-xl">Card Container</div>
<span className="rounded">Tag</span>`}
            />
          </div>
        </section>

        {/* Shadows */}
        <section>
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">Shadows</h2>
            <p className="text-gray-400">
              Elevation system for depth and hierarchy.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {shadows.map((shadow) => (
              <div
                key={shadow.name}
                className="bg-coal rounded-xl p-6 border border-white/5"
                style={{
                  boxShadow: shadow.value.replace('rgba(0,0,0,', 'rgba(0,0,0,'),
                }}
              >
                <code className="text-xs text-moss-calm font-mono block mb-1">
                  {shadow.name}
                </code>
                <p className="text-xs text-gray-500">{shadow.usage}</p>
              </div>
            ))}
          </div>

          <div className="mt-8">
            <CodeBlock
              filename="example.tsx"
              code={`// Shadow classes
<div className="shadow-sm">Subtle elevation</div>
<div className="shadow-md">Card default</div>
<div className="shadow-xl">Modal overlay</div>`}
            />
          </div>
        </section>

        {/* Text Shadow */}
        <section>
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">Text Shadow</h2>
            <p className="text-gray-400">
              Text shadows for improved readability and retro effects.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-coal-deep rounded-xl p-6 border border-white/5 text-center">
              <p className="text-shadow text-white text-lg">Default Shadow</p>
              <code className="text-xs text-moss-calm font-mono block mt-2">
                text-shadow
              </code>
            </div>
            <div className="bg-coal-deep rounded-xl p-6 border border-white/5 text-center">
              <p className="text-shadow-strong text-white text-lg">
                Strong Shadow
              </p>
              <code className="text-xs text-moss-calm font-mono block mt-2">
                text-shadow-strong
              </code>
            </div>
            <div className="bg-coal-deep rounded-xl p-6 border border-white/5 text-center">
              <p className="text-shadow-light text-white text-lg">
                Light Shadow
              </p>
              <code className="text-xs text-moss-calm font-mono block mt-2">
                text-shadow-light
              </code>
            </div>
          </div>
        </section>

        {/* Quick Reference */}
        <section>
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">
              Quick Reference
            </h2>
            <p className="text-gray-400">
              Common utility classes and their purposes.
            </p>
          </div>

          <div className="bg-coal-deep rounded-xl p-6 border border-white/5">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium text-gray-300 mb-3">
                  Semantic Colors
                </h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-moss" />
                    <code className="text-moss-calm">moss</code>
                    <span className="text-gray-500">- Success, active</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-sun" />
                    <code className="text-sun-calm">sun</code>
                    <span className="text-gray-500">- Warning, highlight</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-ember" />
                    <code className="text-ember-calm">ember</code>
                    <span className="text-gray-500">- Error, danger</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-coal" />
                    <code className="text-gray-400">coal</code>
                    <span className="text-gray-500">- Surfaces, dark</span>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-300 mb-3">
                  Common Patterns
                </h4>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li>
                    <code className="text-river-calm">bg-coal</code> - Card
                    backgrounds
                  </li>
                  <li>
                    <code className="text-river-calm">border-white/10</code> -
                    Subtle borders
                  </li>
                  <li>
                    <code className="text-river-calm">text-gray-300</code> -
                    Secondary text
                  </li>
                  <li>
                    <code className="text-river-calm">rounded-xl</code> - Card
                    corners
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
};

export default TokensPage;
