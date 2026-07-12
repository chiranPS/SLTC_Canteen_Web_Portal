import { NotificationRepository } from './notification.repository.js';
import { NotificationQueue } from '../../shared/utils/notification.queue.js';
import { AppError } from '../../shared/errors/AppError.js';

export class NotificationService {
  constructor(
    private notificationRepo: NotificationRepository,
    private notificationQueue: NotificationQueue
  ) {}

  /**
   * Saves an in-app notification to the database.
   */
  async sendInAppNotification(userId: string, title: string, message: string, type: string = 'INFO') {
    return this.notificationRepo.createNotification(userId, title, message, type);
  }

  /**
   * Dispatches an email to the asynchronous queue.
   */
  dispatchEmail(to: string, subject: string, html: string) {
    this.notificationQueue.dispatchEmail(to, subject, html);
  }

  async getMyNotifications(userId: string) {
    return this.notificationRepo.getNotificationsByUser(userId);
  }

  async markAsRead(id: string, userId: string) {
    try {
      const notification = await this.notificationRepo.markAsRead(id, userId);
      return notification;
    } catch (error) {
      throw new AppError('Notification not found or unauthorized', 404, 'NOT_FOUND');
    }
  }

  async markAllAsRead(userId: string) {
    await this.notificationRepo.markAllAsRead(userId);
    return { success: true };
  }
}
