import api from '@/lib/axios';
import { ApiResponse } from '@/types/api';
import { SavingsGoal, SavingsSummary, CreateSavingsGoalRequest } from '@/types/savings';

export const getSavingsSummary = async (): Promise<SavingsSummary> => {
  const response = await api.get<ApiResponse<SavingsSummary>>('/savings');
  return response.data.data;
};

export const createSavingsGoal = async (data: CreateSavingsGoalRequest): Promise<SavingsGoal> => {
  const response = await api.post<ApiResponse<SavingsGoal>>('/savings', data);
  return response.data.data;
};

export const depositToSavingsGoal = async (goalId: string, amount: number): Promise<SavingsGoal> => {
  const response = await api.post<ApiResponse<SavingsGoal>>(`/savings/${goalId}/deposit`, { amount });
  return response.data.data;
};

export const withdrawFromSavingsGoal = async (goalId: string, amount: number): Promise<SavingsGoal> => {
  const response = await api.post<ApiResponse<SavingsGoal>>(`/savings/${goalId}/withdraw`, { amount });
  return response.data.data;
};

export const toggleAutoRoundup = async (goalId: string): Promise<SavingsGoal> => {
  const response = await api.patch<ApiResponse<SavingsGoal>>(`/savings/${goalId}/roundup`);
  return response.data.data;
};

export const deleteSavingsGoal = async (goalId: string): Promise<void> => {
  await api.delete(`/savings/${goalId}`);
};
