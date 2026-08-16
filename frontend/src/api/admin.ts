import apiClient from '@/lib/axios';
import type { ApiResponse, PagedResponse } from '@/types/api';
import type { AdminStats, AdminUser } from '@/types/admin';
import type { Dispute, DisputeResolveRequest } from '@/types/dispute';

/**
 * Admin API service — admin dashboard, user management, dispute resolution.
 */
export const adminApi = {
  getStats: async (): Promise<ApiResponse<AdminStats>> => {
    const response = await apiClient.get<ApiResponse<AdminStats>>('/admin/stats');
    return response.data;
  },

  getUsers: async (
    page = 0,
    size = 20,
    status?: string,
    search?: string
  ): Promise<ApiResponse<PagedResponse<AdminUser>>> => {
    const params: Record<string, string | number> = { page, size };
    if (status) params.status = status;
    if (search) params.search = search;
    const response = await apiClient.get<ApiResponse<PagedResponse<AdminUser>>>('/admin/users', {
      params,
    });
    return response.data;
  },

  getUserDetail: async (userId: string): Promise<ApiResponse<AdminUser>> => {
    const response = await apiClient.get<ApiResponse<AdminUser>>(`/admin/users/${userId}`);
    return response.data;
  },

  suspendUser: async (userId: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.patch<ApiResponse<void>>(`/admin/users/${userId}/suspend`);
    return response.data;
  },

  activateUser: async (userId: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.patch<ApiResponse<void>>(`/admin/users/${userId}/activate`);
    return response.data;
  },

  getDisputes: async (
    page = 0,
    size = 20,
    status?: string
  ): Promise<ApiResponse<PagedResponse<Dispute>>> => {
    const params: Record<string, string | number> = { page, size };
    if (status) params.status = status;
    const response = await apiClient.get<ApiResponse<PagedResponse<Dispute>>>('/admin/disputes', {
      params,
    });
    return response.data;
  },

  resolveDispute: async (
    disputeId: string,
    data: DisputeResolveRequest
  ): Promise<ApiResponse<Dispute>> => {
    const response = await apiClient.patch<ApiResponse<Dispute>>(
      `/admin/disputes/${disputeId}/resolve`,
      data
    );
    return response.data;
  },
};
