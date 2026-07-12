import { api } from '../../../config/api';
import type { RegisterCredentials, AuthResponse } from '../types/auth.types';

export const authApi = {
  login: async (credentials: { email: string; password: string }) => {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    return response.data;
  },
  
  register: async (credentials: RegisterCredentials) => {
    const response = await api.post<AuthResponse>('/auth/register', credentials);
    return response.data;
  },
  
  updateProfile: async (data: { name?: string; universityId?: string; phoneNumber?: string; nic?: string; address?: string }) => {
    const response = await api.put<{ data: any }>('/auth/profile', data);
    return response.data.data;
  }
};
