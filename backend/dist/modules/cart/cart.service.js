import { AppError } from '../../shared/errors/AppError.js';
import { isMealTimeValid } from '../../shared/utils/timeCheck.js';
export class CartService {
    cartRepo;
    menuRepo;
    constructor(cartRepo, menuRepo) {
        this.cartRepo = cartRepo;
        this.menuRepo = menuRepo;
    }
    async getOrCreateCart(userId) {
        let cart = await this.cartRepo.findCartByUserId(userId);
        if (!cart) {
            cart = await this.cartRepo.createCart(userId);
        }
        return cart;
    }
    calculateTotal(cart) {
        if (!cart || !cart.items)
            return 0;
        return cart.items.reduce((total, item) => {
            // Prisma Decimal to number conversion
            const price = Number(item.meal.price);
            return total + (price * item.quantity);
        }, 0);
    }
    formatCartResponse(cart) {
        return {
            ...cart,
            totalAmount: this.calculateTotal(cart),
        };
    }
    async getCart(userId) {
        const cart = await this.getOrCreateCart(userId);
        return this.formatCartResponse(cart);
    }
    async addItem(userId, data) {
        const meal = await this.menuRepo.findMealById(data.mealId);
        if (!meal) {
            throw new AppError('Meal not found', 404, 'NOT_FOUND');
        }
        const categoryName = meal.category?.name || '';
        const isTimeValid = isMealTimeValid(categoryName);
        if (!meal.isAvailable || !isTimeValid) {
            throw new AppError('Meal is currently out of stock or outside of serving hours', 400, 'OUT_OF_STOCK');
        }
        const cart = await this.getOrCreateCart(userId);
        // Check if item already exists
        const existingItem = await this.cartRepo.getCartItem(cart.id, data.mealId);
        if (existingItem) {
            await this.cartRepo.updateCartItemQuantity(existingItem.id, existingItem.quantity + data.quantity);
        }
        else {
            await this.cartRepo.createCartItem(cart.id, data.mealId, data.quantity);
        }
        // Fetch updated cart
        const updatedCart = await this.cartRepo.findCartByUserId(userId);
        return this.formatCartResponse(updatedCart);
    }
    async updateItemQuantity(userId, mealId, data) {
        const cart = await this.getOrCreateCart(userId);
        const existingItem = await this.cartRepo.getCartItem(cart.id, mealId);
        if (!existingItem) {
            throw new AppError('Item not found in cart', 404, 'NOT_FOUND');
        }
        await this.cartRepo.updateCartItemQuantity(existingItem.id, data.quantity);
        const updatedCart = await this.cartRepo.findCartByUserId(userId);
        return this.formatCartResponse(updatedCart);
    }
    async removeItem(userId, mealId) {
        const cart = await this.getOrCreateCart(userId);
        await this.cartRepo.removeCartItem(cart.id, mealId);
        const updatedCart = await this.cartRepo.findCartByUserId(userId);
        return this.formatCartResponse(updatedCart);
    }
    async clearCart(userId) {
        const cart = await this.getOrCreateCart(userId);
        await this.cartRepo.clearCart(cart.id);
        const updatedCart = await this.cartRepo.findCartByUserId(userId);
        return this.formatCartResponse(updatedCart);
    }
}
