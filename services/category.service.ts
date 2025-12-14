import api from '@/lib/api';
// TODO: Implement category service - CRUD danh mục
export const categoryService = {
  getAll: async (params?: object) => api.get('/categories', params),
  getById: async (id: string) => api.get(`/categories/${id}`),
  create: async (data: object) => api.post('/categories', data),
  update: async (id: string, data: object) =>
    api.put(`/categories/${id}`, data),
  delete: async (id: string) => api.delete(`/categories/${id}`),
};
