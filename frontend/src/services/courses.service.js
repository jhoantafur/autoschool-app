import { api } from '@/lib/api';

const unwrapList = (data) => data.results || data;

export const coursesService = {
  list: async () => {
    const response = await api.get('/courses/');
    return unwrapList(response.data);
  },

  getById: async (id) => {
    const response = await api.get(`/courses/${id}/`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/courses/', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.patch(`/courses/${id}/`, data);
    return response.data;
  },

  remove: async (id) => {
    await api.delete(`/courses/${id}/`);
  },
};
