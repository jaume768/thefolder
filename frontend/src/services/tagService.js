import api from './api';

export const getRoleTags = () =>
  api.get('/api/tags', { params: { type: 'role', status: 'active' } });

export const getCityTags = () =>
  api.get('/api/tags/cities');

export const getTags = (params) =>
  api.get('/api/tags', { params });
