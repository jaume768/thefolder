import api from './api';

export const getArticles = () =>
  api.get('/api/blog');

export const getArticleById = (id) =>
  api.get(`/api/blog/${id}`);

export const getArticlesByCategory = (category) =>
  api.get(`/api/blog/category/${category}`);
