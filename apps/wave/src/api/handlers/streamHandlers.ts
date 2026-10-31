import { onAirService } from '@/services/stream/onAirService';
import { ResponseHelper } from '@/utils/response';
import { withErrorHandling } from '@/utils/routeHandler';
import type { Context } from 'hono';

export const streamHandlers = {
  get getOnAirHandler() {
    return withErrorHandling(async (c: Context) => {
      return ResponseHelper.success(c, onAirService.getOnAir());
    });
  },

  get setOnAirHandler() {
    return withErrorHandling(async (c: Context) => {
      const { albumId, songId } = (await c.req.json()) as {
        albumId: number;
        songId?: number;
      };

      const state = await onAirService.setOnAir(albumId, songId);
      return ResponseHelper.success(c, state);
    });
  },

  get clearOnAirHandler() {
    return withErrorHandling(async (c: Context) => {
      onAirService.clearOnAir();
      return ResponseHelper.message(c, 'On-air state cleared successfully');
    });
  },
};
