import api from '@/lib/api';
// TODO: Implement dashboard service - thống kê, báo cáo
export const dashboardService = {
  getStats: async () => api.get('/dashboard/stats'),
  getRevenueChart: async (params?: object) =>
    api.get('/dashboard/revenue', params),
  getViewsChart: async (params?: object) => api.get('/dashboard/views', params),
  getTopMovies: async (limit?: number) =>
    api.get('/dashboard/top-movies', { limit }),
  getRecentUsers: async (limit?: number) =>
    api.get('/dashboard/recent-users', { limit }),
};
