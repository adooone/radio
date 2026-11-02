import react from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import tsconfigPaths from 'vite-tsconfig-paths';

// https://vitejs.dev/config/
export default defineConfig({
  // Expose Vercel system env (git metadata) to the client alongside VITE_*.
  envPrefix: ['VITE_', 'VERCEL_'],
  plugins: [
    react(),
    tsconfigPaths(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [
        'favicon.ico',
        'favicon.svg',
        'favicon-32x32.png',
        'icons/apple-touch-icon.png',
      ],
      manifest: {
        name: 'Radio Admin Panel',
        short_name: 'Radio Admin',
        description: 'Admin panel for Radio station',
        theme_color: '#0a0605',
        background_color: '#0a0605',
        display: 'standalone',
        // The player's icon set, copied as is, so both tabs wear the splat.
        icons: [
          {
            src: 'icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'icons/icon-512x512-maskable.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
    }),
  ],
  server: {
    host: true,
    port: 3001,
    // The dev admin reaches wave through its own origin, so a browser on
    // the tailnet needs only this port open: set VITE_API_URL to the page's
    // origin and point ADMIN_API_PROXY at the wave to use (the local dev
    // wave by default, the pm2 one on 6970 to work against the station).
    proxy: {
      '/api': {
        target: process.env.ADMIN_API_PROXY ?? 'http://localhost:6870',
        changeOrigin: true,
      },
    },
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
