import { Response, Request } from 'express';
import { AuthRequest } from '../types/index.js';
import {
  MessageRepo,
  ConversationRepo,
  NotificationRepo,
  BlockedUserRepo,
} from '../services/dataService.js';
import { emitToConversation, emitToUser } from '../sockets/socketManager.js';

export async function sendMessage(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { conversationId, content, attachments = [], messageType = 'text' } = req.body;

    if (!conversationId) {
      res.status(400).json({ success: false, message: 'conversationId is required.' });
      return;
    }

    if ((!content || content.trim() === '') && attachments.length === 0) {
      res.status(400).json({ success: false, message: 'Message content or attachment is required.' });
      return;
    }

    const conv = await ConversationRepo.findById(conversationId);
    if (!conv) {
      res.status(404).json({ success: false, message: 'Conversation not found.' });
      return;
    }

    const participantIds = conv.participants.map((p) =>
      typeof p === 'object' ? (p as any)._id : p
    );

    if (!participantIds.includes(req.user._id)) {
      res.status(403).json({ success: false, message: 'Not authorized for this conversation.' });
      return;
    }

    if (conv.status !== 'active') {
      res.status(400).json({
        success: false,
        message: 'This conversation has ended and no further messages can be sent.',
      });
      return;
    }

    const recipientId = participantIds.find((id) => id !== req.user!._id);
    if (recipientId) {
      const isBlocked = await BlockedUserRepo.isBlocked(req.user._id, recipientId);
      if (isBlocked) {
        res.status(403).json({ success: false, message: 'Cannot send message to this user.' });
        return;
      }
    }

    const message = await MessageRepo.create({
      conversationId,
      senderId: req.user._id,
      messageType: attachments.length > 0 && !content ? 'file' : messageType,
      content: content ? content.trim() : '',
      attachments,
    });

    // Real-time broadcast to conversation room
    emitToConversation(conversationId, 'message:new', message);

    // Notify recipient
    if (recipientId) {
      emitToUser(recipientId, 'message:received', {
        conversationId,
        message,
      });

      NotificationRepo.create({
        recipientId,
        type: 'new_message',
        referenceId: conversationId,
        title: 'New Message',
        message: `${req.user.nickname || req.user.anonymousUsername} sent you a message.`,
        link: `/messages/${conversationId}`,
      }).then((notif) => {
        emitToUser(recipientId, 'notification:new', notif);
      }).catch(() => {});
    }

    res.status(201).json({ success: true, message });
  } catch (err: any) {
    console.error('sendMessage error:', err);
    res.status(500).json({ success: false, message: 'Failed to send message.' });
  }
}

export async function deleteMessage(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { id } = req.params;
    const msg = await MessageRepo.findById(id);

    if (!msg) {
      res.status(404).json({ success: false, message: 'Message not found.' });
      return;
    }

    const senderId =
      typeof msg.senderId === 'object' ? (msg.senderId as any)._id : msg.senderId;

    if (senderId !== req.user._id && req.user.role !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'You can only delete your own messages.',
      });
      return;
    }

    const updated = await MessageRepo.markAsDeleted(id);

    // Broadcast deletion
    emitToConversation(msg.conversationId, 'message:deleted', {
      messageId: id,
      conversationId: msg.conversationId,
    });

    res.json({ success: true, message: 'Message deleted.', deletedMessage: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Error deleting message.' });
  }
}

export async function uploadAttachment(req: Request, res: Response): Promise<void> {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, message: 'No file uploaded.' });
      return;
    }

    const fileUrl = `/uploads/${req.file.filename}`;

    res.status(201).json({
      success: true,
      attachment: {
        url: fileUrl,
        filename: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
      },
    });
  } catch (err: any) {
    console.error('Upload error:', err);
    res.status(500).json({ success: false, message: 'Failed to process file upload.' });
  }
}
