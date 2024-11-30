import api from './api';

export const getStorefrontConfig = async () => {
  const response = await api.get('/storefront/config');
  return response.data;
};

export const updateStorefrontConfig = async (data: any) => {
  const response = await api.put('/storefront/config', data);
  return response.data;
};

export const publishStorefront = async () => {
  const response = await api.post('/storefront/publish');
  return response.data;
};