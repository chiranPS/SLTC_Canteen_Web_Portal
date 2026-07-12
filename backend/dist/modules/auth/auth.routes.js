import { Router } from 'express';
import { validateRequest } from '../../shared/middlewares/validate.middleware.js';
import { authenticate } from '../../shared/middlewares/auth.middleware.js';
import { registerSchema, loginSchema, refreshTokenSchema, forgotPasswordSchema, resetPasswordSchema, updateProfileSchema } from './auth.validation.js';
export const createAuthRouter = (authController) => {
    const router = Router();
    router.post('/register', validateRequest(registerSchema), authController.register);
    router.get('/verify-email', authController.verifyEmail);
    router.post('/login', validateRequest(loginSchema), authController.login);
    router.post('/refresh-token', validateRequest(refreshTokenSchema), authController.refreshToken);
    router.post('/logout', validateRequest(refreshTokenSchema), authController.logout);
    router.post('/forgot-password', validateRequest(forgotPasswordSchema), authController.forgotPassword);
    router.post('/reset-password', validateRequest(resetPasswordSchema), authController.resetPassword);
    // Profile
    router.put('/profile', authenticate, validateRequest(updateProfileSchema), authController.updateProfile);
    return router;
};
