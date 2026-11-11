import { onAirSchemas, rotationSchemas } from '@/utils/validation';
import { zValidator } from '@hono/zod-validator';

export const streamValidators = {
  get setOnAirValidator() {
    return zValidator('json', onAirSchemas.set);
  },
  get setRotationValidator() {
    return zValidator('json', rotationSchemas.set);
  },
  get playNextValidator() {
    return zValidator('json', rotationSchemas.playNext);
  },
};
