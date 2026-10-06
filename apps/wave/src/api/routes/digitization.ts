import { digitizationHandlers } from '@/api/handlers/digitizationHandlers';
import { digitizationValidators } from '@/api/validators/digitizationValidators';
import { adminMiddleware, authMiddleware } from '@/services/auth';
import { Hono } from 'hono';

type Variables = {
  accountId: number;
};

const digitizationRoutes = new Hono<{ Variables: Variables }>();

digitizationRoutes.use('*', authMiddleware, adminMiddleware);

digitizationRoutes.get('/drafts', digitizationHandlers.listDraftsHandler);

digitizationRoutes.get('/drafts/:slug', digitizationHandlers.getDraftHandler);

digitizationRoutes.get(
  '/drafts/:slug/cover',
  digitizationHandlers.getDraftCoverHandler,
);

digitizationRoutes.post(
  '/drafts/:slug/metadata',
  digitizationValidators.fetchMetadataValidator,
  digitizationHandlers.fetchDraftMetadataHandler,
);

digitizationRoutes.put(
  '/drafts/:slug/metadata',
  digitizationValidators.updateMetadataValidator,
  digitizationHandlers.updateDraftMetadataHandler,
);

digitizationRoutes.get(
  '/discogs/search',
  digitizationValidators.searchValidator,
  digitizationHandlers.searchDiscogsHandler,
);

digitizationRoutes.post(
  '/drafts/:slug/split/plan',
  digitizationValidators.splitPlanValidator,
  digitizationHandlers.planSplitHandler,
);

digitizationRoutes.post(
  '/drafts/:slug/split/apply',
  digitizationValidators.splitApplyValidator,
  digitizationHandlers.applySplitHandler,
);

digitizationRoutes.get(
  '/drafts/:slug/audio/:file',
  digitizationHandlers.getDraftAudioHandler,
);

digitizationRoutes.post(
  '/drafts/:slug/publish',
  digitizationHandlers.publishDraftHandler,
);

digitizationRoutes.post(
  '/drafts/:slug/cleanup',
  digitizationValidators.cleanupValidator,
  digitizationHandlers.cleanupDraftHandler,
);

digitizationRoutes.get('/jobs/:id', digitizationHandlers.getJobHandler);

export { digitizationRoutes };
