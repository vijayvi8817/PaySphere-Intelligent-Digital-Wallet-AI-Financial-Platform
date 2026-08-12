import apiClient from '@/lib/axios';
import type { ApiResponse, PagedResponse } from '@/types/api';
import type {
  Transfer,
  TransferRequest,
  TransferSummary,
  Beneficiary,
  BeneficiaryRequest,
} from '@/types/transfer';

/**
 * Transfer API service — all P2P transfer-related HTTP calls.
 */
export const transferApi = {
  sendMoney: async (data: TransferRequest): Promise<ApiResponse<Transfer>> => {
    const response = await apiClient.post<ApiResponse<Transfer>>('/transfers', data);
    return response.data;
  },

  getTransfer: async (id: string): Promise<ApiResponse<Transfer>> => {
    const response = await apiClient.get<ApiResponse<Transfer>>(`/transfers/${id}`);
    return response.data;
  },

  getTransfers: async (
    page = 0,
    size = 20,
    direction?: string,
    status?: string
  ): Promise<ApiResponse<PagedResponse<Transfer>>> => {
    const params: Record<string, string | number> = { page, size };
    if (direction) params.direction = direction;
    if (status) params.status = status;
    const response = await apiClient.get<ApiResponse<PagedResponse<Transfer>>>('/transfers', {
      params,
    });
    return response.data;
  },

  searchTransfers: async (
    keyword: string,
    page = 0,
    size = 20
  ): Promise<ApiResponse<PagedResponse<Transfer>>> => {
    const response = await apiClient.get<ApiResponse<PagedResponse<Transfer>>>(
      '/transfers/search',
      { params: { keyword, page, size } }
    );
    return response.data;
  },

  getSummary: async (): Promise<ApiResponse<TransferSummary>> => {
    const response = await apiClient.get<ApiResponse<TransferSummary>>('/transfers/summary');
    return response.data;
  },
};

/**
 * Beneficiary API service — saved transfer recipients.
 */
export const beneficiaryApi = {
  getAll: async (): Promise<ApiResponse<Beneficiary[]>> => {
    const response = await apiClient.get<ApiResponse<Beneficiary[]>>('/beneficiaries');
    return response.data;
  },

  getFavorites: async (): Promise<ApiResponse<Beneficiary[]>> => {
    const response = await apiClient.get<ApiResponse<Beneficiary[]>>('/beneficiaries/favorites');
    return response.data;
  },

  add: async (data: BeneficiaryRequest): Promise<ApiResponse<Beneficiary>> => {
    const response = await apiClient.post<ApiResponse<Beneficiary>>('/beneficiaries', data);
    return response.data;
  },

  toggleFavorite: async (id: string): Promise<ApiResponse<Beneficiary>> => {
    const response = await apiClient.patch<ApiResponse<Beneficiary>>(
      `/beneficiaries/${id}/favorite`
    );
    return response.data;
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete<ApiResponse<void>>(`/beneficiaries/${id}`);
    return response.data;
  },
};
