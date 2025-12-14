import api from '@/lib/api';
// TODO: Implement transaction service - quản lý giao dịch thanh toán
export const transactionService = {
  getAll: async (params?: object) => api.get('/transactions', params),
  getById: async (id: string) => api.get(`/transactions/${id}`),
  refund: async (id: string) => api.post(`/transactions/${id}/refund`),
};
