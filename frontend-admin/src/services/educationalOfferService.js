import api from './api';

export const getEducationalOffers = async (filters = {}) => {
  const { page = 1, limit = 10, status, search, publisher } = filters;
  let url = `/api/admin/educational-offers?page=${page}&limit=${limit}`;
  
  if (status) url += `&status=${status}`;
  if (search) url += `&search=${encodeURIComponent(search)}`;
  if (publisher) url += `&publisher=${publisher}`;
  
  const response = await api.get(url);
  return response.data;
};

export const getEducationalOfferDetails = async (offerId) => {
  const response = await api.get(`/api/admin/educational-offers/${offerId}`);
  return response.data;
};

export const updateEducationalOffer = async (offerId, offerData) => {
  const response = await api.put(`/api/admin/educational-offers/${offerId}`, offerData);
  return response.data;
};

export const deleteEducationalOffer = async (offerId) => {
  const response = await api.delete(`/api/admin/educational-offers/${offerId}`);
  return response.data;
};

export const updateEducationalOfferStatus = async (offerId, status) => {
  const response = await api.put(`/api/admin/educational-offers/${offerId}/status`, { status });
  return response.data;
};
