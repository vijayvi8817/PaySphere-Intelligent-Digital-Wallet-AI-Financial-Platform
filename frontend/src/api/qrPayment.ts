import apiClient from '@/lib/axios';
import type { ApiResponse, PagedResponse } from '@/types/api';
import type { QrPaymentToken, QrPaymentRequest } from '@/types/qrPayment';
import type { Transfer } from '@/types/transfer';

/**
 * QR Payment API service — generate and process QR code payments.
 */
export const qrPaymentApi = {
  generate: async (data: QrPaymentRequest): Promise<ApiResponse<QrPaymentToken>> => {
    const response = await apiClient.post<ApiResponse<QrPaymentToken>>(
      '/qr-payments/generate',
      data
    );
    return response.data;
  },

  getTokenInfo: async (token: string): Promise<ApiResponse<QrPaymentToken>> => {
    const response = await apiClient.get<ApiResponse<QrPaymentToken>>(
      `/qr-payments/token/${token}`
    );
    return response.data;
  },

  payViaQr: async (
    token: string,
    amount?: number,
    note?: string
  ): Promise<ApiResponse<Transfer>> => {
    const params: Record<string, string | number> = {};
    if (amount) params.amount = amount;
    if (note) params.note = note;
    const response = await apiClient.post<ApiResponse<Transfer>>(
      `/qr-payments/pay/${token}`,
      null,
      { params }
    );
    return response.data;
  },

  getMyCodes: async (
    page = 0,
    size = 20
  ): Promise<ApiResponse<PagedResponse<QrPaymentToken>>> => {
    const response = await apiClient.get<ApiResponse<PagedResponse<QrPaymentToken>>>(
      '/qr-payments/my-codes',
      { params: { page, size } }
    );
    return response.data;
  },
};
