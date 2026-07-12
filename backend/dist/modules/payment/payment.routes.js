import { Router } from 'express';
import { authenticate } from '../../shared/middlewares/auth.middleware.js';
export const createPaymentRouter = (paymentController) => {
    const router = Router();
    // Public Webhook (verified by signature internally)
    router.post('/webhook', paymentController.handleWebhook);
    // Protected Routes
    router.use(authenticate);
    router.post('/:orderId/initiate', paymentController.initiatePayment);
    return router;
};
