import api from '@/lib/api';
// TODO: Implement user service - CRUD users, subscriptions
export const userService = {
  getAll: async (params?: object) => api.get('/users', params),
  getById: async (id: string) => api.get(`/users/${id}`),
  create: async (data: object) => api.post('/users', data),
  update: async (id: string, data: object) => api.put(`/users/${id}`, data),
  delete: async (id: string) => api.delete(`/users/${id}`),
  updateStatus: async (id: string, status: string) =>
    api.patch(`/users/${id}/status`, { status }),
};
