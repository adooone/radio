// vite.config.ts
import { defineConfig } from "file:///home/croco/dev/radio/node_modules/.pnpm/vite@5.4.9_@types+node@20.16.11_lightningcss@1.27.0_sass@1.93.2_terser@5.46.2/node_modules/vite/dist/node/index.js";
import react from "file:///home/croco/dev/radio/node_modules/.pnpm/@vitejs+plugin-react-swc@3.7.1_vite@5.4.9_@types+node@20.16.11_lightningcss@1.27.0_sass@1.93.2_terser@5.46.2_/node_modules/@vitejs/plugin-react-swc/index.mjs";
import tsconfigPaths from "file:///home/croco/dev/radio/node_modules/.pnpm/vite-tsconfig-paths@5.0.1_typescript@5.6.3_vite@5.4.9_@types+node@20.16.11_lightningcss_640241bfd29161ff7e113b67113d31f5/node_modules/vite-tsconfig-paths/dist/index.js";
import { VitePWA } from "file:///home/croco/dev/radio/node_modules/.pnpm/vite-plugin-pwa@0.19.8_vite@5.4.9_@types+node@20.16.11_lightningcss@1.27.0_sass@1.93.2__2b5e09190165214b87bab6311fc1c1d9/node_modules/vite-plugin-pwa/dist/index.js";
import { resolve } from "node:path";
var __vite_injected_original_dirname = "/home/croco/dev/radio/apps/admin";
var vite_config_default = defineConfig({
  // Expose Vercel system env (git metadata) to the client alongside VITE_*.
  envPrefix: ["VITE_", "VERCEL_"],
  plugins: [
    react(),
    tsconfigPaths(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "apple-touch-icon.png", "masked-icon.svg"],
      manifest: {
        name: "Radio Admin Panel",
        short_name: "Radio Admin",
        description: "Admin panel for Radio station",
        theme_color: "#8aa982",
        background_color: "#2e2e2e",
        display: "standalone",
        icons: [
          {
            src: "pwa-192x192.png",
            sizes: "192x192",
            type: "image/png"
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png"
          }
        ]
      }
    })
  ],
  server: {
    host: true,
    port: 3001,
    fs: {
      allow: ["..", "../.."]
    },
    watch: {
      usePolling: false,
      // Disable polling - use native file system events (much more efficient)
      ignored: [
        "!**/node_modules/**",
        "**/media/**",
        "**/p-sound/**",
        "/var/www/p-sound/**",
        "**/dist/**",
        "**/.git/**"
      ]
    },
    hmr: {
      // Use page's host so HMR works when accessing via IP (e.g. 192.168.x.x:3001)
      // or when using port forwarding. Avoids ERR_CONNECTION_REFUSED spam.
      protocol: "ws",
      clientPort: 3001
    }
  },
  resolve: {
    alias: {
      "@dendelion/mojo-ui": resolve(__vite_injected_original_dirname, "node_modules/@dendelion/mojo-ui/src")
    }
  },
  preview: {
    port: 3001
  },
  build: {
    outDir: "dist",
    sourcemap: true
  },
  css: {
    postcss: "./postcss.config.js"
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9jcm9jby9kZXYvcmFkaW8vYXBwcy9hZG1pblwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL2hvbWUvY3JvY28vZGV2L3JhZGlvL2FwcHMvYWRtaW4vdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL2hvbWUvY3JvY28vZGV2L3JhZGlvL2FwcHMvYWRtaW4vdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJztcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdC1zd2MnO1xuaW1wb3J0IHRzY29uZmlnUGF0aHMgZnJvbSAndml0ZS10c2NvbmZpZy1wYXRocyc7XG5pbXBvcnQgeyBWaXRlUFdBIH0gZnJvbSAndml0ZS1wbHVnaW4tcHdhJztcbmltcG9ydCB7IHJlc29sdmUgfSBmcm9tICdub2RlOnBhdGgnO1xuXG4vLyBodHRwczovL3ZpdGVqcy5kZXYvY29uZmlnL1xuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcbiAgLy8gRXhwb3NlIFZlcmNlbCBzeXN0ZW0gZW52IChnaXQgbWV0YWRhdGEpIHRvIHRoZSBjbGllbnQgYWxvbmdzaWRlIFZJVEVfKi5cbiAgZW52UHJlZml4OiBbJ1ZJVEVfJywgJ1ZFUkNFTF8nXSxcbiAgcGx1Z2luczogW1xuICAgIHJlYWN0KCksXG4gICAgdHNjb25maWdQYXRocygpLFxuICAgIFZpdGVQV0Eoe1xuICAgICAgcmVnaXN0ZXJUeXBlOiAnYXV0b1VwZGF0ZScsXG4gICAgICBpbmNsdWRlQXNzZXRzOiBbJ2Zhdmljb24uaWNvJywgJ2FwcGxlLXRvdWNoLWljb24ucG5nJywgJ21hc2tlZC1pY29uLnN2ZyddLFxuICAgICAgbWFuaWZlc3Q6IHtcbiAgICAgICAgbmFtZTogJ1JhZGlvIEFkbWluIFBhbmVsJyxcbiAgICAgICAgc2hvcnRfbmFtZTogJ1JhZGlvIEFkbWluJyxcbiAgICAgICAgZGVzY3JpcHRpb246ICdBZG1pbiBwYW5lbCBmb3IgUmFkaW8gc3RhdGlvbicsXG4gICAgICAgIHRoZW1lX2NvbG9yOiAnIzhhYTk4MicsXG4gICAgICAgIGJhY2tncm91bmRfY29sb3I6ICcjMmUyZTJlJyxcbiAgICAgICAgZGlzcGxheTogJ3N0YW5kYWxvbmUnLFxuICAgICAgICBpY29uczogW1xuICAgICAgICAgIHtcbiAgICAgICAgICAgIHNyYzogJ3B3YS0xOTJ4MTkyLnBuZycsXG4gICAgICAgICAgICBzaXplczogJzE5MngxOTInLFxuICAgICAgICAgICAgdHlwZTogJ2ltYWdlL3BuZycsXG4gICAgICAgICAgfSxcbiAgICAgICAgICB7XG4gICAgICAgICAgICBzcmM6ICdwd2EtNTEyeDUxMi5wbmcnLFxuICAgICAgICAgICAgc2l6ZXM6ICc1MTJ4NTEyJyxcbiAgICAgICAgICAgIHR5cGU6ICdpbWFnZS9wbmcnLFxuICAgICAgICAgIH0sXG4gICAgICAgIF0sXG4gICAgICB9LFxuICAgIH0pLFxuICBdLFxuICBzZXJ2ZXI6IHtcbiAgICBob3N0OiB0cnVlLFxuICAgIHBvcnQ6IDMwMDEsXG4gICAgZnM6IHtcbiAgICAgIGFsbG93OiBbJy4uJywgJy4uLy4uJ10sXG4gICAgfSxcbiAgICB3YXRjaDoge1xuICAgICAgdXNlUG9sbGluZzogZmFsc2UsIC8vIERpc2FibGUgcG9sbGluZyAtIHVzZSBuYXRpdmUgZmlsZSBzeXN0ZW0gZXZlbnRzIChtdWNoIG1vcmUgZWZmaWNpZW50KVxuICAgICAgaWdub3JlZDogW1xuICAgICAgICAnISoqL25vZGVfbW9kdWxlcy8qKicsXG4gICAgICAgICcqKi9tZWRpYS8qKicsXG4gICAgICAgICcqKi9wLXNvdW5kLyoqJyxcbiAgICAgICAgJy92YXIvd3d3L3Atc291bmQvKionLFxuICAgICAgICAnKiovZGlzdC8qKicsXG4gICAgICAgICcqKi8uZ2l0LyoqJyxcbiAgICAgIF0sXG4gICAgfSxcbiAgICBobXI6IHtcbiAgICAgIC8vIFVzZSBwYWdlJ3MgaG9zdCBzbyBITVIgd29ya3Mgd2hlbiBhY2Nlc3NpbmcgdmlhIElQIChlLmcuIDE5Mi4xNjgueC54OjMwMDEpXG4gICAgICAvLyBvciB3aGVuIHVzaW5nIHBvcnQgZm9yd2FyZGluZy4gQXZvaWRzIEVSUl9DT05ORUNUSU9OX1JFRlVTRUQgc3BhbS5cbiAgICAgIHByb3RvY29sOiAnd3MnLFxuICAgICAgY2xpZW50UG9ydDogMzAwMSxcbiAgICB9LFxuICB9LFxuICByZXNvbHZlOiB7XG4gICAgYWxpYXM6IHtcbiAgICAgICdAZGVuZGVsaW9uL21vam8tdWknOiByZXNvbHZlKF9fZGlybmFtZSwgJ25vZGVfbW9kdWxlcy9AZGVuZGVsaW9uL21vam8tdWkvc3JjJyksXG4gICAgfSxcbiAgfSxcbiAgcHJldmlldzoge1xuICAgIHBvcnQ6IDMwMDEsXG4gIH0sXG4gIGJ1aWxkOiB7XG4gICAgb3V0RGlyOiAnZGlzdCcsXG4gICAgc291cmNlbWFwOiB0cnVlLFxuICB9LFxuICBjc3M6IHtcbiAgICBwb3N0Y3NzOiAnLi9wb3N0Y3NzLmNvbmZpZy5qcycsXG4gIH0sXG59KTtcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBa1IsU0FBUyxvQkFBb0I7QUFDL1MsT0FBTyxXQUFXO0FBQ2xCLE9BQU8sbUJBQW1CO0FBQzFCLFNBQVMsZUFBZTtBQUN4QixTQUFTLGVBQWU7QUFKeEIsSUFBTSxtQ0FBbUM7QUFPekMsSUFBTyxzQkFBUSxhQUFhO0FBQUE7QUFBQSxFQUUxQixXQUFXLENBQUMsU0FBUyxTQUFTO0FBQUEsRUFDOUIsU0FBUztBQUFBLElBQ1AsTUFBTTtBQUFBLElBQ04sY0FBYztBQUFBLElBQ2QsUUFBUTtBQUFBLE1BQ04sY0FBYztBQUFBLE1BQ2QsZUFBZSxDQUFDLGVBQWUsd0JBQXdCLGlCQUFpQjtBQUFBLE1BQ3hFLFVBQVU7QUFBQSxRQUNSLE1BQU07QUFBQSxRQUNOLFlBQVk7QUFBQSxRQUNaLGFBQWE7QUFBQSxRQUNiLGFBQWE7QUFBQSxRQUNiLGtCQUFrQjtBQUFBLFFBQ2xCLFNBQVM7QUFBQSxRQUNULE9BQU87QUFBQSxVQUNMO0FBQUEsWUFDRSxLQUFLO0FBQUEsWUFDTCxPQUFPO0FBQUEsWUFDUCxNQUFNO0FBQUEsVUFDUjtBQUFBLFVBQ0E7QUFBQSxZQUNFLEtBQUs7QUFBQSxZQUNMLE9BQU87QUFBQSxZQUNQLE1BQU07QUFBQSxVQUNSO0FBQUEsUUFDRjtBQUFBLE1BQ0Y7QUFBQSxJQUNGLENBQUM7QUFBQSxFQUNIO0FBQUEsRUFDQSxRQUFRO0FBQUEsSUFDTixNQUFNO0FBQUEsSUFDTixNQUFNO0FBQUEsSUFDTixJQUFJO0FBQUEsTUFDRixPQUFPLENBQUMsTUFBTSxPQUFPO0FBQUEsSUFDdkI7QUFBQSxJQUNBLE9BQU87QUFBQSxNQUNMLFlBQVk7QUFBQTtBQUFBLE1BQ1osU0FBUztBQUFBLFFBQ1A7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsSUFDQSxLQUFLO0FBQUE7QUFBQTtBQUFBLE1BR0gsVUFBVTtBQUFBLE1BQ1YsWUFBWTtBQUFBLElBQ2Q7QUFBQSxFQUNGO0FBQUEsRUFDQSxTQUFTO0FBQUEsSUFDUCxPQUFPO0FBQUEsTUFDTCxzQkFBc0IsUUFBUSxrQ0FBVyxxQ0FBcUM7QUFBQSxJQUNoRjtBQUFBLEVBQ0Y7QUFBQSxFQUNBLFNBQVM7QUFBQSxJQUNQLE1BQU07QUFBQSxFQUNSO0FBQUEsRUFDQSxPQUFPO0FBQUEsSUFDTCxRQUFRO0FBQUEsSUFDUixXQUFXO0FBQUEsRUFDYjtBQUFBLEVBQ0EsS0FBSztBQUFBLElBQ0gsU0FBUztBQUFBLEVBQ1g7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
