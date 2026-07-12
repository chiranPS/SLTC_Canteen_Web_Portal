import { Router } from 'express';
import { PaymentController } from './payment.controller.js';
import { authenticate } from '../../shared/middlewares/auth.middleware.js';

export const createPaymentRouter = (paymentController: PaymentController): Router => {
  const router = Router();

  // Public Webhook (verified by signature internally)
  router.post('/webhook', paymentController.handleWebhook);

  // Protected Routes
  router.use(authenticate);
  router.post('/:orderId/initiate', paymentController.initiatePayment);

  return router;
};
