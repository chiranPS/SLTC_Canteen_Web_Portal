import { Router } from 'express';
import { OrderController } from './order.controller.js';
import { validateRequest } from '../../shared/middlewares/validate.middleware.js';
import { authenticate, requireRole } from '../../shared/middlewares/auth.middleware.js';
import { checkoutSchema, updateStatusSchema, verifyQrSchema } from './order.validation.js';

export const createOrderRouter = (orderController: OrderController): Router => {
  const router = Router();

  // All order routes require authentication
  router.use(authenticate);

  // Student Routes
  router.post('/checkout', validateRequest(checkoutSchema), orderController.checkout);
  router.get('/my-orders', orderController.getMyOrders);

  // General single order retrieval (allowed for owner or admin/staff)
  router.get('/:id', orderController.getOrderById);

  // Admin/Staff Routes
  router.use(requireRole(['ADMIN', 'STAFF']));
  
  router.get('/', orderController.getAllOrders);
  
  router.patch(
    '/:id/status',
    validateRequest(updateStatusSchema),
    orderController.updateStatus
  );

  router.post(
    '/verify-qr',
    validateRequest(verifyQrSchema),
    orderController.verifyQr
  );

  router.post(
    '/decode-qr',
    validateRequest(verifyQrSchema),
    orderController.decodeQr
  );

  return router;
};
