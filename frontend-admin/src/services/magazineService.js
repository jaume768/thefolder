import api from './api';

// Obtener todas las revistas con paginación y filtros
export const getAllMagazines = async (page = 1, limit = 10, search = '', status = 'active') => {
  try {
    const response = await api.get(
      `/api/admin/magazines?page=${page}&limit=${limit}&search=${search}&status=${status}`
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching magazines:', error);
    throw error;
  }
};

// Obtener detalles de una revista específica
export const getMagazineDetails = async (magazineId) => {
  try {
    const response = await api.get(
      `/api/admin/magazines/${magazineId}`
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching magazine details:', error);
    throw error;
  }
};

// Crear una nueva revista
export const createMagazine = async (magazineData) => {
  try {
    // Crear FormData para enviar la imagen
    const formData = new FormData();
    
    // Agregar datos de texto
    formData.append('name', magazineData.name);
    formData.append('price', magazineData.price);
    formData.append('link', magazineData.link || '');
    
    if (magazineData.isActive !== undefined) {
      formData.append('isActive', magazineData.isActive);
    }
    
    // Agregar la imagen si existe
    if (magazineData.image instanceof File) {
      formData.append('image', magazineData.image);
    } else if (magazineData.imageUrl) {
      formData.append('imageUrl', magazineData.imageUrl);
    }
    
    const response = await api.post(
      `/api/admin/magazines`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    );
    
    return response.data;
  } catch (error) {
    console.error('Error creating magazine:', error);
    throw error;
  }
};

// Actualizar una revista existente
export const updateMagazine = async (magazineId, magazineData) => {
  try {
    // Crear FormData para enviar la imagen
    const formData = new FormData();
    
    // Agregar datos de texto
    formData.append('name', magazineData.name);
    formData.append('price', magazineData.price);
    formData.append('link', magazineData.link || '');
    
    if (magazineData.isActive !== undefined) {
      formData.append('isActive', magazineData.isActive);
    }
    
    // Agregar la imagen si existe
    if (magazineData.image instanceof File) {
      formData.append('image', magazineData.image);
    } else if (magazineData.imageUrl) {
      formData.append('imageUrl', magazineData.imageUrl);
    }
    
    const response = await api.put(
      `/api/admin/magazines/${magazineId}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    );
    
    return response.data;
  } catch (error) {
    console.error('Error updating magazine:', error);
    throw error;
  }
};

// Eliminar una revista
export const deleteMagazine = async (magazineId) => {
  try {
    const response = await api.delete(
      `/api/admin/magazines/${magazineId}`
    );
    return response.data;
  } catch (error) {
    console.error('Error deleting magazine:', error);
    throw error;
  }
};
