import api from './api';
import { Member, MemberFilter } from '../types/member';

export const getMembers = async (filters?: MemberFilter) => {
  const response = await api.get('/members', { params: filters });
  return response.data;
};

export const getMember = async (id: string) => {
  const response = await api.get(`/members/${id}`);
  return response.data;
};

export const createMember = async (data: Omit<Member, 'id'>) => {
  const response = await api.post('/members', data);
  return response.data;
};

export const updateMember = async (id: string, data: Partial<Member>) => {
  const response = await api.put(`/members/${id}`, data);
  return response.data;
};

export const deleteMember = async (id: string) => {
  await api.delete(`/members/${id}`);
};