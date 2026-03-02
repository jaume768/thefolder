import api from './api';

export const getOffers = (params) =>
  api.get('/api/offers', { params });

export const getOfferById = (offerId) =>
  api.get(`/api/offers/${offerId}`);

export const createOffer = (data) =>
  api.post('/api/offers/create', data);

export const updateOffer = (offerId, data) =>
  api.put(`/api/offers/${offerId}`, data);

export const deleteOffer = (offerId) =>
  api.delete(`/api/offers/${offerId}`);

export const applyToOffer = (offerId, data) =>
  api.post(`/api/offers/${offerId}/apply`, data);

export const getJobOfferDetail = (offerId) =>
  api.get(`/api/offers/job/${offerId}`);
