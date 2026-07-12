import { CartRepository } from './cart.repository.js';
import { MenuRepository } from '../menu/menu.repository.js';
import { AddItemDto, UpdateQuantityDto } from './cart.validation.js';
import { AppError } from '../../shared/errors/AppError.js';
import { isMealTimeValid } from '../../shared/utils/timeCheck.js';

export class CartService {
  constructor(
    private cartRepo: CartRepository,
    private menuRepo: MenuRepository
  ) {}

  private async getOrCreateCart(userId: string) {
    let cart = await this.cartRepo.findCartByUserId(userId);
    if (!cart) {
      cart = await this.cartRepo.createCart(userId);
    }
    return cart;
  }

  private calculateTotal(cart: any) {
    if (!cart || !cart.items) return 0;
    return cart.items.reduce((total: number, item: any) => {
      // Prisma Decimal to number conversion
      const price = Number(item.meal.price);
      return total + (price * item.quantity);
    }, 0);
  }

  private formatCartResponse(cart: any) {
    return {
      ...cart,
      totalAmount: this.calculateTotal(cart),
    };
  }

  async getCart(userId: string) {
    const cart = await this.getOrCreateCart(userId);
    return this.formatCartResponse(cart);
  }

  async addItem(userId: string, data: AddItemDto) {
    const meal = await this.menuRepo.findMealById(data.mealId);
    if (!meal) {
      throw new AppError('Meal not found', 404, 'NOT_FOUND');
    }
    
    const categoryName = (meal as any).category?.name || '';
    const isTimeValid = isMealTimeValid(categoryName);
    
    if (!meal.isAvailable || !isTimeValid) {
      throw new AppError('Meal is currently out of stock or outside of serving hours', 400, 'OUT_OF_STOCK');
    }

    const cart = await this.getOrCreateCart(userId);
    
    // Check if item already exists
    const existingItem = await this.cartRepo.getCartItem(cart.id, data.mealId);
    
    if (existingItem) {
      await this.cartRepo.updateCartItemQuantity(existingItem.id, existingItem.quantity + data.quantity);
    } else {
      await this.cartRepo.createCartItem(cart.id, data.mealId, data.quantity);
    }

    // Fetch updated cart
    const updatedCart = await this.cartRepo.findCartByUserId(userId);
    return this.formatCartResponse(updatedCart);
  }

  async updateItemQuantity(userId: string, mealId: string, data: UpdateQuantityDto) {
    const cart = await this.getOrCreateCart(userId);
    const existingItem = await this.cartRepo.getCartItem(cart.id, mealId);
    
    if (!existingItem) {
      throw new AppError('Item not found in cart', 404, 'NOT_FOUND');
    }

    await this.cartRepo.updateCartItemQuantity(existingItem.id, data.quantity);

    const updatedCart = await this.cartRepo.findCartByUserId(userId);
    return this.formatCartResponse(updatedCart);
  }

  async removeItem(userId: string, mealId: string) {
    const cart = await this.getOrCreateCart(userId);
    await this.cartRepo.removeCartItem(cart.id, mealId);
    
    const updatedCart = await this.cartRepo.findCartByUserId(userId);
    return this.formatCartResponse(updatedCart);
  }

  async clearCart(userId: string) {
    const cart = await this.getOrCreateCart(userId);
    await this.cartRepo.clearCart(cart.id);
    
    const updatedCart = await this.cartRepo.findCartByUserId(userId);
    return this.formatCartResponse(updatedCart);
  }
}
