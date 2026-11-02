import { Response } from 'express';
import { AuthRequest } from '../types/index.js';
import {
  ConversationRepo,
  MessageRepo,
  BlockedUserRepo,
} from '../services/dataService.js';
import { emitToConversation } from '../sockets/socketManager.js';

export async function getConversations(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const convs = await ConversationRepo.findByUser(req.user._id);

    // Filter out conversations with blocked users
    const blocked = await BlockedUserRepo.findBlockedByUser(req.user._id);
    const blockedIds = blocked.map((b) =>
      typeof b.blockedUserId === 'object' ? (b.blockedUserId as any)._id : b.blockedUserId
    );

    const filtered = convs.filter((c) => {
      const otherParticipant = c.participants.find((p) => {
        const pId = typeof p === 'object' ? (p as any)._id : p;
        return pId !== req.user!._id;
      });
      const otherId =
        typeof otherParticipant === 'object'
          ? (otherParticipant as any)._id
          : otherParticipant;
      return !blockedIds.includes(otherId);
    });

    // Populate last message preview & unread count for each conversation
    const conversationsWithMeta = await Promise.all(
      filtered.map(async (c) => {
        const messages = await MessageRepo.findByConversation(c._id);
        const lastMsg = messages.length > 0 ? messages[messages.length - 1] : null;
        const unreadCount = messages.filter(
          (m) =>
            (typeof m.senderId === 'object' ? (m.senderId as any)._id : m.senderId) !==
              req.user!._id && !m.readBy.includes(req.user!._id)
        ).length;

        return {
          ...c,
          lastMessage: lastMsg,
          unreadCount,
        };
      })
    );

    res.json({ success: true, conversations: conversationsWithMeta });
  } catch (err: any) {
    console.error('getConversations error:', err);
    res.status(500).json({ success: false, message: 'Error retrieving conversations.' });
  }
}

export async function getConversationById(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { id } = req.params;
    const conversation = await ConversationRepo.findById(id);

    if (!conversation) {
      res.status(404).json({ success: false, message: 'Conversation not found.' });
      return;
    }

    const participantIds = conversation.participants.map((p) =>
      typeof p === 'object' ? (p as any)._id : p
    );

    if (!participantIds.includes(req.user._id)) {
      res.status(403).json({
        success: false,
        message: 'Access denied. You are not a participant in this conversation.',
      });
      return;
    }

    // Mark messages as read for this user
    await MessageRepo.markAsRead(id, req.user._id);

    res.json({ success: true, conversation });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Error fetching conversation.' });
  }
}

export async function getConversationMessages(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { id } = req.params;
    const conversation = await ConversationRepo.findById(id);

    if (!conversation) {
      res.status(404).json({ success: false, message: 'Conversation not found.' });
      return;
    }

    const participantIds = conversation.participants.map((p) =>
      typeof p === 'object' ? (p as any)._id : p
    );

    if (!participantIds.includes(req.user._id)) {
      res.status(403).json({
        success: false,
        message: 'Access denied. You are not a participant in this conversation.',
      });
      return;
    }

    // Mark as read
    await MessageRepo.markAsRead(id, req.user._id);

    const messages = await MessageRepo.findByConversation(id);
    res.json({ success: true, messages });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Error fetching messages.' });
  }
}

export async function endConversation(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { id } = req.params;
    const conversation = await ConversationRepo.findById(id);

    if (!conversation) {
      res.status(404).json({ success: false, message: 'Conversation not found.' });
      return;
    }

    const participantIds = conversation.participants.map((p) =>
      typeof p === 'object' ? (p as any)._id : p
    );

    if (!participantIds.includes(req.user._id)) {
      res.status(403).json({
        success: false,
        message: 'Access denied.',
      });
      return;
    }

    await ConversationRepo.update(id, {
      status: 'ended',
      endedBy: req.user._id as any,
    });

    const sysMsg = await MessageRepo.create({
      conversationId: id,
      senderId: req.user._id,
      messageType: 'system',
      content: `${req.user.nickname || req.user.anonymousUsername} has ended this conversation. Take care.`,
    });

    emitToConversation(id, 'conversation:ended', {
      conversationId: id,
      systemMessage: sysMsg,
    });

    res.json({
      success: true,
      message: 'Conversation has ended peacefully.',
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Error ending conversation.' });
  }
}
