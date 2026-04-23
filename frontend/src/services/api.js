import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
});

// Añade el token JWT y el idioma activo a cada petición automáticamente
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  const lng = (localStorage.getItem('i18nextLng') || 'es').split('-')[0];
  config.headers['Accept-Language'] = lng === 'en' ? 'en' : 'es';
  return config;
});

// Maneja 401 globalmente
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

export default api;
