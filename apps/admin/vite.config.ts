import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tsconfigPaths from 'vite-tsconfig-paths';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
  // Expose Vercel system env (git metadata) to the client alongside VITE_*.
  envPrefix: ['VITE_', 'VERCEL_'],
  plugins: [
    react(),
    tsconfigPaths(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'Radio Admin Panel',
        short_name: 'Radio Admin',
        description: 'Admin panel for Radio station',
        theme_color: '#8aa982',
        background_color: '#2e2e2e',
        display: 'standalone',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
    }),
  ],
  server: {
    host: true,
    port: 3001,
    fs: {
      allow: ['..', '../..'],
    },
    watch: {
      usePolling: false, // Disable polling - use native file system events (much more efficient)
      ignored: [
        '!**/node_modules/**',
        '**/media/**',
        '**/p-sound/**',
        '/var/www/p-sound/**',
        '**/dist/**',
        '**/.git/**',
      ],
    },
    hmr: {
      // Use page's host so HMR works when accessing via IP (e.g. 192.168.x.x:3001)
      // or when using port forwarding. Avoids ERR_CONNECTION_REFUSED spam.
      protocol: 'ws',
      clientPort: 3001,
    },
  },
  preview: {
    port: 3001,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
  css: {
    postcss: './postcss.config.js',
  },
});
