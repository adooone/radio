import type { Context, Next } from 'hono';
import { accountService } from '../accounts/accountService';

type Variables = {
  accountId: number;
};

export const authMiddleware = async (
  c: Context<{ Variables: Variables }>,
  next: Next,
) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ success: false, error: 'Unauthorized' }, 401);
  }

  const token = authHeader.substring(7);

  try {
    const accountId = await accountService.validateSession(token);
    c.set('accountId', accountId);
    await next();
  } catch (error) {
    return c.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : 'Invalid or expired token',
      },
      401,
    );
  }
};
