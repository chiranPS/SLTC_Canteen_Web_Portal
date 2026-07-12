import { api } from '../../../config/api';
import type {  Cart  } from '../types/cart.types';

export const cartApi = {
  getCart: async () => {
    const response = await api.get<{ success: boolean; data: Cart }>('/cart');
    return response.data.data;
  },
  
  addItem: async (mealId: string, quantity: number) => {
    const response = await api.post<{ success: boolean; data: Cart }>('/cart/items', { mealId, quantity });
    return response.data.data;
  },

  updateItem: async (mealId: string, quantity: number) => {
    const response = await api.put<{ success: boolean; data: Cart }>(`/cart/items/${mealId}`, { quantity });
    return response.data.data;
  },

  removeItem: async (mealId: string) => {
    const response = await api.delete<{ success: boolean; data: Cart }>(`/cart/items/${mealId}`);
    return response.data.data;
  },
  
  clearCart: async () => {
    const response = await api.delete<{ success: boolean }>('/cart');
    return response.data;
  }
};
