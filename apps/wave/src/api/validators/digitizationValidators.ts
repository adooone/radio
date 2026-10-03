import { digitizationSchemas } from '@/utils/validation';
import { zValidator } from '@hono/zod-validator';

export const digitizationValidators = {
  get fetchMetadataValidator() {
    return zValidator('json', digitizationSchemas.fetchMetadata);
  },

  get updateMetadataValidator() {
    return zValidator('json', digitizationSchemas.updateMetadata);
  },

  get searchValidator() {
    return zValidator('query', digitizationSchemas.search);
  },

  get splitPlanValidator() {
    return zValidator('json', digitizationSchemas.splitPlan);
  },

  get splitApplyValidator() {
    return zValidator('json', digitizationSchemas.splitApply);
  },
};
