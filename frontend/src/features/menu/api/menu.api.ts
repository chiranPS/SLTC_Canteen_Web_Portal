import { api } from '../../../config/api';
import type {  Meal, Category, PaginatedMeals  } from '../types/menu.types';

export const menuApi = {
  getMeals: async (params?: { categoryId?: string; search?: string; page?: number; limit?: number }) => {
    const response = await api.get<{ success: boolean; data: PaginatedMeals }>('/menu/meals', { params });
    return response.data.data;
  },
  
  getCategories: async () => {
    const response = await api.get<{ success: boolean; data: Category[] }>('/menu/categories');
    return response.data.data;
  },

  getMealById: async (id: string) => {
    const response = await api.get<{ success: boolean; data: Meal }>(`/menu/meals/${id}`);
    return response.data.data;
  }
};
