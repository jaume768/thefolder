import api from './api';

export const login = (email, password) =>
  api.post('/api/auth/login', { email, password });

export const register = (userData) =>
  api.post('/api/auth/register', userData);

export const requestPasswordReset = (email) =>
  api.post('/api/auth/request-reset', { email });

export const resetPassword = (token, newPassword) =>
  api.post('/api/auth/reset-password', { token, newPassword });

export const logout = () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
};
