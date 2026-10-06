import { statsService } from '@/services/admin/statsService';
import { ResponseHelper } from '@/utils/response';
import { withErrorHandling } from '@/utils/routeHandler';
import type { Context } from 'hono';

export const adminHandlers = {
  get getStatsHandler() {
    return withErrorHandling(async (c: Context) => {
      const stats = await statsService.getStats();
      return ResponseHelper.success(c, stats);
    });
  },
};
