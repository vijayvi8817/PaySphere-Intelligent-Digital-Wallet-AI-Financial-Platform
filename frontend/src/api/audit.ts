import api from '@/lib/axios';
import { ApiResponse } from '@/types/api';
import { AuditLog } from '@/types/audit';

export const getMyAuditLogs = async (): Promise<AuditLog[]> => {
  const response = await api.get<ApiResponse<AuditLog[]>>('/audit/me');
  return response.data.data;
};

export const getAdminAuditLogs = async (): Promise<AuditLog[]> => {
  const response = await api.get<ApiResponse<AuditLog[]>>('/admin/audit');
  return response.data.data;
};
