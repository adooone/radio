import { onAirSchemas } from '@/utils/validation';
import { zValidator } from '@hono/zod-validator';

export const streamValidators = {
  get setOnAirValidator() {
    return zValidator('json', onAirSchemas.set);
  },
};
