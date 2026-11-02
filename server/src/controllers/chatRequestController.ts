import { Response } from 'express';
import { AuthRequest } from '../types/index.js';
import {
  ChatRequestRepo,
  PostRepo,
  UserRepo,
  ConversationRepo,
  BlockedUserRepo,
  NotificationRepo,
  MessageRepo,
} from '../services/dataService.js';
import { emitToUser } from '../sockets/socketManager.js';

export async function createChatRequest(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    const { postId, receiverId, introductionMessage } = req.body;

    let targetReceiverId = receiverId;

    if (postId) {
      const post = await PostRepo.findById(postId);
      if (!post) {
        res.status(404).json({ success: false, message: 'Referenced post not found.' });
        return;
      }
      if (!post.chatEnabled) {
        res.status(400).json({
          success: false,
          message: 'The author has turned off chat requests for this post.',
        });
        return;
      }
      const postAuthorId =
        typeof post.authorId === 'object' ? (post.authorId as any)._id : post.authorId;
      targetReceiverId = targetReceiverId || postAuthorId;
    }

    if (!targetReceiverId) {
      res.status(400).json({
        success: false,
        message: 'Recipient must be specified.',
      });
      return;
    }

    if (targetReceiverId === req.user._id) {
      res.status(400).json({
        success: false,
        message: 'You cannot request a chat with yourself.',
      });
      return;
    }

    // Check if blocked
    const isBlocked = await BlockedUserRepo.isBlocked(req.user._id, targetReceiverId);
    if (isBlocked) {
      res.status(403).json({
        success: false,
        message: 'Cannot send chat request to this user.',
      });
      return;
    }

    // Check if conversation already active
    const existingConv = await ConversationRepo.findBetween(req.user._id, targetReceiverId);
    if (existingConv && existingConv.status === 'active') {
      res.status(400).json({
        success: false,
        message: 'You already have an active conversation with this user.',
        conversationId: existingConv._id,
      });
      return;
    }

    // Check if duplicate pending request
    const existingReq = await ChatRequestRepo.findActiveBetween(
      req.user._id,
      targetReceiverId,
      postId
    );
    if (existingReq) {
      res.status(400).json({
        success: false,
        message: 'You already have a pending chat request with this user.',
      });
      return;
    }

    const newRequest = await ChatRequestRepo.create({
      senderId: req.user._id,
      receiverId: targetReceiverId,
      postId: postId || undefined,
      introductionMessage: introductionMessage ? introductionMessage.trim() : '',
      status: 'pending',
    });

    // Create Notification
    const notif = await NotificationRepo.create({
      recipientId: targetReceiverId,
      type: 'chat_request_received',
      referenceId: newRequest._id,
      title: 'New Chat Request',
      message: `${req.user.nickname || req.user.anonymousUsername} sent you a private chat request.`,
      link: '/requests',
    });

    // Emit live socket event
    emitToUser(targetReceiverId, 'notification:new', notif);
    emitToUser(targetReceiverId, 'chat_request:received', newRequest);

    res.status(201).json({
      success: true,
      message: 'Chat request sent. You will be notified when they accept.',
      chatRequest: newRequest,
    });
  } catch (err: any) {
    console.error('createChatRequest error:', err);
    res.status(500).json({ success: false, message: 'Failed to send chat request.' });
  }
}

export async function getReceivedRequests(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const requests = await ChatRequestRepo.findReceived(req.user._id);
    res.json({ success: true, requests });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Error fetching requests.' });
  }
}

export async function getSentRequests(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const requests = await ChatRequestRepo.findSent(req.user._id);
    res.json({ success: true, requests });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Error fetching sent requests.' });
  }
}

