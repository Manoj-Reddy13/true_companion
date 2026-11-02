import { Response } from 'express';
import { AuthRequest, UserStatus } from '../types/index.js';
import {
  UserRepo,
  PostRepo,
  ConversationRepo,
  ReportRepo,
} from '../services/dataService.js';

export async function getDashboardStats(_req: AuthRequest, res: Response): Promise<void> {
  try {
    const [
      totalUsers,
      activeUsers,
      suspendedUsers,
      bannedUsers,
      totalPosts,
      totalConversations,
      pendingReports,
      resolvedReports,
    ] = await Promise.all([
      UserRepo.count(),
      UserRepo.count({ status: 'active' }),
      UserRepo.count({ status: 'suspended' }),
      UserRepo.count({ status: 'banned' }),
      PostRepo.count({ status: 'active' }),
      ConversationRepo.count(),
      ReportRepo.count({ status: 'pending' }),
      ReportRepo.count({ status: 'resolved' }),
    ]);

    res.json({
      success: true,
      stats: {
        totalUsers,
        activeUsers,
        suspendedUsers,
        bannedUsers,
        totalPosts,
        totalConversations,
        pendingReports,
        resolvedReports,
      },
    });
  } catch (err: any) {
    console.error('getDashboardStats error:', err);
    res.status(500).json({ success: false, message: 'Failed to compute dashboard statistics.' });
  }
}

export async function getAllUsers(_req: AuthRequest, res: Response): Promise<void> {
  try {
    const users = await UserRepo.getAll();
    res.json({ success: true, users });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch users list.' });
  }
}

export async function updateUserStatus(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { status, warningCount, suspensionDays } = req.body;

    const user = await UserRepo.findById(id);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    const updates: any = {};
    if (status) updates.status = status as UserStatus;
    if (warningCount !== undefined) updates.warningCount = warningCount;

    if (status === 'suspended' && suspensionDays) {
      updates.suspensionUntil = new Date(Date.now() + suspensionDays * 24 * 60 * 60 * 1000);
    } else if (status === 'active') {
      updates.suspensionUntil = null;
    }

    const updated = await UserRepo.update(id, updates);

    res.json({
      success: true,
      message: 'User status successfully modified.',
      user: updated,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to update user.' });
  }
}
