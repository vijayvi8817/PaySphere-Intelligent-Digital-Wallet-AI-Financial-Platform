import apiClient from '@/lib/axios';
import type { ApiResponse, PagedResponse } from '@/types/api';
import type {
  Wallet,
  WalletDashboard,
  WalletDepositRequest,
  WalletStatement,
  WalletTransaction,
  WalletWithdrawRequest,
} from '@/types/wallet';

/**
 * Wallet API service — all wallet-related HTTP calls.
 */
export const walletApi = {
  getWallet: async (): Promise<ApiResponse<Wallet>> => {
    const response = await apiClient.get<ApiResponse<Wallet>>('/wallet');
    return response.data;
  },

  deposit: async (data: WalletDepositRequest): Promise<ApiResponse<Wallet>> => {
    const response = await apiClient.post<ApiResponse<Wallet>>('/wallet/deposit', data);
    return response.data;
  },

  withdraw: async (data: WalletWithdrawRequest): Promise<ApiResponse<Wallet>> => {
    const response = await apiClient.post<ApiResponse<Wallet>>('/wallet/withdraw', data);
    return response.data;
  },

  freezeWallet: async (): Promise<ApiResponse<Wallet>> => {
    const response = await apiClient.patch<ApiResponse<Wallet>>('/wallet/freeze');
    return response.data;
  },

  unfreezeWallet: async (): Promise<ApiResponse<Wallet>> => {
    const response = await apiClient.patch<ApiResponse<Wallet>>('/wallet/unfreeze');
    return response.data;
  },

  getTransactions: async (
    page = 0,
    size = 20,
    type?: string
  ): Promise<ApiResponse<PagedResponse<WalletTransaction>>> => {
    const params: Record<string, string | number> = { page, size };
    if (type) params.type = type;
    const response = await apiClient.get<ApiResponse<PagedResponse<WalletTransaction>>>(
      '/wallet/transactions',
      { params }
    );
    return response.data;
  },

  getDashboard: async (): Promise<ApiResponse<WalletDashboard>> => {
    const response = await apiClient.get<ApiResponse<WalletDashboard>>('/wallet/dashboard');
    return response.data;
  },

  getStatement: async (month: number, year: number): Promise<ApiResponse<WalletStatement>> => {
    const response = await apiClient.get<ApiResponse<WalletStatement>>('/wallet/statement', {
      params: { month, year },
    });
    return response.data;
  },
};
