import api from './api';

// Obtener todos los posts con filtros
export const getPosts = async (filters = {}) => {
  const { page = 1, limit = 10, search, status, userId } = filters;
  let url = `/api/admin/posts?page=${page}&limit=${limit}`;
  
  if (search) url += `&search=${encodeURIComponent(search)}`;
  if (status) url += `&status=${status}`;
  if (userId) url += `&userId=${userId}`;
  
  const response = await api.get(url);
  return response.data;
};

// Obtener un post específico por ID
export const getPostById = async (postId) => {
  const response = await api.get(`/api/admin/posts/${postId}`);
  return response.data;
};

// Crear un nuevo post
export const createPost = async (postData, images) => {
  const formData = new FormData();
  
  // Añadir campos de texto
  Object.keys(postData).forEach(key => {
    if (key === 'tags' || key === 'peopleTags') {
      formData.append(key, JSON.stringify(postData[key]));
    } else {
      formData.append(key, postData[key]);
    }
  });
  
  // Añadir imágenes
  if (images && images.length > 0) {
    images.forEach(image => {
      formData.append('images', image);
    });
  }
  
  const response = await api.post('/api/admin/posts', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  
  return response.data;
};

// Actualizar un post existente
export const updatePost = async (postId, postData, newImages) => {
  const formData = new FormData();
  
  // Añadir campos de texto
  Object.keys(postData).forEach(key => {
    if (key === 'tags' || key === 'peopleTags') {
      formData.append(key, JSON.stringify(postData[key]));
    } else {
      formData.append(key, postData[key]);
    }
  });
  
  // Añadir nuevas imágenes si existen
  if (newImages && newImages.length > 0) {
    newImages.forEach(image => {
      formData.append('images', image);
    });
  }
  
  const response = await api.put(`/api/admin/posts/${postId}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  
  return response.data;
};

// Eliminar un post
export const deletePost = async (postId) => {
  const response = await api.delete(`/api/admin/posts/${postId}`);
  return response.data;
};

// Actualizar el estado de "staff pick" de un post
export const updatePostStaffPick = async (postId, staffPick) => {
  const response = await api.put(`/api/admin/posts/${postId}/staff-pick`, { staffPick });
  return response.data;
};
