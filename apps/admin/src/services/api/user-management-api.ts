import { waveApiClient } from './clients/http-client';

type User = {
  id: number;
  username: string;
  email: string;
  role: string;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
};

type CreateUserRequest = {
  username: string;
  email: string;
  password: string;
  role?: string;
};

type UpdateUserRequest = {
  username?: string;
  email?: string;
  role?: string;
  isActive?: boolean;
};

type ApiResponse<T> = {
  success: boolean;
  data: T;
  message?: string;
};

export const userManagementApi = {
  // Get all users (admin only)
  getAllUsers: async (limit = 50, offset = 0): Promise<User[]> => {
    const response = await waveApiClient.get<
      ApiResponse<{ users: User[]; total: number }>
    >(`/api/accounts?limit=${limit}&offset=${offset}`);
    return response.data.data.users;
  },

  // Get user by ID
  getUserById: async (id: number): Promise<User> => {
    const response = await waveApiClient.get<ApiResponse<User>>(
      `/api/accounts/${id}`,
    );
    return response.data.data;
  },

  // Create new user
  createUser: async (
    userData: CreateUserRequest,
  ): Promise<{ message: string }> => {
    const response = await waveApiClient.post<ApiResponse<{ message: string }>>(
      '/api/accounts/register',
      userData,
    );
    return response.data.data;
  },

  // Update user
  updateUser: async (
    id: number,
    userData: UpdateUserRequest,
  ): Promise<User> => {
    const response = await waveApiClient.put<ApiResponse<User>>(
      `/api/accounts/${id}`,
      userData,
    );
    return response.data.data;
  },

  // Delete user
  deleteUser: async (id: number): Promise<void> => {
    await waveApiClient.delete(`/api/accounts/${id}`);
  },

  // Reset user password (admin only)
  resetPassword: async (
    id: number,
    newPassword: string,
  ): Promise<{ message: string }> => {
    const response = await waveApiClient.post<ApiResponse<{ message: string }>>(
      `/api/accounts/${id}/reset-password`,
      { password: newPassword },
    );
    return response.data.data;
  },
};
