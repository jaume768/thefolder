import api from './api';

export const getIndustryDirectory = (params) =>
  api.get('/api/industry', { params });

export const getIndustryById = (id) =>
  api.get(`/api/industry/${id}`);
