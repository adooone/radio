import { adminHandlers } from '@/api/handlers/adminHandlers';
import { adminMiddleware, authMiddleware } from '@/services/auth';
import { Hono } from 'hono';

type Variables = {
  accountId: number;
};

const adminRoutes = new Hono<{ Variables: Variables }>();

adminRoutes.get(
  '/stats',
  authMiddleware,
  adminMiddleware,
  adminHandlers.getStatsHandler,
);

export { adminRoutes };
