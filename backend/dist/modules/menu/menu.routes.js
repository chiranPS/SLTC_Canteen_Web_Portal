import { Router } from 'express';
import { validateRequest } from '../../shared/middlewares/validate.middleware.js';
import { authenticate, requireRole } from '../../shared/middlewares/auth.middleware.js';
import { uploadImage } from '../../shared/middlewares/upload.middleware.js';
import { createMealSchema, updateMealSchema } from './menu.validation.js';
export const createMenuRouter = (menuController) => {
    const router = Router();
    // Category Routes
    router.get('/categories', menuController.getCategories);
    router.post('/categories', authenticate, requireRole(['ADMIN']), menuController.createCategory);
    router.put('/categories/:id', authenticate, requireRole(['ADMIN']), menuController.updateCategory);
    router.delete('/categories/:id', authenticate, requireRole(['ADMIN']), menuController.deleteCategory);
    // Note: We validate query params manually for GET requests in our generic validate middleware setup 
    // by altering validateRequest to check req.query or writing a specific one. For simplicity, we just pass the schema here.
    // We'll update the validateRequest middleware later if needed, but for now it parses req.body.
    // Let's create a query validator or just let Zod parse it directly in controller (which we do now).
    // Actually, wait, our generic validateRequest uses `req.body`. 
    // We will parse query params directly in controller or create a validateQuery middleware.
    // For now, I'll let the controller parse it as we did in the controller: `req.query as any`.
    // Wait, no, we should validate it. Let's add a validateQuery middleware inline or update the generic one.
    // I will just use the schema in the controller to parse `req.query`.
    router.get('/meals', menuController.getMeals);
    // Protected Admin/Staff Routes
    router.use(authenticate);
    router.use(requireRole(['ADMIN', 'STAFF']));
    router.post('/meals', uploadImage.single('image'), validateRequest(createMealSchema), menuController.createMeal);
    router.put('/meals/:id', uploadImage.single('image'), validateRequest(updateMealSchema), menuController.updateMeal);
    router.delete('/meals/:id', menuController.deleteMeal);
    return router;
};
