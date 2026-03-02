import api from './api';

export const getMyProfile = () =>
  api.get('/api/users/profile');

export const getUserByUsername = (username) =>
  api.get(`/api/users/${username}`);

export const getFavorites = () =>
  api.get('/api/users/favorites');

export const followUser = (userId) =>
  api.post(`/api/users/${userId}/follow`);

export const unfollowUser = (userId) =>
  api.delete(`/api/users/${userId}/follow`);

export const searchUsers = (query) =>
  api.get('/api/users/search', { params: { q: query } });

export const updateProfile = (data) =>
  api.put('/api/users/profile', data);
