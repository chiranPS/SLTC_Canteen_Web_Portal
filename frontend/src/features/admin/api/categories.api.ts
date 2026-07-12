import { api } from '../../../config/api';
import type { Category } from '../../menu/types/menu.types';

export const categoriesApi = {
  getCategories: async (all = false) => {
    const response = await api.get<{ success: boolean; data: Category[] }>(`/menu/categories${all ? '?all=true' : ''}`);
    return response.data.data;
  },

  createCategory: async (data: { name: string; description?: string | null; dailyLimit?: number; isActive?: boolean }) => {
    const response = await api.post<{ success: boolean; data: Category }>('/menu/categories', data);
    return response.data.data;
  },

  updateCategory: async (id: string, data: { name?: string; description?: string | null; dailyLimit?: number; isActive?: boolean }) => {
    const response = await api.put<{ success: boolean; data: Category }>(`/menu/categories/${id}`, data);
    return response.data.data;
  },

  deleteCategory: async (id: string) => {
    const response = await api.delete<{ success: boolean }>(`/menu/categories/${id}`);
    return response.data;
  }
};
