/** @type {import('tailwindcss').Config} */
import { mojoPreset } from '@dendelion/mojo-ui/tailwind';

export default {
  presets: [mojoPreset],
  content: [
    './index.html', 
    './src/**/*.{css,ts,tsx}',
    './node_modules/@dendelion/mojo-ui/src/**/*.{ts,tsx}'
  ],
};
