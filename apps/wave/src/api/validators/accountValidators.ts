import {
  adminUpdateAccountSchema,
  createAccountSchema,
  loginSchema,
  resetPasswordSchema,
  updateAccountSchema,
} from '@/api/schemas';
import { commonSchemas } from '@/utils/validation';
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

  get listQueryValidator() {
    return zValidator('query', commonSchemas.pagination);
  },

  get adminUpdateValidator() {
    return zValidator('json', adminUpdateAccountSchema);
  },

  get resetPasswordValidator() {
    return zValidator('json', resetPasswordSchema);
  },
};
