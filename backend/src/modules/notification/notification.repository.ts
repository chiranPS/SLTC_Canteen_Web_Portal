import { PrismaClient } from '@prisma/client';

export class NotificationRepository {
  constructor(private prisma: PrismaClient) {}

  async createNotification(userId: string, title: string, message: string, type: string) {
    return this.prisma.notification.create({
      data: {
        userId,
        title,
        message,
        type,
      },
    });
  }

  async getNotificationsByUser(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async markAsRead(id: string, userId: string) {
    return this.prisma.notification.update({
      where: {
        id: id,
        userId: userId, // Ensure user owns the notification
      },
      data: { isRead: true },
    });
  }

  async markAllAsRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }
}
