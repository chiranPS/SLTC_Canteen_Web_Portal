import { Router } from 'express';
import { validateRequest } from '../../shared/middlewares/validate.middleware.js';
import { authenticate } from '../../shared/middlewares/auth.middleware.js';
import { addItemSchema, updateQuantitySchema } from './cart.validation.js';
export const createCartRouter = (cartController) => {
    const router = Router();
    // All cart routes require authentication
    router.use(authenticate);
    router.get('/', cartController.getCart);
    router.post('/items', validateRequest(addItemSchema), cartController.addItem);
    router.put('/items/:mealId', validateRequest(updateQuantitySchema), cartController.updateItemQuantity);
    router.delete('/items/:mealId', cartController.removeItem);
    router.delete('/', cartController.clearCart);
    return router;
};
