import { Response } from 'express';
import { AuthRequest } from '../types/index.js';
import { NotificationRepo } from '../services/dataService.js';

export async function getNotifications(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const notifications = await NotificationRepo.findByUser(req.user._id);
    const unreadCount = await NotificationRepo.countUnread(req.user._id);

    res.json({
      success: true,
      notifications,
      unreadCount,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch notifications.' });
  }
}

export async function markNotificationAsRead(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { id } = req.params;
    await NotificationRepo.markAsRead(id, req.user._id);

    res.json({ success: true, message: 'Notification marked as read.' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to update notification.' });
  }
}

export async function markAllNotificationsAsRead(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    await NotificationRepo.markAllAsRead(req.user._id);
    res.json({ success: true, message: 'All notifications marked as read.' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to mark all as read.' });
  }
}
