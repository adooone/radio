import { desc, eq } from 'drizzle-orm';
import { db } from '../db';
import { streamConfigs } from '../schema';

type NewStreamConfigData = {
  name: string;
  rtmpUrl: string;
  streamKey: string;
  inputUrl: string;
  createdBy: number;
};

const findStreamConfigById = async (id: number) => {
  return db.select().from(streamConfigs).where(eq(streamConfigs.id, id)).get();
};

const findActiveStreamConfig = async () => {
  return db
    .select()
    .from(streamConfigs)
    .where(eq(streamConfigs.isActive, 1))
    .get();
};

const findStreamConfigsByCreator = async (createdBy: number) => {
  return db
    .select()
    .from(streamConfigs)
    .where(eq(streamConfigs.createdBy, createdBy))
    .orderBy(desc(streamConfigs.createdAt))
    .all();
};

const createStreamConfig = async (data: NewStreamConfigData) => {
  await db.insert(streamConfigs).values(data);
};

const updateStreamConfig = async (
  id: number,
  data: Partial<Omit<NewStreamConfigData, 'createdBy'>>,
) => {
  const now = new Date().toISOString();
  return db
    .update(streamConfigs)
    .set({ ...data, updatedAt: now })
    .where(eq(streamConfigs.id, id));
};

const setActiveStreamConfig = async (id: number) => {
  // Deactivate all configs first
  await db.update(streamConfigs).set({ isActive: 0 });
  // Activate the selected one
  const now = new Date().toISOString();
  return db
    .update(streamConfigs)
    .set({ isActive: 1, updatedAt: now })
    .where(eq(streamConfigs.id, id));
};

const deleteStreamConfig = async (id: number) => {
  return db.delete(streamConfigs).where(eq(streamConfigs.id, id));
};

export {
  findStreamConfigById,
  findActiveStreamConfig,
  findStreamConfigsByCreator,
  createStreamConfig,
  updateStreamConfig,
  setActiveStreamConfig,
  deleteStreamConfig,
  type NewStreamConfigData,
};
