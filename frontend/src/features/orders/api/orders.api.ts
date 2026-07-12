import { api } from '../../../config/api';
import type {  Order  } from '../types/orders.types';

export const ordersApi = {
  checkout: async (pickupTime: string) => {
    const response = await api.post<{ success: boolean; data: Order }>('/orders/checkout', { pickupTime });
    return response.data.data;
  },
  
  getHistory: async () => {
    const response = await api.get<{ success: boolean; data: Order[] }>('/orders/my-orders');
    return response.data.data;
  },

  getOrder: async (id: string) => {
    const response = await api.get<{ success: boolean; data: Order }>(`/orders/${id}`);
    return response.data.data;
  },
  
  processPayment: async (orderId: string, paymentMethod: string = 'CARD') => {
    const response = await api.post<{ success: boolean; data: any }>(`/payments/${orderId}/initiate`, { paymentMethod });
    return response.data.data;
  }
};
