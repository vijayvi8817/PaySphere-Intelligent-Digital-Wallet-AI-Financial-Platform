import apiClient from '@/lib/axios';
import type { ApiResponse } from '@/types/api';
import type { User } from '@/types';

/**
 * User API service — user profile and management HTTP calls.
 */
export const userApi = {
  getCurrentUser: async (): Promise<ApiResponse<User>> => {
    const response = await apiClient.get<ApiResponse<User>>('/users/me');
    return response.data;
  },

  getUserById: async (userId: string): Promise<ApiResponse<User>> => {
    const response = await apiClient.get<ApiResponse<User>>(`/users/${userId}`);
    return response.data;
  },

  changePassword: async (data: { currentPassword: string; newPassword: string }): Promise<ApiResponse<void>> => {
    const response = await apiClient.put<ApiResponse<void>>('/users/me/password', data);
    return response.data;
  },
};
