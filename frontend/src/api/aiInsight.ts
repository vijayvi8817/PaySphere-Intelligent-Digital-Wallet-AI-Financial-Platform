import api from '@/lib/axios';
import { ApiResponse } from '@/types/api';
import { AiAdvisorResponse } from '@/types/aiInsight';

export const getAiAdvisorSummary = async (): Promise<AiAdvisorResponse> => {
  const response = await api.get<ApiResponse<AiAdvisorResponse>>('/ai/advisor');
  return response.data.data;
};

export const askAiAdvisor = async (prompt: string): Promise<AiAdvisorResponse> => {
  const response = await api.post<ApiResponse<AiAdvisorResponse>>('/ai/ask', { prompt });
  return response.data.data;
};
