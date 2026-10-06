import { authService } from '@/services/auth';
import { collectionService } from '@/services/collections';
import { ResponseHelper } from '@/utils/response';
import { withErrorHandling } from '@/utils/routeHandler';
import { commonSchemas } from '@/utils/validation';
import type { Context } from 'hono';

export const collectionHandlers = {
  get getPublicCollectionsHandler() {
    return withErrorHandling(async (c: Context) => {
      const { limit, offset } = commonSchemas.pagination.parse({
        limit: c.req.query('limit'),
        offset: c.req.query('offset'),
      });

      const publicCollections = await collectionService.getPublicCollections(
        limit,
        offset,
      );
      return ResponseHelper.success(c, publicCollections);
    });
  },

  get getUserCollectionsHandler() {
    return withErrorHandling(
      async (c: Context<{ Variables: { accountId: number } }>) => {
        const accountId = c.get('accountId');
        const { limit, offset } = commonSchemas.pagination.parse({
          limit: c.req.query('limit'),
          offset: c.req.query('offset'),
        });

        const userCollections = await collectionService.getUserCollections(
          accountId,
          limit,
          offset,
        );
        return ResponseHelper.success(c, userCollections);
      },
    );
  },

  get getCollectionByIdHandler() {
    return withErrorHandling(async (c: Context) => {
      const id = commonSchemas.id.parse(c.req.param('id'));
      const collection = await collectionService.getCollectionById(id);

      const authHeader = c.req.header('Authorization');
      let accountId: number | undefined;

      if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        const session = await authService.validateToken(token);
        if (session) {
          accountId = session.accountId;
        }
      }

      await collectionService.checkCollectionAccess(collection, accountId);
      const collectionWithItems =
        await collectionService.getCollectionWithItems(id);

      return ResponseHelper.success(c, collectionWithItems);
    });
  },

  get createCollectionHandler() {
    return withErrorHandling(
      async (c: Context<{ Variables: { accountId: number } }>) => {
        const accountId = c.get('accountId');
        const data = await c.req.json();

        await collectionService.createCollection(accountId, data);
        return ResponseHelper.message(
          c,
          'Collection created successfully',
          201,
        );
      },
    );
  },

  get updateCollectionHandler() {
    return withErrorHandling(
      async (c: Context<{ Variables: { accountId: number } }>) => {
        const id = commonSchemas.id.parse(c.req.param('id'));
        const accountId = c.get('accountId');
        const updateData = await c.req.json();

        await collectionService.updateCollection(id, accountId, updateData);
        return ResponseHelper.message(c, 'Collection updated successfully');
      },
    );
  },

  get deleteCollectionHandler() {
    return withErrorHandling(
      async (c: Context<{ Variables: { accountId: number } }>) => {
        const id = commonSchemas.id.parse(c.req.param('id'));
        const accountId = c.get('accountId');

        await collectionService.deleteCollection(id, accountId);
        return ResponseHelper.message(c, 'Collection deleted successfully');
      },
    );
  },

  get addItemToCollectionHandler() {
    return withErrorHandling(
      async (c: Context<{ Variables: { accountId: number } }>) => {
        const collectionId = commonSchemas.id.parse(c.req.param('id'));
        const accountId = c.get('accountId');
        const data = await c.req.json();

        await collectionService.addItemToCollection(
          collectionId,
          accountId,
          data,
        );
        return ResponseHelper.message(
          c,
          'Item added to collection successfully',
          201,
        );
      },
    );
  },

  get removeItemFromCollectionHandler() {
    return withErrorHandling(
      async (c: Context<{ Variables: { accountId: number } }>) => {
        const collectionId = commonSchemas.id.parse(c.req.param('id'));
        const audioFileId = commonSchemas.id.parse(c.req.param('audioFileId'));
        const accountId = c.get('accountId');

        await collectionService.removeItemFromCollection(
          collectionId,
          accountId,
          audioFileId,
        );
        return ResponseHelper.message(
          c,
          'Item removed from collection successfully',
        );
      },
    );
  },

  get reorderCollectionItemsHandler() {
    return withErrorHandling(
      async (c: Context<{ Variables: { accountId: number } }>) => {
        const collectionId = commonSchemas.id.parse(c.req.param('id'));
        const accountId = c.get('accountId');
        const { items } = await c.req.json();

        await collectionService.reorderCollectionItems(
          collectionId,
          accountId,
          items,
        );
        return ResponseHelper.message(c, 'Items reordered successfully');
      },
    );
  },
};
