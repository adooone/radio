import { beforeEach, describe, expect, it, mock } from 'bun:test';

type Row = {
  id: number;
  username: string;
  email: string;
  passwordHash: string;
  role: string;
  isActive: number;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
};

const makeRow = (id: number, role: string): Row => ({
  id,
  username: `user${id}`,
  email: `user${id}@example.com`,
  passwordHash: `secret-hash-${id}`,
  role,
  isActive: 1,
  lastLoginAt: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
});

let rows: Row[] = [];

const withoutHash = ({ passwordHash: _hash, ...rest }: Row) => rest;

mock.module('@/db/accounts/accounts', () => ({
  findAccountById: async (id: number) => rows.find((r) => r.id === id),
  findAccountByEmail: async (email: string) =>
    rows.find((r) => r.email === email),
  findAccountByUsername: async (username: string) =>
    rows.find((r) => r.username === username),
  createAccount: async () => undefined,
  updateLastLogin: async () => undefined,
  updateAccount: async () => undefined,
  deleteAccount: async (id: number) => {
    rows = rows.filter((r) => r.id !== id);
  },
  listAccounts: async (limit: number, offset: number) =>
    rows.slice(offset, offset + limit).map(withoutHash),
  countAccounts: async () => rows.length,
  setAccountAdminFields: async (
    id: number,
    data: { role?: string; isActive?: boolean },
  ) => {
    const row = rows.find((r) => r.id === id);
    if (!row) return false;
    if (data.role !== undefined) row.role = data.role;
    if (data.isActive !== undefined) row.isActive = data.isActive ? 1 : 0;
    return true;
  },
  setAccountPasswordHash: async (id: number, passwordHash: string) => {
    const row = rows.find((r) => r.id === id);
    if (!row) return false;
    row.passwordHash = passwordHash;
    return true;
  },
}));

mock.module('@/db/accounts/sessions', () => ({
  createSession: async () => undefined,
  findSessionByToken: async (token: string) => {
    const accountId = Number(token.replace('token-', ''));
    return { accountId, token, expiresAt: '2999-01-01T00:00:00.000Z' };
  },
}));

const { accountsRoutes } = await import('./accounts');

const call = (
  path: string,
  method: string,
  as: number,
  body?: Record<string, unknown>,
) =>
  accountsRoutes.request(path, {
    method,
    headers: {
      Authorization: `Bearer token-${as}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });

describe('admin account routes', () => {
  beforeEach(() => {
    rows = [makeRow(1, 'admin'), makeRow(2, 'user'), makeRow(3, 'user')];
  });

  it('answers 403 to a non-admin on every route', async () => {
    const responses = await Promise.all([
      call('/', 'GET', 2),
      call('/3', 'PUT', 2, { role: 'admin' }),
      call('/3', 'DELETE', 2),
      call('/3/reset-password', 'POST', 2, { password: 'longenough' }),
    ]);
    expect(responses.map((r) => r.status)).toEqual([403, 403, 403, 403]);
    expect(rows).toHaveLength(3);
    expect(rows[2].role).toBe('user');
  });

  it('answers 401 without a token', async () => {
    const res = await accountsRoutes.request('/', { method: 'GET' });
    expect(res.status).toBe(401);
  });

  it('lists a page of people without the password hash', async () => {
    const res = await call('/?limit=2&offset=1', 'GET', 1);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.data.users.map((u: { id: number }) => u.id)).toEqual([2, 3]);
    expect(body.data.total).toBe(3);
    expect(JSON.stringify(body)).not.toContain('secret-hash');
    expect(JSON.stringify(body)).not.toContain('passwordHash');
    expect(body.data.users[0]).toMatchObject({
      username: 'user2',
      role: 'user',
      isActive: true,
      lastLoginAt: null,
    });
  });

  it('changes role and active flag', async () => {
    const res = await call('/2', 'PUT', 1, { role: 'admin', isActive: false });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.data).toMatchObject({ id: 2, role: 'admin', isActive: false });
    expect(JSON.stringify(body)).not.toContain('secret-hash');
  });

  it('answers 404 when updating a missing account', async () => {
    const res = await call('/99', 'PUT', 1, { isActive: false });
    expect(res.status).toBe(404);
  });

  it('removes another account', async () => {
    const res = await call('/3', 'DELETE', 1);
    expect(res.status).toBe(200);
    expect(rows.map((r) => r.id)).toEqual([1, 2]);
  });

  it('refuses to delete the caller own account', async () => {
    const res = await call('/1', 'DELETE', 1);
    expect(res.status).toBe(400);
    expect(rows.map((r) => r.id)).toEqual([1, 2, 3]);
  });

  it('sets a new password hash', async () => {
    const res = await call('/2/reset-password', 'POST', 1, {
      password: 'brand-new-password',
    });
    expect(res.status).toBe(200);
    expect(rows[1].passwordHash).not.toBe('secret-hash-2');
    expect(rows[1].passwordHash).not.toContain('brand-new-password');
  });

  it('rejects a short password', async () => {
    const res = await call('/2/reset-password', 'POST', 1, {
      password: 'short',
    });
    expect(res.status).toBe(400);
    expect(rows[1].passwordHash).toBe('secret-hash-2');
  });
});
