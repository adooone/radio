import { collectionHandlers } from '@/api/handlers/collectionHandlers';
import { collectionValidators } from '@/api/validators/collectionValidators';
import { authMiddleware } from '@/services/auth';
import { Hono } from 'hono';

type Variables = {
  accountId: number;
};

const collectionsRoutes = new Hono<{ Variables: Variables }>();

collectionsRoutes.get(
  '/public',
  collectionHandlers.getPublicCollectionsHandler,
);

collectionsRoutes.get(
  '/my',
  authMiddleware,
  collectionHandlers.getUserCollectionsHandler,
);

collectionsRoutes.get('/:id', collectionHandlers.getCollectionByIdHandler);

collectionsRoutes.post(
  '/',
  authMiddleware,
  collectionValidators.createValidator,
  collectionHandlers.createCollectionHandler,
);

collectionsRoutes.put(
  '/:id',
  authMiddleware,
  collectionValidators.updateValidator,
  collectionHandlers.updateCollectionHandler,
);

collectionsRoutes.delete(
  '/:id',
  authMiddleware,
  collectionHandlers.deleteCollectionHandler,
);

collectionsRoutes.post(
  '/:id/items',
  authMiddleware,
  collectionValidators.addItemValidator,
  collectionHandlers.addItemToCollectionHandler,
);

collectionsRoutes.delete(
  '/:id/items/:audioFileId',
  authMiddleware,
  collectionHandlers.removeItemFromCollectionHandler,
);

collectionsRoutes.put(
  '/:id/items/reorder',
  authMiddleware,
  collectionValidators.reorderItemsValidator,
  collectionHandlers.reorderCollectionItemsHandler,
);

export { collectionsRoutes };
