export class NotificationRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createNotification(userId, title, message, type) {
        return this.prisma.notification.create({
            data: {
                userId,
                title,
                message,
                type,
            },
        });
    }
    async getNotificationsByUser(userId) {
        return this.prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
    }
    async markAsRead(id, userId) {
        return this.prisma.notification.update({
            where: {
                id: id,
                userId: userId, // Ensure user owns the notification
            },
            data: { isRead: true },
        });
    }
    async markAllAsRead(userId) {
        return this.prisma.notification.updateMany({
            where: { userId, isRead: false },
            data: { isRead: true },
        });
    }
}
