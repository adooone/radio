import { monitoringService } from '@/services/monitoring/monitoringService';
import { ResponseHelper } from '@/utils/response';
import { withErrorHandling } from '@/utils/routeHandler';
import { commonSchemas } from '@/utils/validation';
import type { Context } from 'hono';

export const monitoringHandlers = {
  get getMonitoringDataHandler() {
    return withErrorHandling(async (c: Context) => {
      const data = await monitoringService.getMonitoringData();
      return ResponseHelper.success(c, data);
    });
  },

  get getSystemHealthHandler() {
    return withErrorHandling(async (c: Context) => {
      const data = await monitoringService.getSystemHealth();
      return ResponseHelper.success(c, data);
    });
  },

  get getTelegramServiceStatsHandler() {
    return withErrorHandling(async (c: Context) => {
      const data = await monitoringService.getTelegramServiceStats();
      return ResponseHelper.success(c, data);
    });
  },

  get getRtmpServiceStatsHandler() {
    return withErrorHandling(async (c: Context) => {
      const data = await monitoringService.getRtmpServiceStats();
      return ResponseHelper.success(c, data);
    });
  },

  get getServiceMetricsHandler() {
    return withErrorHandling(async (c: Context) => {
      const service = c.req.param('service');

      if (service === 'telegram') {
        const data = await monitoringService.getTelegramServiceStats();
        return ResponseHelper.success(c, data);
      }

      if (service === 'rtmp') {
        const data = await monitoringService.getRtmpServiceStats();
        return ResponseHelper.success(c, data);
      }

      return ResponseHelper.error(
        c,
        'Invalid service. Use "telegram" or "rtmp"',
        400,
      );
    });
  },

  get getLogsHandler() {
    return withErrorHandling(async (c: Context) => {
      const source = c.req.query('source') || 'all';
      const { limit: lines } = commonSchemas.pagination.parse({
        limit: c.req.query('lines'),
      });

      const data = await monitoringService.getLogs(source, lines);
      return ResponseHelper.success(c, data);
    });
  },

  get getServiceLogsHandler() {
    return withErrorHandling(async (c: Context) => {
      const service = c.req.param('service');
      const { limit: lines } = commonSchemas.pagination.parse({
        limit: c.req.query('lines'),
      });

      const data = await monitoringService.getServiceLogs(service, lines);
      return ResponseHelper.success(c, data);
    });
  },
};
