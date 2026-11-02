import { Response } from 'express';
import { AuthRequest, ReportReason, AdminActionType, ReportStatus } from '../types/index.js';
import {
  ReportRepo,
  PostRepo,
  UserRepo,
  NotificationRepo,
} from '../services/dataService.js';
import { emitToUser } from '../sockets/socketManager.js';

export async function createReport(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const {
      reason,
      description,
      reportedUserId,
      postId,
      messageId,
    } = req.body;

    if (!reason) {
      res.status(400).json({ success: false, message: 'Please specify a reason for this report.' });
      return;
    }

    if (reportedUserId === req.user._id) {
      res.status(400).json({ success: false, message: 'You cannot report your own account.' });
      return;
    }

    const report = await ReportRepo.create({
      reporterId: req.user._id,
      reportedUserId: reportedUserId || undefined,
      postId: postId || undefined,
      messageId: messageId || undefined,
      reason: reason as ReportReason,
      description: description ? description.trim() : '',
      status: 'pending',
    });

    res.status(201).json({
      success: true,
      message: 'Thank you for keeping our community safe. Our moderation team will review this report carefully.',
      report,
    });
  } catch (err: any) {
    console.error('createReport error:', err);
    res.status(500).json({ success: false, message: 'Failed to submit report.' });
  }
}

export async function getReports(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { status } = req.query;
    const reports = await ReportRepo.find({
      status: status ? (status as ReportStatus) : undefined,
    });
    res.json({ success: true, reports });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Error retrieving reports.' });
  }
}

export async function updateReport(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { id } = req.params;
    const { status, adminAction, adminNotes } = req.body;

    const report = await ReportRepo.findById(id);
    if (!report) {
      res.status(404).json({ success: false, message: 'Report not found.' });
      return;
    }

    const action = adminAction as AdminActionType;
    const newStatus: ReportStatus = status || 'resolved';

    // Execute requested administrative moderation action
    if (action === 'post_removed' && report.postId) {
      const pId = typeof report.postId === 'object' ? (report.postId as any)._id : report.postId;
      await PostRepo.update(pId, { status: 'hidden' });
    } else if (action === 'account_suspended' && report.reportedUserId) {
      const uId =
        typeof report.reportedUserId === 'object'
          ? (report.reportedUserId as any)._id
          : report.reportedUserId;
      const targetUser = await UserRepo.findById(uId);
      if (targetUser) {
        // Suspend for 7 days
        const suspensionUntil = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        await UserRepo.update(uId, {
          status: 'suspended',
          suspensionUntil,
          warningCount: (targetUser.warningCount || 0) + 1,
        });

        // Notify user
        const notif = await NotificationRepo.create({
          recipientId: uId,
          type: 'safety_notice',
          title: 'Account Suspended',
          message:
            'Your account has been temporarily suspended for 7 days due to community guidelines violation.',
        });
        emitToUser(uId, 'notification:new', notif);
      }
    } else if (action === 'account_banned' && report.reportedUserId) {
      const uId =
        typeof report.reportedUserId === 'object'
          ? (report.reportedUserId as any)._id
          : report.reportedUserId;
      await UserRepo.update(uId, { status: 'banned' });

      const notif = await NotificationRepo.create({
        recipientId: uId,
        type: 'safety_notice',
        title: 'Account Terminated',
        message: 'Your account has been permanently banned from True Companion.',
      });
      emitToUser(uId, 'notification:new', notif);
    } else if (action === 'warning_issued' && report.reportedUserId) {
      const uId =
        typeof report.reportedUserId === 'object'
          ? (report.reportedUserId as any)._id
          : report.reportedUserId;
      const targetUser = await UserRepo.findById(uId);
      if (targetUser) {
        await UserRepo.update(uId, { warningCount: (targetUser.warningCount || 0) + 1 });
        const notif = await NotificationRepo.create({
          recipientId: uId,
          type: 'safety_notice',
          title: 'Community Warning',
          message:
            'A warning has been recorded for your account. Please adhere to compassionate community guidelines.',
        });
        emitToUser(uId, 'notification:new', notif);
      }
    }

    const updated = await ReportRepo.update(id, {
      status: newStatus,
      adminAction: action || 'none',
      adminNotes: adminNotes || '',
      reviewedBy: req.user._id as any,
      resolvedAt: new Date(),
    });

    // Notify original reporter that their report was resolved
    const repId =
      typeof report.reporterId === 'object'
        ? (report.reporterId as any)._id
        : report.reporterId;
    if (repId) {
      const notif = await NotificationRepo.create({
        recipientId: repId,
        type: 'report_update',
        title: 'Report Update',
        message: 'Your report has been reviewed and appropriate moderation action was taken. Thank you.',
      });
      emitToUser(repId, 'notification:new', notif);
    }

    res.json({
      success: true,
      message: 'Moderation action applied successfully.',
      report: updated,
    });
  } catch (err: any) {
    console.error('updateReport error:', err);
    res.status(500).json({ success: false, message: 'Failed to update report.' });
  }
}
