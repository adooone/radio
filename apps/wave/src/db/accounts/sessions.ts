import { desc, eq, lt } from 'drizzle-orm';
import { db } from '../db';
import { sessions } from '../schema';

type NewSessionData = {
  accountId: number;
  token: string;
  expiresAt: string;
};

const findSessionByToken = async (token: string) => {
  return db.select().from(sessions).where(eq(sessions.token, token)).get();
};

const findSessionsByAccount = async (accountId: number) => {
  return db
    .select()
    .from(sessions)
    .where(eq(sessions.accountId, accountId))
    .orderBy(desc(sessions.createdAt))
    .all();
};

const createSession = async (data: NewSessionData) => {
  await db.insert(sessions).values(data);
};

const updateLastUsed = async (id: number) => {
  const now = new Date().toISOString();
  await db.update(sessions).set({ lastUsedAt: now }).where(eq(sessions.id, id));
};

const deleteSession = async (id: number) => {
  return db.delete(sessions).where(eq(sessions.id, id));
};

const deleteExpiredSessions = async () => {
  const now = new Date().toISOString();
  return db.delete(sessions).where(lt(sessions.expiresAt, now));
};

export {
  findSessionByToken,
  findSessionsByAccount,
  createSession,
  updateLastUsed,
  deleteSession,
  deleteExpiredSessions,
  type NewSessionData,
};
