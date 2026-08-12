import apiClient from '@/lib/axios';
import type { ApiResponse, PagedResponse } from '@/types/api';
import type { Notification } from '@/types/notification';

/**
 * Notification API service — notification management.
 */
export const notificationApi = {
  getRecent: async (): Promise<ApiResponse<Notification[]>> => {
    const response = await apiClient.get<ApiResponse<Notification[]>>('/notifications/recent');
    return response.data;
  },

  getAll: async (page = 0, size = 20): Promise<ApiResponse<PagedResponse<Notification>>> => {
    const response = await apiClient.get<ApiResponse<PagedResponse<Notification>>>('/notifications', {
      params: { page, size },
    });
    return response.data;
  },

  getUnreadCount: async (): Promise<ApiResponse<{ count: number }>> => {
    const response = await apiClient.get<ApiResponse<{ count: number }>>('/notifications/unread-count');
    return response.data;
  },

  markAsRead: async (id: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.patch<ApiResponse<void>>(`/notifications/${id}/read`);
    return response.data;
  },

  markAllAsRead: async (): Promise<ApiResponse<void>> => {
    const response = await apiClient.patch<ApiResponse<void>>('/notifications/read-all');
    return response.data;
  },
};
