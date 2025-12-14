import api from '@/lib/api';
// TODO: Implement movie service - CRUD phim, episodes, upload video
export const movieService = {
  getAll: async (params?: object) => api.get('/movies', params),
  getById: async (id: string) => api.get(`/movies/${id}`),
  create: async (data: object) => api.post('/movies', data),
  update: async (id: string, data: object) => api.put(`/movies/${id}`, data),
  delete: async (id: string) => api.delete(`/movies/${id}`),
  // Episodes
  getEpisodes: async (movieId: string) =>
    api.get(`/movies/${movieId}/episodes`),
  createEpisode: async (movieId: string, data: object) =>
    api.post(`/movies/${movieId}/episodes`, data),
  updateEpisode: async (movieId: string, episodeId: string, data: object) =>
    api.put(`/movies/${movieId}/episodes/${episodeId}`, data),
  deleteEpisode: async (movieId: string, episodeId: string) =>
    api.delete(`/movies/${movieId}/episodes/${episodeId}`),
};
