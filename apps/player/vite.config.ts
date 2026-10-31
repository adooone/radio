/// <reference types="vitest/config" />

import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vite';
import tsPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [react(), tsPaths(), tailwindcss()],
  server: {
    host: true,
    port: 3030,
    // Dev box reachable over the tailnet by its MagicDNS name.
    allowedHosts: ['deimos', '.ts.net'],
  },
  preview: {
    port: 3030,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/tests/setup.ts'],
  },
});
