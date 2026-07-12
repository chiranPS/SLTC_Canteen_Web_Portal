import type {  Meal  } from '../../menu/types/menu.types';

export interface OrderItem {
  id: string;
  orderId: string;
  mealId: string;
  meal: Meal;
  quantity: number;
  unitPrice: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  totalAmount: string;
  status: 'PENDING' | 'PAID' | 'PREPARING' | 'READY' | 'COLLECTED' | 'CANCELLED';
  pickupTime: string;
  qrString: string | null;
  orderItems: OrderItem[];
  createdAt: string;
}
