import api from './api';
import { Offer } from '../types/offer';

export const getOffers = async () => {
  const response = await api.get('/offers');
  return response.data;
};

export const createOffer = async (data: Omit<Offer, 'id'>) => {
  const response = await api.post('/offers', data);
  return response.data;
};

export const updateOffer = async (id: string, data: Partial<Offer>) => {
  const response = await api.put(`/offers/${id}`, data);
  return response.data;
};

export const deleteOffer = async (id: string) => {
  await api.delete(`/offers/${id}`);
};