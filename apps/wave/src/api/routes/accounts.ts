import { accountHandlers } from '@/api/handlers/accountHandlers';
import { accountValidators } from '@/api/validators/accountValidators';
import { adminMiddleware, authMiddleware } from '@/services/auth';
import { Hono } from 'hono';

type Variables = {
  accountId: number;
};

const accountsRoutes = new Hono<{ Variables: Variables }>();

accountsRoutes.get(
  '/',
  authMiddleware,
  adminMiddleware,
  accountValidators.listQueryValidator,
  accountHandlers.listAccountsHandler,
);

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

accountsRoutes.put(
  '/:id',
  authMiddleware,
  adminMiddleware,
  accountValidators.adminUpdateValidator,
  accountHandlers.adminUpdateAccountHandler,
);

accountsRoutes.delete(
  '/:id',
  authMiddleware,
  adminMiddleware,
  accountHandlers.adminDeleteAccountHandler,
);

accountsRoutes.post(
  '/:id/reset-password',
  authMiddleware,
  adminMiddleware,
  accountValidators.resetPasswordValidator,
  accountHandlers.resetPasswordHandler,
);

export { accountsRoutes };
