import { desc, eq } from 'drizzle-orm';
import { db } from '../db';
import { audioFiles } from '../schema';

type NewAudioFileData = {
  name: string;
  path: string;
  duration: string;
  size: number;
  format: string;
  uploadedBy: number;
  metadata?: string;
};

const findAudioFileById = async (id: number) => {
  return db.select().from(audioFiles).where(eq(audioFiles.id, id)).get();
};

const findAudioFilesByUploader = async (
  uploadedBy: number,
  limit = 50,
  offset = 0,
) => {
  return db
    .select()
    .from(audioFiles)
    .where(eq(audioFiles.uploadedBy, uploadedBy))
    .orderBy(desc(audioFiles.uploadedAt))
    .limit(limit)
    .offset(offset)
    .all();
};

const createAudioFile = async (data: NewAudioFileData) => {
  const result = await db
    .insert(audioFiles)
    .values(data)
    .returning({ id: audioFiles.id });
  return result[0].id;
};

const updateAudioFile = async (
  id: number,
  data: Partial<Omit<NewAudioFileData, 'uploadedBy'>>,
) => {
  return db.update(audioFiles).set(data).where(eq(audioFiles.id, id));
};

const deleteAudioFile = async (id: number) => {
  return db.delete(audioFiles).where(eq(audioFiles.id, id));
};

export {
  findAudioFileById,
  findAudioFilesByUploader,
  createAudioFile,
  updateAudioFile,
  deleteAudioFile,
  type NewAudioFileData,
};
