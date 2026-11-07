import {
  type NewAccountData,
  countAccounts,
  createAccount,
  createSession,
  deleteAccount,
  findAccountByEmail,
  findAccountById,
  findAccountByUsername,
  findSessionByToken,
  listAccounts,
  setAccountAdminFields,
  setAccountPasswordHash,
  updateAccount,
} from '@/db/accounts/index';
import { getErrorMessage } from '@/utils/errorMessages';
import bcrypt from 'bcryptjs';

export class AccountService {
  async register(data: {
    username: string;
    email: string;
    password: string;
    role?: string;
  }) {
    const { password, ...accountData } = data;

    const existingEmail = await findAccountByEmail(accountData.email);
    if (existingEmail) {
      throw new Error(getErrorMessage.account('EMAIL_EXISTS'));
    }

    const existingUsername = await findAccountByUsername(accountData.username);
    if (existingUsername) {
      throw new Error(getErrorMessage.account('USERNAME_EXISTS'));
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const newAccountData: NewAccountData = {
      ...accountData,
      passwordHash,
      role: accountData.role || 'user',
    };

    await createAccount(newAccountData);
    return { message: 'Account created successfully' };
  }

  async login(email: string, password: string) {
    const account = await findAccountByEmail(email);
    if (!account) {
      throw new Error(getErrorMessage.auth('INVALID_CREDENTIALS'));
    }

    const isValidPassword = await bcrypt.compare(
      password,
      account.passwordHash,
    );
    if (!isValidPassword) {
      throw new Error(getErrorMessage.auth('INVALID_CREDENTIALS'));
    }

    const token = crypto.randomUUID();
    const expiresAt = new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000,
    ).toISOString();

    await createSession({
      accountId: account.id,
      token,
      expiresAt,
    });

    return {
      token,
      account: {
        id: account.id,
        username: account.username,
        email: account.email,
        role: account.role,
      },
    };
  }

  async loginByUsername(username: string, password: string) {
    const account = await findAccountByUsername(username);
    if (!account) {
      throw new Error(getErrorMessage.auth('INVALID_CREDENTIALS'));
    }

    const isValidPassword = await bcrypt.compare(
      password,
      account.passwordHash,
    );
    if (!isValidPassword) {
      throw new Error(getErrorMessage.auth('INVALID_CREDENTIALS'));
    }

    const token = crypto.randomUUID();
    const expiresAt = new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000,
    ).toISOString();

    await createSession({
      accountId: account.id,
      token,
      expiresAt,
    });

    return {
      token,
      account: {
        id: account.id,
        username: account.username,
        email: account.email,
        role: account.role,
      },
    };
  }

  async getCurrentAccount(accountId: number) {
    const account = await findAccountById(accountId);
    if (!account) {
      throw new Error(getErrorMessage.account('CURRENT_NOT_FOUND', accountId));
    }
    return this.formatAccountResponse(account);
  }

  async getAccountById(id: number) {
    const account = await findAccountById(id);
    if (!account) {
      throw new Error(getErrorMessage.account('NOT_FOUND', id));
    }
    return this.formatAccountResponse(account);
  }

  async updateCurrentAccount(
    accountId: number,
    data: {
      password?: string;
      role?: string;
      isActive?: boolean;
    },
  ) {
    const updateData: Record<string, unknown> = { ...data };

    if (updateData.password) {
      updateData.passwordHash = await bcrypt.hash(
        updateData.password as string,
        12,
      );
      const { password, ...rest } = updateData;
      Object.assign(updateData, rest);
    }

    await updateAccount(accountId, updateData);
    return { message: 'Account updated successfully' };
  }

  async deleteCurrentAccount(accountId: number) {
    await deleteAccount(accountId);
    return { message: 'Account deleted successfully' };
  }

  async listAccounts(limit: number, offset: number) {
    const [rows, total] = await Promise.all([
      listAccounts(limit, offset),
      countAccounts(),
    ]);
    return {
      users: rows.map((row) => ({
        ...this.formatAccountResponse(row),
        updatedAt: row.updatedAt || row.createdAt || new Date().toISOString(),
      })),
      total,
      limit,
      offset,
    };
  }

  async updateAccountByAdmin(
    id: number,
    data: { role?: string; isActive?: boolean },
  ) {
    const found = await setAccountAdminFields(id, data);
    if (!found) {
      throw new Error(getErrorMessage.account('NOT_FOUND', id));
    }
    return this.getAccountById(id);
  }

  async deleteAccountByAdmin(id: number, callerId: number) {
    if (id === callerId) {
      throw new Error(getErrorMessage.account('CANNOT_DELETE_SELF'));
    }
    const existing = await findAccountById(id);
    if (!existing) {
      throw new Error(getErrorMessage.account('NOT_FOUND', id));
    }
    await deleteAccount(id);
    return { message: getErrorMessage.account('DELETED_SUCCESS') };
  }

  async resetPassword(id: number, password: string) {
    if (password.length < 8) {
      throw new Error(getErrorMessage.validation('INVALID_PASSWORD'));
    }
    const passwordHash = await bcrypt.hash(password, 12);
    const found = await setAccountPasswordHash(id, passwordHash);
    if (!found) {
      throw new Error(getErrorMessage.account('NOT_FOUND', id));
    }
    return { message: getErrorMessage.account('PASSWORD_RESET_SUCCESS') };
  }

  async resetPasswordByUsername(username: string, password: string) {
    const account = await findAccountByUsername(username);
    if (!account) {
      throw new Error(getErrorMessage.account('USERNAME_NOT_FOUND', username));
    }
    await this.resetPassword(account.id, password);
    return { id: account.id, username: account.username };
  }

  async validateSession(token: string) {
    const session = await findSessionByToken(token);
    if (!session || new Date(session.expiresAt) < new Date()) {
      throw new Error(getErrorMessage.auth('INVALID_TOKEN'));
    }
    return session.accountId;
  }

  formatAccountResponse(account: {
    id: number;
    username: string;
    email: string;
    role: string | null;
    isActive: boolean | number | null;
    lastLoginAt: string | null;
    createdAt: string | null;
  }) {
    return {
      id: account.id,
      username: account.username,
      email: account.email,
      role: account.role || 'user',
      isActive: Boolean(account.isActive),
      lastLoginAt: account.lastLoginAt,
      createdAt: account.createdAt || new Date().toISOString(),
    };
  }
}

export const accountService = new AccountService();
