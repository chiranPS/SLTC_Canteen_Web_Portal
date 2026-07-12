import { successResponse } from '../../shared/responses/apiResponse.js';
export class CartController {
    cartService;
    constructor(cartService) {
        this.cartService = cartService;
    }
    getCart = async (req, res) => {
        const userId = req.user.id; // from authenticate middleware
        const cart = await this.cartService.getCart(userId);
        res.status(200).json(successResponse('Cart fetched successfully', cart));
    };
    addItem = async (req, res) => {
        const userId = req.user.id;
        const cart = await this.cartService.addItem(userId, req.body);
        res.status(200).json(successResponse('Item added to cart', cart));
    };
    updateItemQuantity = async (req, res) => {
        const userId = req.user.id;
        const mealId = req.params.mealId;
        const cart = await this.cartService.updateItemQuantity(userId, req.params.mealId, req.body);
        res.status(200).json(successResponse('Cart item updated', cart));
    };
    removeItem = async (req, res) => {
        const userId = req.user.id;
        const mealId = req.params.mealId;
        const cart = await this.cartService.removeItem(userId, req.params.mealId);
        res.status(200).json(successResponse('Item removed from cart', cart));
    };
    clearCart = async (req, res) => {
        const userId = req.user.id;
        const cart = await this.cartService.clearCart(userId);
        res.status(200).json(successResponse('Cart cleared', cart));
    };
}
