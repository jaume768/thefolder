import api from './api';

export const getFolders = () =>
  api.get('/api/folders');

export const getFolderById = (folderId) =>
  api.get(`/api/folders/${folderId}`);

export const createFolder = (data) =>
  api.post('/api/folders', data);

export const updateFolder = (folderId, data) =>
  api.put(`/api/folders/${folderId}`, data);

export const deleteFolder = (folderId) =>
  api.delete(`/api/folders/${folderId}`);
