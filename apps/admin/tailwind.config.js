/** @type {import('tailwindcss').Config} */
import { funcPreset } from '@dendelion/func-ui/tailwind';

export default {
  presets: [funcPreset],
  content: ['./index.html', './src/**/*.{css,ts,tsx}'],
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
      colors: {
        ink: '#0a0605',
        cream: '#f5f2ec',
        accent: '#ff5647',
        glow: '#ffb84d',
        moss: {
          fog: '#c4d8c1',
          calm: '#a9c5a2',
          DEFAULT: '#8aa982',
          deep: '#5c7459',
          relic: '#394d37',
          accent: '#15803D',
        },
        bark: {
          fog: '#e2d2b7',
          calm: '#c8b48f',
          DEFAULT: '#a18763',
          deep: '#7a6144',
          relic: '#4e3c2d',
        },
        coal: {
          fog: '#3a322c',
          calm: '#2a231e',
          DEFAULT: '#1a1411',
          deep: '#0f0a08',
          relic: '#0a0605',
        },
        clay: {
          fog: '#fef8f6',
          calm: '#f7cfc4',
          DEFAULT: '#f0a596',
          deep: '#d78878',
          relic: '#aa5a52',
        },
        river: {
          fog: '#c4ddeb',
          calm: '#8ac5e6',
          DEFAULT: '#4b9ac3',
          deep: '#2f6d91',
          relic: '#1a3c57',
        },
        paper: {
          fog: '#f5f2ec',
          calm: '#e6e2da',
          DEFAULT: '#c9c5bc',
          deep: '#a39f96',
          relic: '#807c74',
          accent: '#ff5647',
        },
        sun: {
          fog: '#ffe2b0',
          calm: '#ffcf80',
          DEFAULT: '#ffb84d',
          deep: '#e08b26',
          relic: '#a8651a',
        },
        ember: {
          fog: '#ff9a8f',
          calm: '#ff7b6d',
          DEFAULT: '#ff5647',
          deep: '#d93f31',
          relic: '#8f2b22',
        },
        terracotta: {
          DEFAULT: '#8D4E27',
          dark: '#653517',
        },
        wood: {
          DEFAULT: '#A47551',
          pine: '#CBB89D',
          cedar: '#8B5E3C',
        },
      },
      textShadow: {
        DEFAULT: '1px 1px 2px rgba(0, 0, 0, 0.6)',
        strong: '1px 1px 2px rgba(0, 0, 0, 0.8)',
        light: '1px 1px 2px rgba(255, 255, 255, 0.8)',
      },
      backgroundImage: {
        'gradient-radial':
          'radial-gradient(ellipse at center, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [require('tailwindcss-textshadow'), require('tailwind-scrollbar')],
};
