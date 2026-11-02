/** @type {import('tailwindcss').Config} */
import { funcPreset } from '@dendelion/func-ui/tailwind';

export default {
  presets: [funcPreset],
  content: [
    './index.html',
    './src/**/*.{css,ts,tsx}',
    '../../packages/stage/src/**/*.tsx',
  ],
  theme: {
    extend: {
      fontWeight: {
        medium: 500,
        bold: 700,
      },
      fontFamily: {
        display: ['Tiny5', 'sans-serif'],
        sans: ['KyivType Sans', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        serif: ['KyivType Serif', 'serif'],
        mono: [
          'JetBrains Mono',
          'Consolas',
          'Monaco',
          'Courier New',
          'monospace',
        ],
      },
      // The strict palette (IDEA-11): the stage's warm black, warm white for
      // reading, the label red, and the glow that lights it. Nothing else.
      colors: {
        ink: '#0a0605',
        cream: '#f5f2ec',
        accent: '#ff5647',
        glow: '#ffb84d',
        // The lit lamp's glass (func-ui's --fui-lamp-red), for lit pills.
        lamp: '#e08b26',
      },
    },
  },
};
