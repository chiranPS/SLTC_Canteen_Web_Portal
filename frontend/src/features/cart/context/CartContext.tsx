import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Cart } from '../types/cart.types';
import { cartApi } from '../api/cart.api';
import { useAuth } from '../../../context/AuthContext';
import { toast } from 'react-toastify';

interface CartContextType {
  cart: Cart | null;
  isLoading: boolean;
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  fetchCart: () => Promise<void>;
  addItem: (mealId: string, quantity: number) => Promise<void>;
  updateItem: (mealId: string, quantity: number) => Promise<void>;
  removeItem: (mealId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  totalItems: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { isAuthenticated, user } = useAuth();

  const fetchCart = async () => {
    if (!isAuthenticated || user?.role !== 'STUDENT') return;
    try {
      setIsLoading(true);
      const data = await cartApi.getCart();
      setCart(data);
    } catch (error) {
      console.error('Failed to fetch cart', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [isAuthenticated]);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const addItem = async (mealId: string, quantity: number) => {
    try {
      const updatedCart = await cartApi.addItem(mealId, quantity);
      setCart(updatedCart);
      toast.success('Added to cart');
      setIsSidebarOpen(true);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to add to cart');
    }
  };

  const updateItem = async (mealId: string, quantity: number) => {
    try {
      const updatedCart = await cartApi.updateItem(mealId, quantity);
      setCart(updatedCart);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update item');
    }
  };

  const removeItem = async (mealId: string) => {
    try {
      const updatedCart = await cartApi.removeItem(mealId);
      setCart(updatedCart);
    } catch (error: any) {
      toast.error('Failed to remove item');
    }
  };

  const clearCart = async () => {
    try {
      await cartApi.clearCart();
      setCart(null);
    } catch (error) {
      toast.error('Failed to clear cart');
    }
  };

  const totalItems = cart?.items.reduce((acc, item) => acc + item.quantity, 0) || 0;

  return (
    <CartContext.Provider 
      value={{ 
        cart, isLoading, isSidebarOpen, toggleSidebar, 
        fetchCart, addItem, updateItem, removeItem, clearCart, totalItems 
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
