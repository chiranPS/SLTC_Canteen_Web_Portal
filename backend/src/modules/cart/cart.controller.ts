import { Request, Response } from 'express';
import { CartService } from './cart.service.js';
import { successResponse } from '../../shared/responses/apiResponse.js';

export class CartController {
  constructor(private cartService: CartService) {}

  getCart = async (req: Request, res: Response) => {
    const userId = req.user!.id; // from authenticate middleware
    const cart = await this.cartService.getCart(userId);
    res.status(200).json(successResponse('Cart fetched successfully', cart));
  };

  addItem = async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const cart = await this.cartService.addItem(userId, req.body);
    res.status(200).json(successResponse('Item added to cart', cart));
  };

  updateItemQuantity = async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const mealId = req.params.mealId;
    const cart = await this.cartService.updateItemQuantity(userId, req.params.mealId as string, req.body);
    res.status(200).json(successResponse('Cart item updated', cart));
  };

  removeItem = async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const mealId = req.params.mealId;
    const cart = await this.cartService.removeItem(userId, req.params.mealId as string);
    res.status(200).json(successResponse('Item removed from cart', cart));
  };

  clearCart = async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const cart = await this.cartService.clearCart(userId);
    res.status(200).json(successResponse('Cart cleared', cart));
  };
}
