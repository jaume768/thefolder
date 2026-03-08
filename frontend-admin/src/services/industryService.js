import api from './api';

// Obtener todos los perfiles de industria con paginación y filtros
export const getAllIndustry = async (
  page = 1,
  limit = 10,
  search = '',
  status = 'active',
  country = '',
  city = '',
  category = ''
) => {
  try {
    const response = await api.get(
      `/api/admin/industry?page=${page}&limit=${limit}&search=${search}&status=${status}&country=${country}&city=${city}&category=${category}`
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching industry:', error);
    throw error;
  }
};

// Obtener detalles de un perfil específico
export const getIndustryDetails = async (industryId) => {
  try {
    const response = await api.get(`/api/admin/industry/${industryId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching industry details:', error);
    throw error;
  }
};

// Crear un nuevo perfil
export const createIndustry = async (industryData) => {
  try {
    const formData = new FormData();

    formData.append('name', industryData.name);
    formData.append('country', industryData.country);
    formData.append('city', industryData.city);
    formData.append('category', industryData.category);
    formData.append('link', industryData.link || '');

    if (industryData.isActive !== undefined) {
      formData.append('isActive', industryData.isActive);
    }

    if (industryData.image instanceof File) {
      formData.append('image', industryData.image);
    } else if (industryData.imageUrl) {
      formData.append('imageUrl', industryData.imageUrl);
    }

    const response = await api.post(
      `/api/admin/industry`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );

    return response.data;
  } catch (error) {
    console.error('Error creating industry profile:', error);
    throw error;
  }
};

// Actualizar un perfil existente
export const updateIndustry = async (industryId, industryData) => {
  try {
    const formData = new FormData();

    formData.append('name', industryData.name);
    formData.append('country', industryData.country);
    formData.append('city', industryData.city);
    formData.append('category', industryData.category);
    formData.append('link', industryData.link || '');

    if (industryData.isActive !== undefined) {
      formData.append('isActive', industryData.isActive);
    }

    if (industryData.image instanceof File) {
      formData.append('image', industryData.image);
    } else if (industryData.imageUrl) {
      formData.append('imageUrl', industryData.imageUrl);
    }

    const response = await api.put(
      `/api/admin/industry/${industryId}`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );

    return response.data;
  } catch (error) {
    console.error('Error updating industry profile:', error);
    throw error;
  }
};

// Eliminar un perfil
export const deleteIndustry = async (industryId) => {
  try {
    const response = await api.delete(`/api/admin/industry/${industryId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting industry profile:', error);
    throw error;
  }
};