/** @type {import('tailwindcss').Config} */
export const mojoPreset = {
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
        mono: ['JetBrains Mono', 'Consolas', 'Monaco', 'Courier New', 'monospace'],
      },
      colors: {
        moss: {
          fog: '#c4d8c1', // розмитий зелений
          calm: '#a9c5a2', // туманна хвоя
          DEFAULT: '#8aa982', // спокійна зелень
          deep: '#5c7459', // глибина лісу
          relic: '#394d37', // мох у тіні
          accent: '#15803D',
        },
        bark: {
          fog: '#e2d2b7', // стара деревина
          calm: '#c8b48f', // тепла кора
          DEFAULT: '#a18763', // серцевина дерева
          deep: '#7a6144', // груба текстура
          relic: '#4e3c2d', // обпалена кора
        },
        coal: {
          fog: '#4a4a4a', // найдужчий світлий попіл
          calm: '#3c3c3c', // пил
          DEFAULT: '#2e2e2e', // вугілля
          deep: '#1f1f1f', // ядро
          relic: '#151515',
        },
        clay: {
          fog: '#fef8f6', // шепіт глини
          calm: '#f7cfc4', // рум'янець
          DEFAULT: '#f0a596', // тепло з печі
          deep: '#d78878', // обпалена глина
          relic: '#aa5a52', // глина з глибини
        },
        river: {
          fog: '#c4ddeb', // туман над річкою
          calm: '#8ac5e6', // течія
          DEFAULT: '#4b9ac3', // глибока вода
          deep: '#2f6d91', // берег
          relic: '#1a3c57', // нічне відображення
        },
        paper: {
          fog: '#FCF3DA', // напівпрозорість
          calm: '#f0e6d2', // стара сторінка
          DEFAULT: '#d9cbb0', // згин
          deep: '#b8a487', // рукопис
          relic: '#a39480', // запилений край
          accent: '#F49517',
        },
        sun: {
          fog: '#ffe7a0', // м'яке сонце
          calm: '#ffc857', // промінь
          DEFAULT: '#ff9f1c', // полум'я
          deep: '#ff6f00', // серце світла
          relic: '#d45500', // згасаюча зірка
        },
        ember: {
          fog: '#f2855d', // мʼяке світло
          calm: '#ff926b', // спалах
          DEFAULT: '#e4572e', // жаринка
          deep: '#bc4b26', // почервоніле вугілля
          relic: '#803e2d', // обпалене ядро
        },
        // Legacy colors for backward compatibility
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
        'gradient-radial': 'radial-gradient(ellipse at center, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [require('tailwindcss-textshadow'), require('tailwind-scrollbar')],
};

export default mojoPreset;
