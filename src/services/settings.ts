import api from './api';
import { BusinessSettings } from '../types/settings';

export const getSettings = async () => {
  const response = await api.get('/settings');
  return response.data;
};

export const updateSettings = async (data: Partial<BusinessSettings>) => {
  const response = await api.put('/settings', data);
  return response.data;
};

export const updateBrandingSettings = async (data: BusinessSettings['branding']) => {
  const response = await api.put('/settings/branding', data);
  return response.data;
};

export const updatePaymentSettings = async (data: BusinessSettings['payment']) => {
  const response = await api.put('/settings/payment', data);
  return response.data;
};