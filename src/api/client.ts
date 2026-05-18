import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('imel_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('imel_refresh_token');
        const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken });
        localStorage.setItem('imel_token', data.token);
        originalRequest.headers.Authorization = `Bearer ${data.token}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('imel_token');
        localStorage.removeItem('imel_refresh_token');
        localStorage.removeItem('imel_user');
        // HashRouter-safe: use hash fragment for SPA nav, avoid full page reload
        window.location.hash = '#/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials: unknown) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
  refresh: (refreshToken: string) => api.post('/auth/refresh', { refreshToken }),
  forgotPassword: (data: unknown) => api.post('/auth/forgot-password', data),
  resetPassword: (data: unknown) => api.post('/auth/reset-password', data),
  register: (data: unknown) => api.post('/auth/register', data),
  me: () => api.get('/auth/me'),
};

// Users API
export const usersAPI = {
  getAll: () => api.get('/users'),
  getById: (id: string) => api.get(`/users/${id}`),
  create: (data: unknown) => api.post('/users', data),
  update: (id: string, data: unknown) => api.put(`/users/${id}`, data),
  delete: (id: string) => api.delete(`/users/${id}`),
  changePassword: (data: unknown) => api.post('/users/change-password', data),
  exportCSV: () => api.get('/users/export', { responseType: 'blob' }),
};

// Grades API
export const gradesAPI = {
  get: (params?: unknown) => api.get('/grades', { params }),
  getStudentGrades: (studentId: string) => api.get(`/grades/student/${studentId}`),
  update: (id: string, data: unknown) => api.put(`/grades/${id}`, data),
};

// Schedule API
export const scheduleAPI = {
  get: (params?: unknown) => api.get('/schedule', { params }),
  getSubjects: () => api.get('/schedule/subjects'),
  create: (data: unknown) => api.post('/schedule', data),
  update: (id: string, data: unknown) => api.put(`/schedule/${id}`, data),
  delete: (id: string) => api.delete(`/schedule/${id}`),
};

// Library API
export const libraryAPI = {
  get: (params?: unknown) => api.get('/library', { params }),
  upload: (formData: FormData) =>
    api.post('/library', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  incrementDownload: (id: string) => api.patch(`/library/${id}/download`),
  delete: (id: string) => api.delete(`/library/${id}`),
};

// Messages API
export const messagesAPI = {
  getConversations: () => api.get('/messages/conversations'),
  getInbox: () => api.get('/messages/inbox'),
  getContacts: () => api.get('/messages/contacts'),
  send: (data: unknown) => api.post('/messages', data),
  markRead: (id: string) => api.patch(`/messages/${id}/read`),
};

// Notifications API
export const notificationsAPI = {
  get: () => api.get('/notifications'),
  markRead: (id: string) => api.patch(`/notifications/${id}/read`),
  clear: () => api.delete('/notifications/clear'),
  createAnnouncement: (data: unknown) => api.post('/notifications/announcement', data),
};

// Audit API
export const auditAPI = {
  get: (params?: unknown) => api.get('/audit', { params }),
  export: () => api.get('/audit/export', { responseType: 'blob' }),
};

// Stats API
export const statsAPI = {
  getAcademicStats: () => api.get('/stats/academic'),
  getKPIs: () => api.get('/stats/kpis'),
};

// Profile API
export const profileAPI = {
  getProfile: () => api.get('/profile/me'),
  updateProfile: (data: unknown) => api.put('/profile/me', data),
  exportData: () => api.get('/profile/me/export', { responseType: 'blob' }),
};

// Settings API
export const settingsAPI = {
  get: () => api.get('/settings'),
  update: (data: unknown) => api.put('/settings', data),
};

export default api;
