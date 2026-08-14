import apiClient from '@/lib/axios';

/**
 * Export API service — CSV download endpoints.
 */
export const exportApi = {
  downloadWalletTransactions: async (month?: number, year?: number): Promise<Blob> => {
    const response = await apiClient.get('/export/wallet-transactions', {
      params: { month, year },
      responseType: 'blob',
    });
    return response.data;
  },

  downloadTransfers: async (direction: string = 'all'): Promise<Blob> => {
    const response = await apiClient.get('/export/transfers', {
      params: { direction },
      responseType: 'blob',
    });
    return response.data;
  },
};

/**
 * Triggers a browser file download from a Blob.
 */
export function downloadBlob(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}
