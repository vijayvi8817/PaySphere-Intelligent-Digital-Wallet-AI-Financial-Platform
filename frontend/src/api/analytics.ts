import apiClient from '@/lib/axios';
import type { ApiResponse } from '@/types/api';
import type { Analytics } from '@/types/analytics';

/**
 * Analytics API service — financial analytics and insights.
 */
export const analyticsApi = {
  getAnalytics: async (months = 6): Promise<ApiResponse<Analytics>> => {
    const response = await apiClient.get<ApiResponse<Analytics>>('/analytics', {
      params: { months },
    });
    return response.data;
  },
};
