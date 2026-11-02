import { Server as SocketIOServer, Socket } from 'socket.io';
import { verifyToken } from '../utils/token.js';
import { UserRepo, ConversationRepo, MessageRepo } from '../services/dataService.js';
import { setSocketIO } from './socketManager.js';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userRole?: string;
}

// Track online user sockets
const onlineUsers = new Map<string, Set<string>>();

export function setupSocketIO(io: SocketIOServer) {
  setSocketIO(io);

  // Authentication Middleware for Socket.IO
  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.replace('Bearer ', '') ||
        (socket.handshake.query?.token as string);

      if (!token) {
        return next(new Error('Authentication token required'));
      }

      const decoded = verifyToken(token);
      const user = await UserRepo.findById(decoded.userId);

      if (!user || user.status === 'banned') {
        return next(new Error('Unauthorized or account suspended'));
      }

      socket.userId = user._id;
      socket.userRole = user.role;
      next();
    } catch (err) {
      next(new Error('Invalid socket authentication token'));
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    const userId = socket.userId!;

    // Register user to their personal notification room
    socket.join(`user:${userId}`);

    // Track online status
    if (!onlineUsers.has(userId)) {
      onlineUsers.set(userId, new Set());
    }
    onlineUsers.get(userId)!.add(socket.id);

    // Broadcast user's online state to anyone interested
    io.emit('presence:update', { userId, status: 'online' });

    // Client requests check on a user's online status
    socket.on('presence:check', (targetUserId: string, callback) => {
      const isOnline = onlineUsers.has(targetUserId) && onlineUsers.get(targetUserId)!.size > 0;
      if (typeof callback === 'function') {
        callback({ userId: targetUserId, status: isOnline ? 'online' : 'offline' });
      }
    });

    // Join a conversation room (strictly authorized)
    socket.on('conversation:join', async (conversationId: string) => {
      try {
        const conv = await ConversationRepo.findById(conversationId);
        if (!conv) return;

        const participantIds = conv.participants.map((p) =>
          typeof p === 'object' ? (p as any)._id : p
        );

        if (participantIds.includes(userId)) {
          socket.join(`conv:${conversationId}`);
        }
      } catch (err) {
        console.error('Error joining conversation room:', err);
      }
    });

    // Leave a conversation room
    socket.on('conversation:leave', (conversationId: string) => {
      socket.leave(`conv:${conversationId}`);
    });

    // Typing start indicator
    socket.on('typing:start', async ({ conversationId }: { conversationId: string }) => {
      try {
        const user = await UserRepo.findById(userId);
        socket.to(`conv:${conversationId}`).emit('typing:status', {
          conversationId,
          userId,
          username: user?.nickname || user?.anonymousUsername || 'Someone',
          isTyping: true,
        });
      } catch (err) {
        console.error('typing:start error:', err);
      }
    });

    // Typing stop indicator
    socket.on('typing:stop', ({ conversationId }: { conversationId: string }) => {
      socket.to(`conv:${conversationId}`).emit('typing:status', {
        conversationId,
        userId,
        isTyping: false,
      });
    });

    // Message read receipt
    socket.on(
      'message:read',
      async ({ conversationId }: { conversationId: string }) => {
        try {
          await MessageRepo.markAsRead(conversationId, userId);
          socket.to(`conv:${conversationId}`).emit('message:read_receipt', {
            conversationId,
            readByUserId: userId,
          });
        } catch (err) {
          console.error('message:read error:', err);
        }
      }
    );

    // Disconnect handling
    socket.on('disconnect', () => {
      const userSockets = onlineUsers.get(userId);
      if (userSockets) {
        userSockets.delete(socket.id);
        if (userSockets.size === 0) {
          onlineUsers.delete(userId);
          io.emit('presence:update', { userId, status: 'offline' });
        }
      }
    });
  });
}
