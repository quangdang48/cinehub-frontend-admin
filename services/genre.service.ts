import api from '@/lib/api';
// TODO: Implement genre service - CRUD thể loại phim
export const genreService = {
  getAll: async (params?: object) => api.get('/genres', params),
  getById: async (id: string) => api.get(`/genres/${id}`),
  create: async (data: object) => api.post('/genres', data),
  update: async (id: string, data: object) => api.put(`/genres/${id}`, data),
  delete: async (id: string) => api.delete(`/genres/${id}`),
};
