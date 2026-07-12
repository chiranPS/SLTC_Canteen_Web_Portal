import { AppError } from '../../shared/errors/AppError.js';
export class NotificationService {
    notificationRepo;
    notificationQueue;
    constructor(notificationRepo, notificationQueue) {
        this.notificationRepo = notificationRepo;
        this.notificationQueue = notificationQueue;
    }
    /**
     * Saves an in-app notification to the database.
     */
    async sendInAppNotification(userId, title, message, type = 'INFO') {
        return this.notificationRepo.createNotification(userId, title, message, type);
    }
    /**
     * Dispatches an email to the asynchronous queue.
     */
    dispatchEmail(to, subject, html) {
        this.notificationQueue.dispatchEmail(to, subject, html);
    }
    async getMyNotifications(userId) {
        return this.notificationRepo.getNotificationsByUser(userId);
    }
    async markAsRead(id, userId) {
        try {
            const notification = await this.notificationRepo.markAsRead(id, userId);
            return notification;
        }
        catch (error) {
            throw new AppError('Notification not found or unauthorized', 404, 'NOT_FOUND');
        }
    }
    async markAllAsRead(userId) {
        await this.notificationRepo.markAllAsRead(userId);
        return { success: true };
    }
}
