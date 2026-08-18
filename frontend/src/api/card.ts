import api from '@/lib/axios';
import { ApiResponse } from '@/types/api';
import { VirtualCard, CardSensitiveDetails, IssueCardRequest } from '@/types/card';

export const getUserCards = async (): Promise<VirtualCard[]> => {
  const response = await api.get<ApiResponse<VirtualCard[]>>('/cards');
  return response.data.data;
};

export const issueCard = async (data: IssueCardRequest): Promise<VirtualCard> => {
  const response = await api.post<ApiResponse<VirtualCard>>('/cards', data);
  return response.data.data;
};

export const toggleFreezeCard = async (cardId: string): Promise<VirtualCard> => {
  const response = await api.patch<ApiResponse<VirtualCard>>(`/cards/${cardId}/freeze`);
  return response.data.data;
};

export const updateCardLimits = async (cardId: string, dailyLimit: number, monthlyLimit: number): Promise<VirtualCard> => {
  const response = await api.patch<ApiResponse<VirtualCard>>(`/cards/${cardId}/limits`, { dailyLimit, monthlyLimit });
  return response.data.data;
};

export const toggleCardSettings = async (cardId: string, settings: { onlinePaymentsEnabled?: boolean; internationalPaymentsEnabled?: boolean; atmWithdrawalsEnabled?: boolean }): Promise<VirtualCard> => {
  const response = await api.patch<ApiResponse<VirtualCard>>(`/cards/${cardId}/settings`, settings);
  return response.data.data;
};

export const revealCardDetails = async (cardId: string): Promise<CardSensitiveDetails> => {
  const response = await api.post<ApiResponse<CardSensitiveDetails>>(`/cards/${cardId}/reveal`);
  return response.data.data;
};

export const updateCardPin = async (cardId: string, pin: string): Promise<VirtualCard> => {
  const response = await api.patch<ApiResponse<VirtualCard>>(`/cards/${cardId}/pin?pin=${pin}`);
  return response.data.data;
};
