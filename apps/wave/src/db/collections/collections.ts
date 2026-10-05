import { desc, eq } from 'drizzle-orm';
import { db } from '../db';
import { collections } from '../schema';

type NewCollectionData = {
  name: string;
  description?: string;
  isPublic?: boolean;
  ownerId: number;
};

const findCollectionById = async (id: number) => {
  return db.select().from(collections).where(eq(collections.id, id)).get();
};

const findCollectionsByOwner = async (
  ownerId: number,
  limit = 50,
  offset = 0,
) => {
  return db
    .select()
    .from(collections)
    .where(eq(collections.ownerId, ownerId))
    .orderBy(desc(collections.createdAt))
    .limit(limit)
    .offset(offset)
    .all();
};

const findPublicCollections = async (limit = 50, offset = 0) => {
  return db
    .select()
    .from(collections)
    .where(eq(collections.isPublic, 1))
    .orderBy(desc(collections.createdAt))
    .limit(limit)
    .offset(offset)
    .all();
};

const createCollection = async (data: NewCollectionData) => {
  await db.insert(collections).values({
    ...data,
    isPublic: data.isPublic ? 1 : 0,
  });
};

const updateCollection = async (
  id: number,
  data: Partial<Omit<NewCollectionData, 'ownerId'>>,
) => {
  const now = new Date().toISOString();
  const updateData = {
    ...data,
    updatedAt: now,
    isPublic: data.isPublic ? 1 : 0,
  };
  return db.update(collections).set(updateData).where(eq(collections.id, id));
};

const deleteCollection = async (id: number) => {
  return db.delete(collections).where(eq(collections.id, id));
};

export {
  findCollectionById,
  findCollectionsByOwner,
  findPublicCollections,
  createCollection,
  updateCollection,
  deleteCollection,
  type NewCollectionData,
};
