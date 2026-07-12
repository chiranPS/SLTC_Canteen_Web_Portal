import { OrderRepository } from './order.repository.js';
import { CheckoutDto, QueryOrdersDto, UpdateStatusDto } from './order.validation.js';
import { OrderStatus } from '@prisma/client';
import { AppError } from '../../shared/errors/AppError.js';
import crypto from 'crypto';
import { QRService } from '../../shared/utils/qr.service.js';
import { NotificationService } from '../notification/notification.service.js';
import { OrderTemplates } from '../../shared/utils/email.templates.js';
import { SettingsService } from '../settings/settings.service.js';
import { MenuRepository } from '../menu/menu.repository.js';
import { CartRepository } from '../cart/cart.repository.js';
import { isMealTimeValid } from '../../shared/utils/timeCheck.js';

export class OrderService {
  constructor(
    private orderRepo: OrderRepository,
    private qrService: QRService,
    private notificationService: NotificationService,
    private settingsService: SettingsService,
    private menuRepo: MenuRepository,
    private cartRepo: CartRepository
  ) {}

  private generateOrderNumber(): string {
    const randomHex = crypto.randomBytes(3).toString('hex').toUpperCase(); // 6 chars
    const prefix = 'ORD';
    return `${prefix}-${randomHex}`;
  }

  async checkout(userId: string, data: CheckoutDto) {
    const now = new Date();
    const hours = now.getHours();

    if (hours < 5 || hours >= 20) {
      throw new AppError('Canteen ordering is closed. Ordering opens at 5:00 AM.', 400, 'CLOSED');
    }

    const settings = await this.settingsService.getSettings();
    if (settings.isOrderingPaused) {
      throw new AppError(settings.pauseMessage || 'Ordering is currently paused by the admin.', 400, 'PAUSED');
    }

    const cart = await this.cartRepo.findCartByUserId(userId);
    if (!cart || cart.items.length === 0) {
      throw new AppError('Cart is empty', 400, 'EMPTY_CART');
    }

    const pickupDate = new Date(data.pickupTime);
    const pickupHours = pickupDate.getHours() + pickupDate.getMinutes() / 60;

    const categoriesWithCount = await this.menuRepo.findCategories();

    for (const item of cart.items) {
      const categoryName = item.meal.category.name.toLowerCase();
      
      // Enforce Serving Windows based on cart contents
      if (categoryName.includes('breakfast') && (pickupHours < 7.5 || pickupHours >= 11.5)) {
        throw new AppError('Pickup time for Breakfast must be between 7:30 AM and 11:30 AM', 400, 'INVALID_PICKUP_TIME');
      }
      if (categoryName.includes('lunch') && (pickupHours < 11.5 || pickupHours >= 16)) {
        throw new AppError('Pickup time for Lunch must be between 11:30 AM and 4:00 PM', 400, 'INVALID_PICKUP_TIME');
      }
      if (categoryName.includes('dinner') && (pickupHours < 16.5 || pickupHours >= 20)) {
        throw new AppError('Pickup time for Dinner must be between 4:30 PM and 8:00 PM', 400, 'INVALID_PICKUP_TIME');
      }

      const isTimeValid = isMealTimeValid(categoryName, now);
      if (!item.meal.isAvailable || !isTimeValid) {
        throw new AppError(`The meal '${item.meal.name}' is no longer available at this time.`, 400, 'UNAVAILABLE_MEAL');
      }

      // Daily Category limit checks
      const catStats = categoriesWithCount.find(c => c.id === item.meal.categoryId);
      if (catStats && catStats.dailyLimit > 0) {
        if (catStats.currentCount + item.quantity > catStats.dailyLimit) {
          throw new AppError(`Cannot order ${item.meal.name}. The ${catStats.name} category is sold out for today.`, 400, 'SOLD_OUT');
        }
      }
    }

    // Using a do-while loop to handle the very rare chance of orderNumber collision
    // but in a real-world scenario, we'd handle the Unique Constraint error from Prisma and retry.
    // For now, we generate a 6-char hex which is 16.7M combinations.
    const orderNumber = this.generateOrderNumber();

    const order = await this.orderRepo.createOrderFromCart(userId, new Date(data.pickupTime), orderNumber);
    
    // Dispatch Notifications
    this.notificationService.sendInAppNotification(
      userId, 
      'Order Placed', 
      `Your order ${orderNumber} has been received.`, 
      'ORDER_UPDATE'
    );
    
    // Fetch full order to get user email
    const fullOrder = await this.orderRepo.findOrderById(order.id);
    if (fullOrder) {
      this.notificationService.dispatchEmail(
        fullOrder.user.email,
        'Order Confirmation',
        OrderTemplates.orderConfirmation(orderNumber, Number(order.totalAmount))
      );
    }
    
    return order;
  }

