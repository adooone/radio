/** @type {import('tailwindcss').Config} */
import { funcPreset } from '@dendelion/func-ui/tailwind';

export default {
  presets: [funcPreset],
  content: [
    './index.html',
    './src/**/*.{css,ts,tsx}',
    './node_modules/@dendelion/mojo-ui/src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      fontWeight: {
        medium: 500,
        bold: 700,
      },
      fontFamily: {
        display: ['Tiny5', 'sans-serif'],
        sans: ['KyivType Sans', 'sans'],
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
          fog: '#4a4a4a',
          calm: '#3c3c3c',
          DEFAULT: '#2e2e2e',
          deep: '#1f1f1f',
          relic: '#151515',
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
          fog: '#FCF3DA',
          calm: '#f0e6d2',
          DEFAULT: '#d9cbb0',
          deep: '#b8a487',
          relic: '#a39480',
          accent: '#F49517',
        },
        sun: {
          fog: '#ffe7a0',
          calm: '#ffc857',
          DEFAULT: '#ff9f1c',
          deep: '#ff6f00',
          relic: '#d45500',
        },
        ember: {
          fog: '#f2855d',
          calm: '#ff926b',
          DEFAULT: '#e4572e',
          deep: '#bc4b26',
          relic: '#803e2d',
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
