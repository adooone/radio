import { accountService } from '@/services/accounts/accountService';
import { ResponseHelper } from '@/utils/response';
import { withErrorHandling } from '@/utils/routeHandler';
import { commonSchemas } from '@/utils/validation';
import type { Context } from 'hono';

export const accountHandlers = {
  get registerHandler() {
    return withErrorHandling(async (c: Context) => {
      const data = await c.req.json();
      const result = await accountService.register(data);
      return ResponseHelper.created(c, result);
    });
  },

  get loginHandler() {
    return withErrorHandling(async (c: Context) => {
      const { username, password } = await c.req.json();
      const result = await accountService.loginByUsername(username, password);
      return ResponseHelper.success(c, result);
    });
  },

  get getCurrentAccountHandler() {
    return withErrorHandling(
      async (c: Context<{ Variables: { accountId: number } }>) => {
        const accountId = c.get('accountId');
        const result = await accountService.getCurrentAccount(accountId);
        return ResponseHelper.success(c, result);
      },
    );
  },

  get updateCurrentAccountHandler() {
    return withErrorHandling(
      async (c: Context<{ Variables: { accountId: number } }>) => {
        const accountId = c.get('accountId');
        const data = await c.req.json();
        const result = await accountService.updateCurrentAccount(
          accountId,
          data,
        );
        return ResponseHelper.success(c, result);
      },
    );
  },

  get deleteCurrentAccountHandler() {
    return withErrorHandling(
      async (c: Context<{ Variables: { accountId: number } }>) => {
        const accountId = c.get('accountId');
        const result = await accountService.deleteCurrentAccount(accountId);
        return ResponseHelper.success(c, result);
      },
    );
  },

  get getAccountByIdHandler() {
    return withErrorHandling(
      async (c: Context<{ Variables: { accountId: number } }>) => {
        const id = commonSchemas.id.parse(c.req.param('id'));
        const result = await accountService.getAccountById(id);
        return ResponseHelper.success(c, result);
      },
    );
  },
};
