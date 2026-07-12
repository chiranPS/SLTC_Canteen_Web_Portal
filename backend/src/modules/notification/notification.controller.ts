import { Request, Response } from 'express';
import { NotificationService } from './notification.service.js';
import { successResponse } from '../../shared/responses/apiResponse.js';

export class NotificationController {
  constructor(private notificationService: NotificationService) {}

  getMyNotifications = async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const notifications = await this.notificationService.getMyNotifications(userId);
    res.status(200).json(successResponse('Notifications fetched successfully', notifications));
  };

  markAsRead = async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const notificationId = req.params.id as string;
    const notification = await this.notificationService.markAsRead(notificationId, userId);
    res.status(200).json(successResponse('Notification marked as read', notification));
  };

  markAllAsRead = async (req: Request, res: Response) => {
    const userId = req.user!.id;
    await this.notificationService.markAllAsRead(userId);
    res.status(200).json(successResponse('All notifications marked as read', null));
  };
}
