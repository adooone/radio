import { monitoringHandlers } from '@/api/handlers/monitoringHandlers';
import { Hono } from 'hono';

const monitoringRoutes = new Hono();

monitoringRoutes.get('/', monitoringHandlers.getMonitoringDataHandler);

monitoringRoutes.get('/health', monitoringHandlers.getSystemHealthHandler);

monitoringRoutes.get(
  '/telegram',
  monitoringHandlers.getTelegramServiceStatsHandler,
);

monitoringRoutes.get('/rtmp', monitoringHandlers.getRtmpServiceStatsHandler);

monitoringRoutes.get(
  '/metrics/:service',
  monitoringHandlers.getServiceMetricsHandler,
);

monitoringRoutes.get('/logs', monitoringHandlers.getLogsHandler);

monitoringRoutes.get(
  '/logs/:service',
  monitoringHandlers.getServiceLogsHandler,
);

export { monitoringRoutes };
