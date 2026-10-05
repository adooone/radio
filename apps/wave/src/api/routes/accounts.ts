import { accountHandlers } from '@/api/handlers/accountHandlers';
import { accountValidators } from '@/api/validators/accountValidators';
import { authMiddleware } from '@/services/auth';
import { Hono } from 'hono';

type Variables = {
  accountId: number;
};

const accountsRoutes = new Hono<{ Variables: Variables }>();

accountsRoutes.post(
  '/register',
  accountValidators.registerValidator,
  accountHandlers.registerHandler,
);

accountsRoutes.post(
  '/login',
  accountValidators.loginValidator,
  accountHandlers.loginHandler,
);

accountsRoutes.get(
  '/me',
  authMiddleware,
  accountHandlers.getCurrentAccountHandler,
);

accountsRoutes.put(
  '/me',
  authMiddleware,
  accountValidators.updateValidator,
  accountHandlers.updateCurrentAccountHandler,
);

accountsRoutes.delete(
  '/me',
  authMiddleware,
  accountHandlers.deleteCurrentAccountHandler,
);

accountsRoutes.get(
  '/:id',
  authMiddleware,
  accountHandlers.getAccountByIdHandler,
);

export { accountsRoutes };
