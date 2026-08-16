import apiClient from '@/lib/axios';
import type { ApiResponse, PagedResponse } from '@/types/api';
import type { Dispute, DisputeRequest } from '@/types/dispute';

/**
 * Dispute API service — file and manage transfer disputes.
 */
export const disputeApi = {
  create: async (data: DisputeRequest): Promise<ApiResponse<Dispute>> => {
    const response = await apiClient.post<ApiResponse<Dispute>>('/disputes', data);
    return response.data;
  },

  getById: async (id: string): Promise<ApiResponse<Dispute>> => {
    const response = await apiClient.get<ApiResponse<Dispute>>(`/disputes/${id}`);
    return response.data;
  },

  getAll: async (
    page = 0,
    size = 20
  ): Promise<ApiResponse<PagedResponse<Dispute>>> => {
    const response = await apiClient.get<ApiResponse<PagedResponse<Dispute>>>('/disputes', {
      params: { page, size },
    });
    return response.data;
  },
};
