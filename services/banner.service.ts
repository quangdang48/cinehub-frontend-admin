import api from '@/lib/api';
// TODO: Implement banner service - CRUD banner quảng cáo
export const bannerService = {
  getAll: async (params?: object) => api.get('/banners', params),
  getById: async (id: string) => api.get(`/banners/${id}`),
  create: async (data: object) => api.post('/banners', data),
  update: async (id: string, data: object) => api.put(`/banners/${id}`, data),
  delete: async (id: string) => api.delete(`/banners/${id}`),
};
