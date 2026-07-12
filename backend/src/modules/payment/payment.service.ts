import { PaymentRepository } from './payment.repository.js';
import { OrderRepository } from '../order/order.repository.js';
import { IPaymentProvider } from '../../shared/utils/payment-providers/payment.provider.interface.js';
import { QRService } from '../../shared/utils/qr.service.js';
import { AppError } from '../../shared/errors/AppError.js';
import { OrderStatus } from '@prisma/client';
import { logger } from '../../config/logger.js';
import { NotificationService } from '../notification/notification.service.js';
import { OrderTemplates } from '../../shared/utils/email.templates.js';

export class PaymentService {
  constructor(
    private paymentRepo: PaymentRepository,
    private orderRepo: OrderRepository,
    private paymentProvider: IPaymentProvider,
    private qrService: QRService,
    private notificationService: NotificationService
  ) {}

  async initiatePayment(orderId: string, userId: string) {
    const order = await this.orderRepo.findOrderById(orderId);

    if (!order) {
      throw new AppError('Order not found', 404, 'NOT_FOUND');
    }

    if (order.userId !== userId) {
      throw new AppError('Unauthorized access to this order', 403, 'FORBIDDEN');
    }

    if (order.status !== OrderStatus.PENDING) {
      throw new AppError('Payment can only be initiated for PENDING orders', 400, 'INVALID_STATE');
    }

    // Call abstract provider to create a checkout session
    const intent = await this.paymentProvider.createPaymentIntent(
      order.id, 
      Number(order.totalAmount), 
      order.user.email
    );

    // Save the pending payment record in our DB
    await this.paymentRepo.createPaymentRecord(order.id, Number(order.totalAmount), intent.transactionId);

    // [SIMULATION ONLY] Auto-fire the webhook after 1 second for seamless testing
    setTimeout(async () => {
      try {
        const payload = JSON.stringify({
          transactionId: intent.transactionId,
          status: 'success'
        });
        await this.handleWebhook(payload, 'mock-signature-123');
      } catch (err) {
        logger.error('Mock webhook simulation failed:', err);
      }
    }, 1000);

    return {
      checkoutUrl: intent.checkoutUrl,
    };
  }

  async handleWebhook(payload: string, signature: string) {
    // 1. Verify signature
    const isValid = this.paymentProvider.verifyWebhookSignature(payload, signature);
    if (!isValid) {
      throw new AppError('Invalid webhook signature', 401, 'UNAUTHORIZED_WEBHOOK');
    }

    // 2. Parse payload (assuming JSON for this demo)
    let data;
    try {
      data = JSON.parse(payload);
    } catch (e) {
      throw new AppError('Invalid payload format', 400, 'BAD_REQUEST');
    }

    const { transactionId, status } = data; // Expected structure from our mock provider

    const payment = await this.paymentRepo.findPaymentByTransactionId(transactionId);
    if (!payment) {
      logger.warn(`Webhook received for unknown transaction: ${transactionId}`);
      return;
    }

    if (payment.status !== 'PENDING') {
      logger.info(`Payment ${payment.id} is already processed. Status: ${payment.status}`);
      return;
    }

    // 3. Process outcome
    if (status === 'success') {
      // Generate the secure JWT specifically for this paid order
      const secureToken = this.qrService.generateSecureToken({
        orderId: payment.order.id,
        orderNumber: payment.order.orderNumber,
      });

      // Encode the secure token into the QR Image
      const qrStringBase64 = await this.qrService.generateQRCodeBase64(secureToken);

      // Save atomically
      await this.paymentRepo.markPaymentSuccess(payment.id, payment.order.id, qrStringBase64);
      logger.info(`Payment successful for Order ${payment.order.id}. Generated secure QR code.`);

      // Send Email & Notification
      this.notificationService.dispatchEmail(
        payment.order.user.email,
        'Payment Successful',
        OrderTemplates.paymentSuccess(payment.order.orderNumber, Number(payment.amount))
      );
      this.notificationService.sendInAppNotification(
        payment.order.user.id,
        'Payment Successful',
        `Your payment for order ${payment.order.orderNumber} was successful. Kitchen is preparing your food!`,
        'PAYMENT_SUCCESS'
      );

    } else if (status === 'failed') {
      await this.paymentRepo.markPaymentFailed(payment.id);
      logger.info(`Payment failed for Order ${payment.order.id}.`);
    }
  }
}
