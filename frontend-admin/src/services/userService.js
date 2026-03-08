import api from './api';

export const getUsers = async (filters = {}) => {
  const { page = 1, limit = 10, role, search, status, creativeType, professionalType } = filters;
  let url = `/api/admin/users?page=${page}&limit=${limit}`;
  
  if (role) url += `&role=${role}`;
  if (search) url += `&search=${encodeURIComponent(search)}`;
  if (status) url += `&status=${status}`;
  if (creativeType) url += `&creativeType=${creativeType}`;
  if (professionalType) url += `&professionalType=${professionalType}`;
  
  const response = await api.get(url);
  return response.data;
};

export const getUserDetails = async (userId) => {
  const response = await api.get(`/api/admin/users/${userId}`);
  return response.data;
};

export const updateUser = async (userId, userData) => {
  const response = await api.put(`/api/admin/users/${userId}`, userData);
  return response.data;
};

export const softDeleteUser = async (userId) => {
  const response = await api.put(`/api/admin/users/${userId}/deactivate`);
  return response.data;
};

export const restoreUser = async (userId) => {
  const response = await api.put(`/api/admin/users/${userId}/restore`);
  return response.data;
};

export const hardDeleteUser = async (userId) => {
  const response = await api.delete(`/api/admin/users/${userId}/permanent`);
  return response.data;
};

export const createAdmin = async (adminData) => {
  const response = await api.post('/api/admin/create-admin', adminData);
  return response.data;
};
