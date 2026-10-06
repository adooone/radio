import { ResponseHelper } from '@/utils/response';
import { withErrorHandling } from '@/utils/routeHandler';
import { Hono } from 'hono';
import { rtmpConfigService } from '../../services/stream/rtmpConfigService';
import { streamService } from '../../services/stream/streamService';

const streamRoutes = new Hono();

streamRoutes.post(
  '/rtmp/start',
  withErrorHandling(async (c) => {
    const result = await streamService.startRtmpServer();
    return ResponseHelper.success(c, result);
  }),
);

streamRoutes.post(
  '/rtmp/stop',
  withErrorHandling(async (c) => {
    const result = await streamService.stopRtmpServer();
    return ResponseHelper.success(c, result);
  }),
);

streamRoutes.post(
  '/rtmp/restart',
  withErrorHandling(async (c) => {
    const result = await streamService.restartRtmpServer();
    return ResponseHelper.success(c, result);
  }),
);

streamRoutes.get(
  '/rtmp/config',
  withErrorHandling(async (c) => {
    const config = await rtmpConfigService.getRtmpConfig();
    return ResponseHelper.success(c, { config });
  }),
);

streamRoutes.put(
  '/rtmp/config',
  withErrorHandling(async (c) => {
    const updates = await c.req.json();
    const result = await rtmpConfigService.updateRtmpConfig(updates);
    return ResponseHelper.success(c, result);
  }),
);

export { streamRoutes };
