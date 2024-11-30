import api from './api';

export const getEmailTemplates = async () => {
  const response = await api.get('/marketing/templates');
  return response.data;
};

export const createEmailTemplate = async (data: any) => {
  const response = await api.post('/marketing/templates', data);
  return response.data;
};

export const updateEmailTemplate = async (id: string, data: any) => {
  const response = await api.put(`/marketing/templates/${id}`, data);
  return response.data;
};

export const deleteEmailTemplate = async (id: string) => {
  await api.delete(`/marketing/templates/${id}`);
};

export const sendTestEmail = async (templateId: string, testEmail: string) => {
  const response = await api.post(`/marketing/templates/${templateId}/test`, { testEmail });
  return response.data;
};