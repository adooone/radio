import type { Context } from 'hono';

type HttpStatus = 200 | 201 | 400 | 401 | 403 | 404 | 409 | 422 | 500 | 502;

export const ResponseHelper = {
  success<T>(c: Context, data: T, status: HttpStatus = 200) {
    return c.json({ success: true, data }, status);
  },

  error(c: Context, message: string, status: HttpStatus = 400) {
    return c.json({ success: false, error: message }, status);
  },

  notFound(c: Context, message = 'Resource not found') {
    return ResponseHelper.error(c, message, 404);
  },

  unauthorized(c: Context, message = 'Unauthorized') {
    return ResponseHelper.error(c, message, 401);
  },

  forbidden(c: Context, message = 'Forbidden') {
    return ResponseHelper.error(c, message, 403);
  },

  created<T>(c: Context, data: T) {
    return ResponseHelper.success(c, data, 201);
  },

  message(c: Context, message: string, status: HttpStatus = 200) {
    return c.json({ success: true, message }, status);
  },

  conflict(c: Context, message = 'Resource conflict') {
    return ResponseHelper.error(c, message, 409);
  },

  unprocessableEntity(c: Context, message = 'Unprocessable entity') {
    return ResponseHelper.error(c, message, 422);
  },
};
