import apiClient from '@/lib/axios';
import type { ApiResponse, PagedResponse } from '@/types/api';
import type { RecurringPayment, RecurringPaymentRequest } from '@/types/recurring';

/**
 * Recurring Payments API service.
 */
export const recurringApi = {
  create: async (data: RecurringPaymentRequest): Promise<ApiResponse<RecurringPayment>> => {
    const response = await apiClient.post<ApiResponse<RecurringPayment>>('/recurring-payments', data);
    return response.data;
  },

  getAll: async (page = 0, size = 20): Promise<ApiResponse<PagedResponse<RecurringPayment>>> => {
    const response = await apiClient.get<ApiResponse<PagedResponse<RecurringPayment>>>('/recurring-payments', {
      params: { page, size },
    });
    return response.data;
  },

  getById: async (id: string): Promise<ApiResponse<RecurringPayment>> => {
    const response = await apiClient.get<ApiResponse<RecurringPayment>>(`/recurring-payments/${id}`);
    return response.data;
  },

  pause: async (id: string): Promise<ApiResponse<RecurringPayment>> => {
    const response = await apiClient.patch<ApiResponse<RecurringPayment>>(`/recurring-payments/${id}/pause`);
    return response.data;
  },

  resume: async (id: string): Promise<ApiResponse<RecurringPayment>> => {
    const response = await apiClient.patch<ApiResponse<RecurringPayment>>(`/recurring-payments/${id}/resume`);
    return response.data;
  },

  cancel: async (id: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete<ApiResponse<void>>(`/recurring-payments/${id}`);
    return response.data;
  },
};
