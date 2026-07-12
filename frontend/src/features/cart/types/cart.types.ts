import type {  Meal  } from '../../menu/types/menu.types';

export interface CartItem {
  id: string;
  mealId: string;
  quantity: number;
  meal: Meal;
}

export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
  total: number; // calculated field on the frontend/backend
}
