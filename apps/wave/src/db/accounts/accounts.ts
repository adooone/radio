import { asc, count, eq } from 'drizzle-orm';
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

const listAccounts = async (limit: number, offset: number) => {
  return db
    .select({
      id: accounts.id,
      username: accounts.username,
      email: accounts.email,
      role: accounts.role,
      isActive: accounts.isActive,
      lastLoginAt: accounts.lastLoginAt,
      createdAt: accounts.createdAt,
      updatedAt: accounts.updatedAt,
    })
    .from(accounts)
    .orderBy(asc(accounts.id))
    .limit(limit)
    .offset(offset);
};

const countAccounts = async () => {
  const row = await db.select({ total: count() }).from(accounts).get();
  return row?.total ?? 0;
};

const setAccountAdminFields = async (
  id: number,
  data: { role?: string; isActive?: boolean },
) => {
  const now = new Date().toISOString();
  const { isActive, ...rest } = data;
  const result = await db
    .update(accounts)
    .set({
      ...rest,
      ...(isActive === undefined ? {} : { isActive: isActive ? 1 : 0 }),
      updatedAt: now,
    })
    .where(eq(accounts.id, id))
    .returning({ id: accounts.id });
  return result.length > 0;
};

const setAccountPasswordHash = async (id: number, passwordHash: string) => {
  const now = new Date().toISOString();
  const result = await db
    .update(accounts)
    .set({ passwordHash, updatedAt: now })
    .where(eq(accounts.id, id))
    .returning({ id: accounts.id });
  return result.length > 0;
};

export {
  findAccountById,
  findAccountByEmail,
  findAccountByUsername,
  createAccount,
  updateLastLogin,
  updateAccount,
  deleteAccount,
  listAccounts,
  countAccounts,
  setAccountAdminFields,
  setAccountPasswordHash,
  type NewAccountData,
};
