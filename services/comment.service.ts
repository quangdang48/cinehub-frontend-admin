import api from '@/lib/api';
// TODO: Implement comment service - quản lý bình luận, đánh giá
export const commentService = {
  getAll: async (params?: object) => api.get('/comments', params),
  getById: async (id: string) => api.get(`/comments/${id}`),
  updateStatus: async (id: string, status: string) =>
    api.patch(`/comments/${id}/status`, { status }),
  delete: async (id: string) => api.delete(`/comments/${id}`),
};
