import api from './api';

export const getMagazines = (params) =>
  api.get('/api/magazine', { params });

export const getMagazineById = (id) =>
  api.get(`/api/magazine/${id}`);
