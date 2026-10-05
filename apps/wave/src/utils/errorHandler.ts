import type { Context } from 'hono';
import { z } from 'zod';
import { getErrorMessage } from './errorMessages';
import { ResponseHelper } from './response';

export const ErrorHandler = {
  handle(error: unknown, c: Context) {
    console.error('Error:', error);

    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map(
        (err) => `${err.path.join('.')}: ${err.message}`,
      );
      return ResponseHelper.error(
        c,
        `Validation error: ${errorMessages.join(', ')}`,
        400,
      );
    }

    if (error instanceof Error) {
      // Handle specific error types with centralized messages
      if (error.message === 'Forbidden') {
        return ResponseHelper.forbidden(c, getErrorMessage.auth('FORBIDDEN'));
      }

      if (error.message === 'Not found') {
        return ResponseHelper.notFound(
          c,
          getErrorMessage.resource('NOT_FOUND'),
        );
      }

      if (error.message === 'Unauthorized') {
        return ResponseHelper.unauthorized(
          c,
          getErrorMessage.auth('UNAUTHORIZED'),
        );
      }

      if (error.message === 'Invalid credentials') {
        return ResponseHelper.unauthorized(
          c,
          getErrorMessage.auth('INVALID_CREDENTIALS'),
        );
      }

      if (error.message === 'Email already exists') {
        return ResponseHelper.error(
          c,
          getErrorMessage.account('EMAIL_EXISTS'),
          409,
        );
      }

      if (error.message === 'Username already exists') {
        return ResponseHelper.error(
          c,
          getErrorMessage.account('USERNAME_EXISTS'),
          409,
        );
      }

      if (error.message === 'Invalid or expired token') {
        return ResponseHelper.unauthorized(
          c,
          getErrorMessage.auth('INVALID_TOKEN'),
        );
      }

      // Handle service-specific errors
      if (error.message.includes('Telegram stream')) {
        return ResponseHelper.error(c, error.message, 500);
      }

      if (error.message.includes('RTMP server')) {
        return ResponseHelper.error(c, error.message, 500);
      }

      if (error.message.includes('Unknown service')) {
        return ResponseHelper.error(c, error.message, 400);
      }

      // Handle account-specific errors
      if (error.message.includes('Account with ID')) {
        return ResponseHelper.notFound(c, error.message);
      }

      if (error.message.includes('Current account with ID')) {
        return ResponseHelper.notFound(c, error.message);
      }

      // Handle collection-specific errors
      if (error.message.includes('Collection with ID')) {
        return ResponseHelper.notFound(c, error.message);
      }

      // Handle digitization/Discogs-specific errors
      if (error.message === 'data.json already exists') {
        return ResponseHelper.conflict(
          c,
          'data.json already exists — pass force to overwrite',
        );
      }

      if (error.message.startsWith('Could not parse a Discogs release id')) {
        return ResponseHelper.error(c, error.message, 400);
      }

      if (error.message === 'Discogs search requires DISCOGS_TOKEN') {
        return ResponseHelper.error(c, error.message, 400);
      }

      if (error.message.startsWith('Discogs API error')) {
        return ResponseHelper.error(c, error.message, 502);
      }

      if (error.message.endsWith('already exists and is not empty')) {
        return ResponseHelper.conflict(c, error.message);
      }

      if (error.message.endsWith('job is already running for this draft')) {
        return ResponseHelper.conflict(c, error.message);
      }

      if (error.message.startsWith('Missing recording:')) {
        return ResponseHelper.notFound(c, error.message);
      }

      if (error.message.startsWith('No side recordings found')) {
        return ResponseHelper.notFound(c, error.message);
      }

      if (
        error.message === 'data.json has no usable tracklist' ||
        error.message.includes('found only') ||
        error.message.includes('computed cut points are out of order') ||
        error.message.startsWith('Invalid side:') ||
        error.message.startsWith('Invalid filename:') ||
        error.message.startsWith('Invalid cut range') ||
        error.message.startsWith('Invalid draft slug') ||
        error.message.includes('need exactly') ||
        error.message.includes('manual cut points must lie within')
      ) {
        return ResponseHelper.error(c, error.message, 400);
      }

      if (
        error.message ===
        'Cannot clean up a draft that has not been published yet'
      ) {
        return ResponseHelper.conflict(c, error.message);
      }

      // Generic error handling
      return ResponseHelper.error(c, error.message, 500);
    }

    return ResponseHelper.error(
      c,
      getErrorMessage.system('INTERNAL_ERROR'),
      500,
    );
  },
};
