import api from '@/lib/axios';
import { ApiResponse } from '@/types/api';
import { CurrencyWalletResponse, ExchangeRateResponse, CurrencyExchangeRequest } from '@/types/currencyExchange';

export const getCurrencyWallets = async (): Promise<CurrencyWalletResponse[]> => {
  const response = await api.get<ApiResponse<CurrencyWalletResponse[]>>('/fx/wallets');
  return response.data.data;
};

export const getExchangeRates = async (): Promise<ExchangeRateResponse[]> => {
  const response = await api.get<ApiResponse<ExchangeRateResponse[]>>('/fx/rates');
  return response.data.data;
};

export const convertCurrency = async (request: CurrencyExchangeRequest): Promise<CurrencyWalletResponse> => {
  const response = await api.post<ApiResponse<CurrencyWalletResponse>>('/fx/convert', request);
  return response.data.data;
};
