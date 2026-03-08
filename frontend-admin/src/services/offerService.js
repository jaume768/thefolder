import api from './api';

export const getOffers = async (filters = {}) => {
  const { page = 1, limit = 10, status, search, publisher } = filters;
  let url = `/api/admin/offers?page=${page}&limit=${limit}`;
  
  if (status) url += `&status=${status}`;
  if (search) url += `&search=${encodeURIComponent(search)}`;
  if (publisher) url += `&publisher=${publisher}`;
  
  const response = await api.get(url);
  return response.data;
};

export const getOfferDetails = async (offerId) => {
  const response = await api.get(`/api/admin/offers/${offerId}`);
  return response.data;
};

export const updateOffer = async (offerId, offerData) => {
  const response = await api.put(`/api/admin/offers/${offerId}`, offerData);
  return response.data;
};

export const deleteOffer = async (offerId) => {
  const response = await api.delete(`/api/admin/offers/${offerId}`);
  return response.data;
};

export const updateOfferStatus = async (offerId, status) => {
  const response = await api.put(`/api/admin/offers/${offerId}/status`, { status });
  return response.data;
};
