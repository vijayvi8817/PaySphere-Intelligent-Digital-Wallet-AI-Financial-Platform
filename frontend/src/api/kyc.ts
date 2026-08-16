import api from '@/lib/axios';
import { ApiResponse } from '@/types/api';
import { KycSubmissionRequest, KycDocumentResponse, KycReviewRequest } from '@/types/kyc';

export const submitKyc = async (request: KycSubmissionRequest): Promise<KycDocumentResponse> => {
  const response = await api.post<ApiResponse<KycDocumentResponse>>('/kyc', request);
  return response.data.data;
};

export const getLatestKyc = async (): Promise<KycDocumentResponse | null> => {
  const response = await api.get<ApiResponse<KycDocumentResponse>>('/kyc/latest');
  return response.data.data;
};

export const getKycHistory = async (): Promise<KycDocumentResponse[]> => {
  const response = await api.get<ApiResponse<KycDocumentResponse[]>>('/kyc/history');
  return response.data.data;
};

export const getPendingKycSubmissions = async (page = 0, size = 10) => {
  const response = await api.get('/admin/kyc', { params: { page, size } });
  return response.data.data;
};

export const reviewKycSubmission = async (kycId: string, request: KycReviewRequest): Promise<KycDocumentResponse> => {
  const response = await api.patch<ApiResponse<KycDocumentResponse>>(`/admin/kyc/${kycId}/review`, request);
  return response.data.data;
};
