import { successResponse } from '../../shared/responses/apiResponse.js';
export class NotificationController {
    notificationService;
    constructor(notificationService) {
        this.notificationService = notificationService;
    }
    getMyNotifications = async (req, res) => {
        const userId = req.user.id;
        const notifications = await this.notificationService.getMyNotifications(userId);
        res.status(200).json(successResponse('Notifications fetched successfully', notifications));
    };
    markAsRead = async (req, res) => {
        const userId = req.user.id;
        const notificationId = req.params.id;
        const notification = await this.notificationService.markAsRead(notificationId, userId);
        res.status(200).json(successResponse('Notification marked as read', notification));
    };
    markAllAsRead = async (req, res) => {
        const userId = req.user.id;
        await this.notificationService.markAllAsRead(userId);
        res.status(200).json(successResponse('All notifications marked as read', null));
    };
}
