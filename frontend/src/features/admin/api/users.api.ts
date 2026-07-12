import { api } from '../../../config/api';
import type { AdminUser, CreateAdminDto, UpdateAdminDto } from '../types/users.types';

export const usersApi = {
  getAllAdmins: async () => {
    const response = await api.get<{ success: boolean; data: AdminUser[] }>('/users');
    return response.data.data;
  },

  getAdminById: async (id: string) => {
    const response = await api.get<{ success: boolean; data: AdminUser }>(`/users/${id}`);
    return response.data.data;
  },

  createAdmin: async (data: CreateAdminDto) => {
    const response = await api.post<{ success: boolean; data: AdminUser }>('/users', data);
    return response.data.data;
  },

  updateAdmin: async (id: string, data: UpdateAdminDto) => {
    const response = await api.put<{ success: boolean; data: AdminUser }>(`/users/${id}`, data);
    return response.data.data;
  },

  deleteAdmin: async (id: string) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  }
};
