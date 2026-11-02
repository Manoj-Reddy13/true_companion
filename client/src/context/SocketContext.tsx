import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext.js';
import { getSocket } from '../services/socket.js';
import { NotificationItem } from '../types/index.js';
import { notificationsApi } from '../services/api.js';

interface Toast {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
}

interface SocketContextType {
  onlineUserIds: Set<string>;
  notifications: NotificationItem[];
  unreadNotificationCount: number;
  toasts: Toast[];
  showToast: (title: string, message: string, type?: Toast['type']) => void;
  removeToast: (id: string) => void;
  fetchNotifications: () => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  checkUserOnline: (userId: string) => boolean;
}

const SocketContext = createContext<SocketContextType>({} as SocketContextType);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, token } = useAuth();
  const [onlineUserIds, setOnlineUserIds] = useState<Set<string>>(new Set());
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (
    title: string,
    message: string,
    type: Toast['type'] = 'info'
  ) => {
    const id = `${Date.now()}-${Math.random()}`;
    const newToast: Toast = { id, title, message, type };
    setToasts((prev) => [...prev, newToast]);
    setTimeout(() => {
      removeToast(id);
    }, 5000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const data = await notificationsApi.getAll();
      if (data.success) {
        setNotifications(data.notifications);
        setUnreadNotificationCount(data.unreadCount);
      }
    } catch (err) {
      // Ignore background errors
    }
  };

  const markNotificationRead = async (id: string) => {
    try {
      await notificationsApi.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadNotificationCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error(err);
    }
  };

  const markAllNotificationsRead = async () => {
    try {
      await notificationsApi.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadNotificationCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  const checkUserOnline = (userId: string) => {
    return onlineUserIds.has(userId);
  };

  useEffect(() => {
    if (!user || !token) {
      setNotifications([]);
      setUnreadNotificationCount(0);
      return;
    }

    fetchNotifications();

    const socket = getSocket(token);
    if (!socket) return;

    const handlePresence = ({ userId, status }: { userId: string; status: string }) => {
      setOnlineUserIds((prev) => {
        const next = new Set(prev);
        if (status === 'online') {
          next.add(userId);
        } else {
          next.delete(userId);
        }
        return next;
      });
    };

    const handleNewNotification = (notif: NotificationItem) => {
      setNotifications((prev) => [notif, ...prev]);
      setUnreadNotificationCount((prev) => prev + 1);
      showToast(notif.title, notif.message, 'info');
    };

    socket.on('presence:update', handlePresence);
    socket.on('notification:new', handleNewNotification);

    return () => {
      socket.off('presence:update', handlePresence);
      socket.off('notification:new', handleNewNotification);
    };
  }, [user, token]);

  return (
    <SocketContext.Provider
      value={{
        onlineUserIds,
        notifications,
        unreadNotificationCount,
        toasts,
        showToast,
        removeToast,
        fetchNotifications,
        markNotificationRead,
        markAllNotificationsRead,
        checkUserOnline,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
