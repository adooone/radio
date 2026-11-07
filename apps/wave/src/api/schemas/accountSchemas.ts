import { z } from 'zod';

export const createAccountSchema = z.object({
  username: z.string().min(3).max(50),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.string().optional().default('user'),
});

export const updateAccountSchema = z.object({
  password: z.string().min(8).optional(),
  role: z.string().optional(),
  isActive: z.boolean().optional(),
});

export const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export const adminUpdateAccountSchema = z.object({
  role: z.string().min(1).optional(),
  isActive: z.boolean().optional(),
});

export const resetPasswordSchema = z.object({
  password: z.string().min(8),
});
