import { findAccountById } from '@/db/accounts/accounts';
import type { Context, Next } from 'hono';

type Variables = {
  accountId: number;
};

/**
 * Middleware that requires the authenticated user to have the 'admin' role.
 * Must be placed AFTER authMiddleware so that `accountId` is already set.
 */
export const adminMiddleware = async (
  c: Context<{ Variables: Variables }>,
  next: Next,
) => {
  const accountId = c.get('accountId');

  const account = await findAccountById(accountId);
  if (!account || account.role !== 'admin') {
    return c.json(
      { success: false, error: 'Forbidden: admin access required' },
      403,
    );
  }

  await next();
};
