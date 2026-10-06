import type { Context } from 'hono';
import { ErrorHandler } from './errorHandler';
import { ResponseHelper } from './response';

export const withErrorHandling = (
  handler: (c: Context) => Promise<Response> | Response,
) => {
  return async (c: Context) => {
    try {
      return await handler(c);
    } catch (error) {
      return ErrorHandler.handle(error, c);
    }
  };
};

type Variables = {
  accountId: number;
};

export const createHandler = {
  post: <T>(
    handler: (
      data: T,
      c: Context<{ Variables: Variables }>,
    ) => Promise<unknown>,
    status: 200 | 201 = 200,
  ) =>
    withErrorHandling(async (c: Context<{ Variables: Variables }>) => {
      const data = (await c.req.json()) as T;
      const result = await handler(data, c);
      return status === 201
        ? ResponseHelper.created(c, result)
        : ResponseHelper.success(c, result);
    }),

  get: (handler: (c: Context<{ Variables: Variables }>) => Promise<unknown>) =>
    withErrorHandling(async (c: Context<{ Variables: Variables }>) => {
      const result = await handler(c);
      return ResponseHelper.success(c, result);
    }),

  put: <T>(
    handler: (
      data: T,
      c: Context<{ Variables: Variables }>,
    ) => Promise<unknown>,
  ) =>
    withErrorHandling(async (c: Context<{ Variables: Variables }>) => {
      const data = (await c.req.json()) as T;
      const result = await handler(data, c);
      return ResponseHelper.success(c, result);
    }),

  delete: (
    handler: (c: Context<{ Variables: Variables }>) => Promise<unknown>,
  ) =>
    withErrorHandling(async (c: Context<{ Variables: Variables }>) => {
      const result = await handler(c);
      return ResponseHelper.success(c, result);
    }),
};
