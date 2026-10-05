import { and, asc, eq } from 'drizzle-orm';
import { db } from '../db';
import { audioFiles, collectionItems } from '../schema';

type NewCollectionItemData = {
  collectionId: number;
  audioFileId: number;
  order?: number;
};

const addToCollection = async (data: NewCollectionItemData) => {
  await db.insert(collectionItems).values({
    ...data,
    order: data.order || 0,
  });
};

const removeFromCollection = async (
  collectionId: number,
  audioFileId: number,
) => {
  return db
    .delete(collectionItems)
    .where(
      and(
        eq(collectionItems.collectionId, collectionId),
        eq(collectionItems.audioFileId, audioFileId),
      ),
    );
};

const getCollectionItems = async (collectionId: number) => {
  return db
    .select({
      id: collectionItems.id,
      collectionId: collectionItems.collectionId,
      audioFileId: collectionItems.audioFileId,
      order: collectionItems.order,
      addedAt: collectionItems.addedAt,
      name: audioFiles.name,
      path: audioFiles.path,
      duration: audioFiles.duration,
      format: audioFiles.format,
    })
    .from(collectionItems)
    .innerJoin(audioFiles, eq(collectionItems.audioFileId, audioFiles.id))
    .where(eq(collectionItems.collectionId, collectionId))
    .orderBy(asc(collectionItems.order))
    .all();
};

const reorderItems = async (
  collectionId: number,
  items: { id: number; order: number }[],
) => {
  for (const item of items) {
    await db
      .update(collectionItems)
      .set({ order: item.order })
      .where(
        and(
          eq(collectionItems.id, item.id),
          eq(collectionItems.collectionId, collectionId),
        ),
      );
  }
};

export {
  addToCollection,
  removeFromCollection,
  getCollectionItems,
  reorderItems,
  type NewCollectionItemData,
};
