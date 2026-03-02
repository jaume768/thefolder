import api from './api';

export const getPosts = (params) =>
  api.get('/api/posts', { params });

export const getPostById = (id) =>
  api.get(`/api/posts/${id}`);

export const createPost = (formData) =>
  api.post('/api/posts', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const updatePost = (id, formData) =>
  api.put(`/api/posts/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const deletePost = (id) =>
  api.delete(`/api/posts/${id}`);
