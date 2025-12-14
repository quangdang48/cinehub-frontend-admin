import api from '@/lib/api';
// TODO: Implement plan service - CRUD gói dịch vụ subscription
export const planService = {
  getAll: async (params?: object) => api.get('/plans', params),
  getById: async (id: string) => api.get(`/plans/${id}`),
  create: async (data: object) => api.post('/plans', data),
  update: async (id: string, data: object) => api.put(`/plans/${id}`, data),
  delete: async (id: string) => api.delete(`/plans/${id}`),
};
