import { Router } from 'express';
import { prisma } from '../../config/db.config.js';

// Utilities
import { EmailService } from '../../shared/utils/email.service.js';
import { QRService } from '../../shared/utils/qr.service.js';
import { MockPaymentProvider } from '../../shared/utils/payment-providers/mock.payment.provider.js';
import { NotificationQueue } from '../../shared/utils/notification.queue.js';

// Repositories
import { AuthRepository } from '../../modules/auth/auth.repository.js';
import { MenuRepository } from '../../modules/menu/menu.repository.js';
import { CartRepository } from '../../modules/cart/cart.repository.js';
import { OrderRepository } from '../../modules/order/order.repository.js';
import { PaymentRepository } from '../../modules/payment/payment.repository.js';
import { ReportsRepository } from '../../modules/reports/reports.repository.js';
import { NotificationRepository } from '../../modules/notification/notification.repository.js';
import { SettingsRepository } from '../../modules/settings/settings.repository.js';
import { UsersRepository } from '../../modules/users/users.repository.js';

// Services
import { AuthService } from '../../modules/auth/auth.service.js';
import { MenuService } from '../../modules/menu/menu.service.js';
import { CartService } from '../../modules/cart/cart.service.js';
import { OrderService } from '../../modules/order/order.service.js';
import { PaymentService } from '../../modules/payment/payment.service.js';
import { ReportsService } from '../../modules/reports/reports.service.js';
import { NotificationService } from '../../modules/notification/notification.service.js';
import { SettingsService } from '../../modules/settings/settings.service.js';
import { UsersService } from '../../modules/users/users.service.js';

// Controllers
import { AuthController } from '../../modules/auth/auth.controller.js';
import { MenuController } from '../../modules/menu/menu.controller.js';
import { CartController } from '../../modules/cart/cart.controller.js';
import { OrderController } from '../../modules/order/order.controller.js';
import { PaymentController } from '../../modules/payment/payment.controller.js';
import { ReportsController } from '../../modules/reports/reports.controller.js';
import { NotificationController } from '../../modules/notification/notification.controller.js';
import { SettingsController } from '../../modules/settings/settings.controller.js';
import { UsersController } from '../../modules/users/users.controller.js';

// Routers
import { createAuthRouter } from '../../modules/auth/auth.routes.js';
import { createMenuRouter } from '../../modules/menu/menu.routes.js';
import { createCartRouter } from '../../modules/cart/cart.routes.js';
import { createOrderRouter } from '../../modules/order/order.routes.js';
import { createPaymentRouter } from '../../modules/payment/payment.routes.js';
import { createReportsRouter } from '../../modules/reports/reports.routes.js';
import { createNotificationRouter } from '../../modules/notification/notification.routes.js';
import { createSettingsRouter } from '../../modules/settings/settings.routes.js';
import { createUsersRouter } from '../../modules/users/users.routes.js';

export const createV1Router = (): Router => {
  const router = Router();

  // --- Dependency Injection ---
  // Utilities
  const emailService = new EmailService();
  const qrService = new QRService();
  const paymentProvider = new MockPaymentProvider();
  const notificationQueue = new NotificationQueue(emailService);

  // Repositories
  const authRepository = new AuthRepository(prisma);
  const menuRepository = new MenuRepository(prisma);
  const cartRepository = new CartRepository(prisma);
  const orderRepository = new OrderRepository(prisma);
  const paymentRepository = new PaymentRepository(prisma);
  const reportsRepository = new ReportsRepository(prisma);
  const notificationRepository = new NotificationRepository(prisma);
  const settingsRepository = new SettingsRepository(prisma);
  const usersRepository = new UsersRepository(prisma);

  // Instantiate Services
  const authService = new AuthService(authRepository, emailService);
  const menuService = new MenuService(menuRepository);
  const cartService = new CartService(cartRepository, menuRepository);
  const notificationService = new NotificationService(notificationRepository, notificationQueue);
  const settingsService = new SettingsService(settingsRepository);
  const orderService = new OrderService(orderRepository, qrService, notificationService, settingsService, menuRepository, cartRepository);
  const paymentService = new PaymentService(paymentRepository, orderRepository, paymentProvider, qrService, notificationService);
  const reportsService = new ReportsService(reportsRepository);
  const usersService = new UsersService(usersRepository);

  // Instantiate Controllers
  const authController = new AuthController(authService);
  const menuController = new MenuController(menuService);
  const cartController = new CartController(cartService);
  const orderController = new OrderController(orderService);
  const paymentController = new PaymentController(paymentService);
  const reportsController = new ReportsController(reportsService);
  const notificationController = new NotificationController(notificationService);
  const settingsController = new SettingsController(settingsService);
  const usersController = new UsersController(usersService);

  // --- Register Routes ---
  router.use('/auth', createAuthRouter(authController));
  router.use('/menu', createMenuRouter(menuController));
  router.use('/cart', createCartRouter(cartController));
  router.use('/orders', createOrderRouter(orderController));
  router.use('/payments', createPaymentRouter(paymentController));
  router.use('/reports', createReportsRouter(reportsController));
  router.use('/notifications', createNotificationRouter(notificationController));
  router.use('/settings', createSettingsRouter(settingsController));
  router.use('/users', createUsersRouter(usersController));

  return router;
};
