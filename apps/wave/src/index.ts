import {
  accountsRoutes,
  adminRoutes,
  albumsRoutes,
  audioFilesRoutes,
  collectionsRoutes,
  digitizationRoutes,
  monitoringRoutes,
  streamRoutes,
} from '@/api';
import { env } from '@/utils/env';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { startWsServer } from './ws/server';

const app = new Hono();

app.use(
  '*',
  cors({
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3030',
      'http://127.0.0.1:3001',
      'http://127.0.0.1:3030',
      'http://deimos:3001',
      'http://deimos:3030',
      'https://stream.adoo.one',
      'https://wave.adoo.one',
      'https://pan.adoo.one',
    ],
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
  }),
);

app.get('/health', (c) => {
  return c.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.route('/api/stream', streamRoutes);
app.route('/api/monitoring', monitoringRoutes);
app.route('/api/accounts', accountsRoutes);
app.route('/api/collections', collectionsRoutes);
app.route('/api/audio-files', audioFilesRoutes);
app.route('/api/albums', albumsRoutes);
app.route('/api/admin', adminRoutes);
app.route('/api/digitization', digitizationRoutes);

Bun.serve({
  fetch: app.fetch,
  port: env.port,
  // Bun defaults to 10 s, which kills slow requests mid-transfer — an 8 MB
  // upload chunk over a home uplink routinely needs longer. 255 is Bun's max.
  idleTimeout: 255,
});

startWsServer(env.socketPort);

console.log(`✅ Hono API on: http://localhost:${env.port}`);
console.log(`✅ Socket on: ws://localhost:${env.socketPort}`);
