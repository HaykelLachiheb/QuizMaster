import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

export const classAPI = {
  create: (data) => api.post('/classes', data),
  list: () => api.get('/classes'),
  getOne: (id) => api.get(`/classes/${id}`),
  join: (code) => api.post('/classes/join', { code }),
};

export const quizAPI = {
  create: (data) => api.post('/quizzes', data),
  listByClass: (classId) => api.get(`/quizzes/class/${classId}`),
  getOne: (id) => api.get(`/quizzes/${id}`),
  update: (id, data) => api.put(`/quizzes/${id}`, data),
  delete: (id) => api.delete(`/quizzes/${id}`),
  publish: (id) => api.post(`/quizzes/${id}/publish`),
  submit: (id, answers) => api.post(`/quizzes/${id}/submit`, { answers }),
  results: (id) => api.get(`/quizzes/${id}/results`),
  myResults: () => api.get('/quizzes/my-results'),
};

export default api;
