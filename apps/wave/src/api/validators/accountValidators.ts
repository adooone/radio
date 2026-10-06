import {
  createAccountSchema,
  loginSchema,
  updateAccountSchema,
} from '@/api/schemas';
import { zValidator } from '@hono/zod-validator';

export const accountValidators = {
  get registerValidator() {
    return zValidator('json', createAccountSchema);
  },

  get loginValidator() {
    return zValidator('json', loginSchema);
  },

  get updateValidator() {
    return zValidator('json', updateAccountSchema);
  },
};
