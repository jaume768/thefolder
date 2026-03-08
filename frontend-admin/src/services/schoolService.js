import api from './api';

export const getSchools = async (filters = {}) => {
  const { page = 1, limit = 10, search, country } = filters;
  let url = `/api/admin/schools?page=${page}&limit=${limit}`;
  
  if (search) url += `&search=${encodeURIComponent(search)}`;
  if (country) url += `&country=${country}`;
  
  const response = await api.get(url);
  return response.data;
};

// Obtener una escuela específica por ID
export const getSchoolById = async (schoolId) => {
  const response = await api.get(`/api/admin/schools/${schoolId}`);
  return response.data;
};

// Crear una nueva escuela
export const createSchool = async (schoolData) => {
  const response = await api.post('/api/admin/schools', schoolData);
  return response.data;
};

// Actualizar una escuela existente
export const updateSchool = async (schoolId, schoolData) => {
  const response = await api.put(`/api/admin/schools/${schoolId}`, schoolData);
  return response.data;
};

// Eliminar una escuela
export const deleteSchool = async (schoolId) => {
  const response = await api.delete(`/api/admin/schools/${schoolId}`);
  return response.data;
};
