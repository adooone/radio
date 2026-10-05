import {
  type NewCollectionData,
  type NewCollectionItemData,
  addToCollection,
  createCollection,
  deleteCollection,
  findCollectionById,
  findCollectionsByOwner,
  findPublicCollections,
  getCollectionItems,
  removeFromCollection,
  reorderItems,
  updateCollection,
} from '@/db/collections/index';
import { formatDurationFromString } from '@/utils/audioMetadata';
import { getErrorMessage } from '@/utils/errorMessages';
import { authService } from '../auth';

export class CollectionService {
  async getPublicCollections(limit: number, offset: number) {
    return findPublicCollections(limit, offset);
  }

  async getUserCollections(accountId: number, limit: number, offset: number) {
    return findCollectionsByOwner(accountId, limit, offset);
  }

  async getCollectionById(id: number) {
    const collection = await findCollectionById(id);
    if (!collection) {
      throw new Error(getErrorMessage.collection('NOT_FOUND', id));
    }
    return collection;
  }

  async getCollectionWithItems(id: number) {
    const collection = await this.getCollectionById(id);
    const items = await getCollectionItems(id);
    // Format duration for each item
    const itemsWithFormattedDuration = items.map((item) => ({
      ...item,
      duration: formatDurationFromString(item.duration) || null,
    }));
    return { ...collection, items: itemsWithFormattedDuration };
  }

  async createCollection(
    accountId: number,
    data: Omit<NewCollectionData, 'ownerId'>,
  ) {
    const collectionData: NewCollectionData = {
      ...data,
      ownerId: accountId,
    };
    await createCollection(collectionData);
  }

  async updateCollection(
    id: number,
    accountId: number,
    data: Partial<NewCollectionData>,
  ) {
    const collection = await this.getCollectionById(id);
    await authService.requireOwnership(accountId, collection.ownerId);
    await updateCollection(id, data);
  }

  async deleteCollection(id: number, accountId: number) {
    const collection = await this.getCollectionById(id);
    await authService.requireOwnership(accountId, collection.ownerId);
    await deleteCollection(id);
  }

  async addItemToCollection(
    collectionId: number,
    accountId: number,
    data: Omit<NewCollectionItemData, 'collectionId'>,
  ) {
    const collection = await this.getCollectionById(collectionId);
    await authService.requireOwnership(accountId, collection.ownerId);

    const itemData: NewCollectionItemData = {
      ...data,
      collectionId,
    };
    await addToCollection(itemData);
  }

  async removeItemFromCollection(
    collectionId: number,
    accountId: number,
    audioFileId: number,
  ) {
    const collection = await this.getCollectionById(collectionId);
    await authService.requireOwnership(accountId, collection.ownerId);
    await removeFromCollection(collectionId, audioFileId);
  }

  async reorderCollectionItems(
    collectionId: number,
    accountId: number,
    items: Array<{ id: number; order: number }>,
  ) {
    const collection = await this.getCollectionById(collectionId);
    await authService.requireOwnership(accountId, collection.ownerId);
    await reorderItems(collectionId, items);
  }

  async checkCollectionAccess(
    collection: { isPublic: boolean | number | null; ownerId: number },
    accountId?: number,
  ) {
    if (collection.isPublic) {
      return true;
    }

    if (!accountId) {
      throw new Error(getErrorMessage.auth('UNAUTHORIZED'));
    }

    if (collection.ownerId !== accountId) {
      throw new Error(getErrorMessage.auth('FORBIDDEN'));
    }

    return true;
  }
}

export const collectionService = new CollectionService();
