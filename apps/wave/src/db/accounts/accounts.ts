import { eq } from 'drizzle-orm';
import { db } from '../db';
import { accounts } from '../schema';

type NewAccountData = {
  username: string;
  email: string;
  passwordHash: string;
  role?: string;
};

const findAccountById = async (id: number) => {
  return db.select().from(accounts).where(eq(accounts.id, id)).get();
};

const findAccountByEmail = async (email: string) => {
  return db.select().from(accounts).where(eq(accounts.email, email)).get();
};

const findAccountByUsername = async (username: string) => {
  return db
    .select()
    .from(accounts)
    .where(eq(accounts.username, username))
    .get();
};

const createAccount = async (data: NewAccountData) => {
  const now = new Date().toISOString();
  await db.insert(accounts).values({
    ...data,
    lastLoginAt: now,
  });
};

const updateLastLogin = async (id: number) => {
  const now = new Date().toISOString();
  await db
    .update(accounts)
    .set({ lastLoginAt: now })
    .where(eq(accounts.id, id));
};

const updateAccount = async (
  id: number,
  data: Partial<Omit<NewAccountData, 'username' | 'email'>>,
) => {
  const now = new Date().toISOString();
  return db
    .update(accounts)
    .set({ ...data, updatedAt: now })
    .where(eq(accounts.id, id));
};

const deleteAccount = async (id: number) => {
  return db.delete(accounts).where(eq(accounts.id, id));
};

export {
  findAccountById,
  findAccountByEmail,
  findAccountByUsername,
  createAccount,
  updateLastLogin,
  updateAccount,
  deleteAccount,
  type NewAccountData,
};