export async function acceptChatRequest(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { id } = req.params;
    const chatReq = await ChatRequestRepo.findById(id);

    if (!chatReq) {
      res.status(404).json({ success: false, message: 'Chat request not found.' });
      return;
    }

    const receiverId =
      typeof chatReq.receiverId === 'object'
        ? (chatReq.receiverId as any)._id
        : chatReq.receiverId;

    if (receiverId !== req.user._id) {
      res.status(403).json({
        success: false,
        message: 'You are not authorized to accept this request.',
      });
      return;
    }

    if (chatReq.status !== 'pending') {
      res.status(400).json({
        success: false,
        message: `This request is already ${chatReq.status}.`,
      });
      return;
    }

    const senderId =
      typeof chatReq.senderId === 'object' ? (chatReq.senderId as any)._id : chatReq.senderId;

    // Update status to accepted
    const updatedReq = await ChatRequestRepo.updateStatus(id, 'accepted');

    // Create conversation
    let conversation = await ConversationRepo.findBetween(senderId, receiverId);
    if (!conversation) {
      conversation = await ConversationRepo.create({
        participants: [senderId, receiverId],
        chatRequestId: id,
        postId: chatReq.postId
          ? typeof chatReq.postId === 'object'
            ? (chatReq.postId as any)._id
            : chatReq.postId
          : undefined,
        status: 'active',
      });

      // Insert introductory message if present
      if (chatReq.introductionMessage) {
        await MessageRepo.create({
          conversationId: conversation._id,
          senderId: senderId,
          messageType: 'text',
          content: chatReq.introductionMessage,
        });
      }

      // Insert welcoming system message
      await MessageRepo.create({
        conversationId: conversation._id,
        senderId: receiverId,
        messageType: 'system',
        content:
          'Private connection started. Remember: be empathetic, respectful, and never share personally identifiable information.',
      });
    } else {
      // Re-activate conversation if ended
      await ConversationRepo.update(conversation._id, { status: 'active' });
    }

    // Notify sender
    const notif = await NotificationRepo.create({
      recipientId: senderId,
      type: 'chat_request_accepted',
      referenceId: conversation._id,
      title: 'Chat Request Accepted',
      message: `${req.user.nickname || req.user.anonymousUsername} accepted your chat request. You can now chat!`,
      link: `/messages/${conversation._id}`,
    });

    emitToUser(senderId, 'notification:new', notif);
    emitToUser(senderId, 'chat_request:accepted', {
      requestId: id,
      conversationId: conversation._id,
    });

    res.json({
      success: true,
      message: 'Chat request accepted.',
      request: updatedReq,
      conversationId: conversation._id,
    });
  } catch (err: any) {
    console.error('acceptChatRequest error:', err);
    res.status(500).json({ success: false, message: 'Failed to accept request.' });
  }
}

export async function declineChatRequest(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { id } = req.params;
    const chatReq = await ChatRequestRepo.findById(id);

    if (!chatReq) {
      res.status(404).json({ success: false, message: 'Chat request not found.' });
      return;
    }

    const receiverId =
      typeof chatReq.receiverId === 'object'
        ? (chatReq.receiverId as any)._id
        : chatReq.receiverId;

    if (receiverId !== req.user._id) {
      res.status(403).json({
        success: false,
        message: 'You are not authorized to decline this request.',
      });
      return;
    }

    const updated = await ChatRequestRepo.updateStatus(id, 'declined');

    const senderId =
      typeof chatReq.senderId === 'object' ? (chatReq.senderId as any)._id : chatReq.senderId;

    emitToUser(senderId, 'chat_request:declined', { requestId: id });

    res.json({
      success: true,
      message: 'Chat request declined.',
      request: updated,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to decline request.' });
  }
}

export async function cancelChatRequest(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { id } = req.params;
    const chatReq = await ChatRequestRepo.findById(id);

    if (!chatReq) {
      res.status(404).json({ success: false, message: 'Chat request not found.' });
      return;
    }

    const senderId =
      typeof chatReq.senderId === 'object' ? (chatReq.senderId as any)._id : chatReq.senderId;

    if (senderId !== req.user._id) {
      res.status(403).json({
        success: false,
        message: 'You can only cancel your own requests.',
      });
      return;
    }

    await ChatRequestRepo.delete(id);

    const receiverId =
      typeof chatReq.receiverId === 'object'
        ? (chatReq.receiverId as any)._id
        : chatReq.receiverId;

    emitToUser(receiverId, 'chat_request:cancelled', { requestId: id });

    res.json({
      success: true,
      message: 'Chat request cancelled.',
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to cancel request.' });
  }
}
