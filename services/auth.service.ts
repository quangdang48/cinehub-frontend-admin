import api from '@/lib/api';
// TODO: Implement auth service - login, logout, profile, password
export const authService = {
  login: async (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  logout: async () => api.post('/auth/logout'),
  getProfile: async () => api.get('/auth/profile'),
};
