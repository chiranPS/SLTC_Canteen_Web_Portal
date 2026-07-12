import { Router } from 'express';
import { authenticate, requireRole } from '../../shared/middlewares/auth.middleware.js';
export const createSettingsRouter = (settingsController) => {
    const router = Router();
    // Public: Check system status
    router.get('/', settingsController.getSettings);
    // Admin only: Update settings
    router.put('/', authenticate, requireRole(['ADMIN']), settingsController.updateSettings);
    return router;
};
