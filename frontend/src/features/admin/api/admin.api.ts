import { api } from '../../../config/api';
import type {  DashboardMetrics, PopularMeal  } from '../types/admin.types';
import type {  Order  } from '../../orders/types/orders.types';
import type {  Meal  } from '../../menu/types/menu.types';

export const adminApi = {
  // Reports
  getDashboardMetrics: async () => {
    const response = await api.get<{ success: boolean; data: DashboardMetrics }>('/reports/dashboard');
    return response.data.data;
  },
  
  getPopularMeals: async () => {
    const response = await api.get<{ success: boolean; data: PopularMeal[] }>('/reports/popular');
    return response.data.data;
  },

  getRevenueReport: async (startDate: string, endDate: string) => {
    const response = await api.get<{ success: boolean; data: any }>(`/reports/revenue?startDate=${startDate}&endDate=${endDate}`);
    return response.data.data;
  },

  getPeakPeriods: async () => {
    const response = await api.get<{ success: boolean; data: any }>('/reports/peak-periods');
    return response.data.data;
  },

  // Order Management
  getAllOrders: async (filters?: { page?: number; limit?: number; status?: string; categoryId?: string; search?: string }) => {
    let url = '/orders';
    if (filters) {
      const params = new URLSearchParams();
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.status) params.append('status', filters.status);
      if (filters.categoryId) params.append('categoryId', filters.categoryId);
      if (filters.search) params.append('search', filters.search);
      const queryString = params.toString();
      if (queryString) url += `?${queryString}`;
    }
    
    // We expect the backend to return { orders, meta } now.
    // For backwards compatibility with OrderManagement.tsx which doesn't use filters, 
    // we could just return the data object directly.
    const response = await api.get<{ success: boolean; data: { orders: Order[], meta: any } }>(url);
    return response.data.data;
  },

  decodeQr: async (token: string) => {
    const response = await api.post<{ success: boolean; data: Order }>('/orders/decode-qr', { token });
    return response.data.data;
  },

  updateOrderStatus: async (orderId: string, status: string) => {
    const response = await api.patch<{ success: boolean; data: Order }>(`/orders/${orderId}/status`, { status });
    return response.data.data;
  },

  // Meal Management (CMS)
  createMeal: async (mealData: FormData) => {
    const response = await api.post<{ success: boolean; data: Meal }>('/menu/meals', mealData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data.data;
  },

  updateMeal: async (mealId: string, mealData: FormData) => {
    const response = await api.put<{ success: boolean; data: Meal }>(`/menu/meals/${mealId}`, mealData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data.data;
  },

  updateMealAvailability: async (mealId: string, isAvailable: boolean) => {
    const response = await api.patch<{ success: boolean; data: Meal }>(`/menu/meals/${mealId}`, { isAvailable });
    return response.data.data;
  },

  deleteMeal: async (mealId: string) => {
    const response = await api.delete<{ success: boolean }>(`/menu/meals/${mealId}`);
    return response.data;
  }
};
