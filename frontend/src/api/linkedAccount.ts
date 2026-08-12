import apiClient from '@/lib/axios';
import type { ApiResponse } from '@/types/api';
import type { LinkedAccount, LinkedAccountRequest } from '@/types/linkedAccount';

/**
 * Linked Account API service — bank account management.
 */
export const linkedAccountApi = {
  getAccounts: async (): Promise<ApiResponse<LinkedAccount[]>> => {
    const response = await apiClient.get<ApiResponse<LinkedAccount[]>>('/linked-accounts');
    return response.data;
  },

  getAccount: async (id: string): Promise<ApiResponse<LinkedAccount>> => {
    const response = await apiClient.get<ApiResponse<LinkedAccount>>(`/linked-accounts/${id}`);
    return response.data;
  },

  addAccount: async (data: LinkedAccountRequest): Promise<ApiResponse<LinkedAccount>> => {
    const response = await apiClient.post<ApiResponse<LinkedAccount>>('/linked-accounts', data);
    return response.data;
  },

  updateAccount: async (id: string, data: LinkedAccountRequest): Promise<ApiResponse<LinkedAccount>> => {
    const response = await apiClient.put<ApiResponse<LinkedAccount>>(`/linked-accounts/${id}`, data);
    return response.data;
  },

  deleteAccount: async (id: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete<ApiResponse<void>>(`/linked-accounts/${id}`);
    return response.data;
  },

  setPrimary: async (id: string): Promise<ApiResponse<LinkedAccount>> => {
    const response = await apiClient.patch<ApiResponse<LinkedAccount>>(`/linked-accounts/${id}/primary`);
    return response.data;
  },

  verifyAccount: async (id: string): Promise<ApiResponse<LinkedAccount>> => {
    const response = await apiClient.patch<ApiResponse<LinkedAccount>>(`/linked-accounts/${id}/verify`);
    return response.data;
  },
};
