import { Response } from 'express';
import { AuthRequest } from '../types/index.js';
import {
  UserRepo,
  PostRepo,
  BlockedUserRepo,
  ConversationRepo,
} from '../services/dataService.js';

export async function getUserProfile(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const user = await UserRepo.findById(id);

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    // Never return email or private settings to other users
    const postCount = await PostRepo.count({ authorId: user._id, status: 'active' });

    res.json({
      success: true,
      profile: {
        _id: user._id,
        anonymousUsername: user.anonymousUsername,
        nickname: user.nickname,
        avatar: user.avatar,
        bio: user.bio,
        role: user.role,
        createdAt: user.createdAt,
        postCount,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Error retrieving profile.' });
  }
}

export async function updateProfile(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { nickname, avatar, bio } = req.body;

    const updates: any = {};
    if (nickname !== undefined) updates.nickname = nickname.trim().slice(0, 30);
    if (avatar !== undefined) updates.avatar = avatar;
    if (bio !== undefined) updates.bio = bio.trim().slice(0, 200);

    const updated = await UserRepo.update(req.user._id, updates);

    res.json({
      success: true,
      message: 'Profile updated successfully.',
      user: updated,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Error updating profile.' });
  }
}

export async function blockUser(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { id: targetUserId } = req.params;
    const { reason } = req.body;

    if (targetUserId === req.user._id) {
      res.status(400).json({ success: false, message: 'You cannot block yourself.' });
      return;
    }

    const targetUser = await UserRepo.findById(targetUserId);
    if (!targetUser) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    await BlockedUserRepo.block(req.user._id, targetUserId, reason);

    // End active conversations if any
    const existingConv = await ConversationRepo.findBetween(req.user._id, targetUserId);
    if (existingConv) {
      await ConversationRepo.update(existingConv._id, { status: 'blocked' });
    }

    res.json({
      success: true,
      message: `${targetUser.nickname || targetUser.anonymousUsername} has been blocked.`,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to block user.' });
  }
}

export async function unblockUser(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { id: targetUserId } = req.params;
    await BlockedUserRepo.unblock(req.user._id, targetUserId);

    res.json({
      success: true,
      message: 'User has been unblocked.',
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to unblock user.' });
  }
}

export async function getBlockedUsers(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const blocked = await BlockedUserRepo.findBlockedByUser(req.user._id);
    res.json({ success: true, blocked });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to retrieve blocked users.' });
  }
}

export async function deleteAccount(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const userId = req.user._id;

    // Remove user account
    await UserRepo.delete(userId);

    res.json({
      success: true,
      message: 'Your account and personal data have been completely deleted.',
    });
  } catch (err: any) {
    console.error('deleteAccount error:', err);
    res.status(500).json({ success: false, message: 'Failed to delete account.' });
  }
}
