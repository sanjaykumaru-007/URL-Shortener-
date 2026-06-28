import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

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
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
};

export const urlAPI = {
  shorten: (data) => api.post('/urls', data),
  shortenPublic: (data) => api.post('/urls/public', data),
  getUrls: (params) => api.get('/urls', { params }),
  getUrl: (id) => api.get(`/urls/${id}`),
  updateUrl: (id, data) => api.put(`/urls/${id}`, data),
  deleteUrl: (id) => api.delete(`/urls/${id}`),
  getPublicUrl: (shortCode) => api.get(`/urls/public/${shortCode}`),
};

export const analyticsAPI = {
  getDashboardStats: () => api.get('/analytics/dashboard'),
  getUrlAnalytics: (id, timeframe = '7d') => api.get(`/analytics/url/${id}?timeframe=${timeframe}`),
};

export default api;