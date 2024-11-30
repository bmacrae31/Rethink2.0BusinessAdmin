import api from './api';
import { MembershipTier } from '../store/membershipStore';

export const getMemberships = async () => {
  const response = await api.get('/memberships');
  return response.data;
};

export const createMembership = async (data: Omit<MembershipTier, 'id'>) => {
  const response = await api.post('/memberships', data);
  return response.data;
};

export const updateMembership = async (id: string, data: Partial<MembershipTier>) => {
  const response = await api.put(`/memberships/${id}`, data);
  return response.data;
};

export const deleteMembership = async (id: string) => {
  await api.delete(`/memberships/${id}`);
};