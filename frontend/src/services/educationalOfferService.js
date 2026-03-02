import api from './api';

export const getEducationalOffers = (params) =>
  api.get('/api/educational-offers', { params });

export const getEducationalOfferById = (offerId) =>
  api.get(`/api/offers/educational/${offerId}`);

export const createEducationalOffer = (data) =>
  api.post('/api/educational-offers/create', data);

export const updateEducationalOffer = (offerId, data) =>
  api.put(`/api/educational-offers/${offerId}`, data);

export const deleteEducationalOffer = (offerId) =>
  api.delete(`/api/educational-offers/${offerId}`);