  async getMyOrders(userId: string) {
    return this.orderRepo.findOrdersByUser(userId);
  }

  async getOrderById(id: string) {
    const order = await this.orderRepo.findOrderById(id);
    if (!order) {
      throw new AppError('Order not found', 404, 'NOT_FOUND');
    }
    return order;
  }

  async getAllOrders(filters: QueryOrdersDto) {
    return this.orderRepo.findAllOrders(filters);
  }

  async updateOrderStatus(id: string, data: UpdateStatusDto) {
    const order = await this.orderRepo.findOrderById(id);
    
    if (!order) {
      throw new AppError('Order not found', 404, 'NOT_FOUND');
    }

    const currentStatus = order.status;
    const newStatus = data.status;

    // Enforce strict State Machine transitions
    if (currentStatus === OrderStatus.CANCELLED || currentStatus === OrderStatus.COLLECTED) {
      throw new AppError(`Cannot change status of a ${currentStatus} order.`, 400, 'INVALID_TRANSITION');
    }

    if (currentStatus === OrderStatus.PENDING && newStatus !== OrderStatus.PAID && newStatus !== OrderStatus.CANCELLED) {
      throw new AppError('A pending order can only transition to PAID or CANCELLED', 400, 'INVALID_TRANSITION');
    }

    if (currentStatus === OrderStatus.PAID && newStatus !== OrderStatus.PREPARING && newStatus !== OrderStatus.CANCELLED) {
      throw new AppError('A paid order can only transition to PREPARING or CANCELLED', 400, 'INVALID_TRANSITION');
    }

    if (currentStatus === OrderStatus.PREPARING && newStatus !== OrderStatus.READY && newStatus !== OrderStatus.CANCELLED) {
      throw new AppError('A preparing order can only transition to READY or CANCELLED', 400, 'INVALID_TRANSITION');
    }

    if (currentStatus === OrderStatus.READY && newStatus !== OrderStatus.COLLECTED && newStatus !== OrderStatus.CANCELLED) {
      throw new AppError('A ready order can only transition to COLLECTED or CANCELLED', 400, 'INVALID_TRANSITION');
    }

    const updatedOrder = await this.orderRepo.updateOrderStatus(id, newStatus);

    // Notify if food is READY
    if (newStatus === OrderStatus.READY) {
      this.notificationService.sendInAppNotification(
        order.userId,
        'Food is Ready!',
        `Your order ${order.orderNumber} is ready for collection at the counter.`,
        'ORDER_READY'
      );
      this.notificationService.dispatchEmail(
        order.user.email,
        'Food is Ready!',
        OrderTemplates.foodReady(order.orderNumber)
      );
    }

    return updatedOrder;
  }

  async decodeQr(token: string) {
    try {
      // 1. Verify and decode JWT
      const payload = this.qrService.verifySecureToken(token);
      
      // 2. Fetch the order with items
      const order = await this.orderRepo.findOrderById(payload.orderId);
      if (!order) {
        throw new AppError('Order not found', 404, 'NOT_FOUND');
      }

      // 3. Ensure it hasn't been collected yet
      if (order.status === OrderStatus.COLLECTED) {
        throw new AppError('This order has already been collected.', 400, 'ALREADY_COLLECTED');
      }

      if (!['PAID', 'PREPARING', 'READY'].includes(order.status)) {
        throw new AppError(`Order cannot be collected in its current status: ${order.status}`, 400, 'NOT_READY');
      }

      return order;
    } catch (error: any) {
      if (error.name === 'TokenExpiredError') {
        throw new AppError('QR Code has expired', 400, 'TOKEN_EXPIRED');
      }
      if (error.name === 'JsonWebTokenError') {
        throw new AppError('Invalid QR Code', 400, 'INVALID_TOKEN');
      }
      throw error;
    }
  }

  // Still keeping verifyAndCollectOrder for backward compatibility or alternate flows if needed
  async verifyAndCollectOrder(token: string) {
    const order = await this.decodeQr(token);
    return this.orderRepo.updateOrderStatus(order.id, OrderStatus.COLLECTED);
  }
}
