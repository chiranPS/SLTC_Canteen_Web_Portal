import { Router } from 'express';
import { authenticate } from '../../shared/middlewares/auth.middleware.js';
export const createNotificationRouter = (notificationController) => {
    const router = Router();
    // All notification routes require authentication
    router.use(authenticate);
    router.get('/', notificationController.getMyNotifications);
    router.patch('/read-all', notificationController.markAllAsRead);
    router.patch('/:id/read', notificationController.markAsRead);
    return router;
};
