import axios from 'axios';
import {
  User,
  Post,
  ChatRequest,
  Conversation,
  Message,
  Report,
  NotificationItem,
  BlockedUser,
  PostCategory,
} from '../types/index.js';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('true_companion_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor to catch 401 unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Don't auto-clear if it was just an optional auth request
      if (
        error.config.url !== '/posts' &&
        !error.config.url?.startsWith('/posts/') &&
        localStorage.getItem('true_companion_token')
      ) {
        // Keep or handle gracefully
      }
    }
    return Promise.reject(error);
  }
);

// ----------------- AUTH API -----------------
export const authApi = {
  generateUsername: async () => {
    const res = await api.get<{ success: boolean; username: string }>('/auth/generate-username');
    return res.data;
  },
  register: async (data: {
    anonymousUsername?: string;
    nickname?: string;
    email?: string;
    password?: string;
  }) => {
    const res = await api.post<{
      success: boolean;
      token: string;
      user: User;
      message: string;
    }>('/auth/register', data);
    return res.data;
  },
  login: async (identifier: string, password?: string) => {
    const res = await api.post<{
      success: boolean;
      token: string;
      user: User;
      message: string;
    }>('/auth/login', { identifier, password });
    return res.data;
  },
  getMe: async () => {
    const res = await api.get<{ success: boolean; user: User }>('/auth/me');
    return res.data;
  },
};

// ----------------- POSTS API -----------------
export const postsApi = {
  getPosts: async (params: {
    category?: string;
    search?: string;
    authorId?: string;
    page?: number;
    limit?: number;
  }) => {
    const res = await api.get<{
      success: boolean;
      posts: Post[];
      total: number;
      page: number;
      totalPages: number;
    }>('/posts', { params });
    return res.data;
  },
  getPostById: async (id: string) => {
    const res = await api.get<{ success: boolean; post: Post }>(`/posts/${id}`);
    return res.data;
  },
  createPost: async (data: {
    title: string;
    description: string;
    category: PostCategory;
    chatEnabled?: boolean;
    attachments?: any[];
  }) => {
    const res = await api.post<{ success: boolean; message: string; post: Post }>(
      '/posts',
      data
    );
    return res.data;
  },
  updatePost: async (id: string, data: Partial<Post>) => {
    const res = await api.put<{ success: boolean; post: Post }>(`/posts/${id}`, data);
    return res.data;
  },
  deletePost: async (id: string) => {
    const res = await api.delete<{ success: boolean; message: string }>(`/posts/${id}`);
    return res.data;
  },
  toggleBookmark: async (id: string) => {
    const res = await api.post<{
      success: boolean;
      bookmarked: boolean;
      bookmarks: string[];
      message: string;
    }>(`/posts/${id}/bookmark`);
    return res.data;
  },
  getBookmarkedPosts: async () => {
    const res = await api.get<{ success: boolean; posts: Post[] }>('/posts/bookmarks');
    return res.data;
  },
};

// ----------------- CHAT REQUESTS API -----------------
export const chatRequestsApi = {
  create: async (data: {
    postId?: string;
    receiverId?: string;
    introductionMessage?: string;
  }) => {
    const res = await api.post<{
      success: boolean;
      message: string;
      chatRequest: ChatRequest;
      conversationId?: string;
    }>('/chat-requests', data);
    return res.data;
  },
  getReceived: async () => {
    const res = await api.get<{ success: boolean; requests: ChatRequest[] }>(
      '/chat-requests/received'
    );
    return res.data;
  },
  getSent: async () => {
    const res = await api.get<{ success: boolean; requests: ChatRequest[] }>(
      '/chat-requests/sent'
    );
    return res.data;
  },
  accept: async (id: string) => {
    const res = await api.patch<{
      success: boolean;
      message: string;
      request: ChatRequest;
      conversationId: string;
    }>(`/chat-requests/${id}/accept`);
    return res.data;
  },
  decline: async (id: string) => {
    const res = await api.patch<{ success: boolean; message: string }>(
      `/chat-requests/${id}/decline`
    );
    return res.data;
  },
  cancel: async (id: string) => {
    const res = await api.delete<{ success: boolean; message: string }>(
      `/chat-requests/${id}`
    );
    return res.data;
  },
};

// ----------------- CONVERSATIONS API -----------------
export const conversationsApi = {
  getAll: async () => {
    const res = await api.get<{ success: boolean; conversations: Conversation[] }>(
      '/conversations'
    );
    return res.data;
  },
  getById: async (id: string) => {
    const res = await api.get<{ success: boolean; conversation: Conversation }>(
      `/conversations/${id}`
    );
    return res.data;
  },
  getMessages: async (id: string) => {
    const res = await api.get<{ success: boolean; messages: Message[] }>(
      `/conversations/${id}/messages`
    );
    return res.data;
  },
  end: async (id: string) => {
    const res = await api.post<{ success: boolean; message: string }>(
      `/conversations/${id}/end`
    );
    return res.data;
  },
};

// ----------------- MESSAGES API -----------------
export const messagesApi = {
  send: async (data: {
    conversationId: string;
    content: string;
    attachments?: any[];
    messageType?: string;
  }) => {
    const res = await api.post<{ success: boolean; message: Message }>('/messages', data);
    return res.data;
  },
  delete: async (id: string) => {
    const res = await api.delete<{ success: boolean; message: string }>(`/messages/${id}`);
    return res.data;
  },
  uploadAttachment: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post<{
      success: boolean;
      attachment: {
        url: string;
        filename: string;
        mimetype: string;
        size: number;
      };
    }>('/messages/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },
};

// ----------------- REPORTS API -----------------
export const reportsApi = {
  create: async (data: {
    reason: string;
    description?: string;
    reportedUserId?: string;
    postId?: string;
    messageId?: string;
  }) => {
    const res = await api.post<{ success: boolean; message: string; report: Report }>(
      '/reports',
      data
    );
    return res.data;
  },
  getAll: async (status?: string) => {
    const res = await api.get<{ success: boolean; reports: Report[] }>('/reports', {
      params: { status },
    });
    return res.data;
  },
  update: async (
    id: string,
    data: { status?: string; adminAction?: string; adminNotes?: string }
  ) => {
    const res = await api.patch<{ success: boolean; report: Report }>(
      `/reports/${id}`,
      data
    );
    return res.data;
  },
};

// ----------------- USERS API -----------------
export const usersApi = {
  getProfile: async (id: string) => {
    const res = await api.get<{
      success: boolean;
      profile: {
        _id: string;
        anonymousUsername: string;
        nickname?: string;
        avatar: string;
        bio?: string;
        role: string;
        createdAt: string;
        postCount: number;
      };
    }>(`/users/profile/${id}`);
    return res.data;
  },
  updateProfile: async (data: { nickname?: string; bio?: string; avatar?: string }) => {
    const res = await api.patch<{ success: boolean; user: User; message: string }>(
      '/users/profile',
      data
    );
    return res.data;
  },
  blockUser: async (id: string, reason?: string) => {
    const res = await api.post<{ success: boolean; message: string }>(
      `/users/block/${id}`,
      { reason }
    );
    return res.data;
  },
  unblockUser: async (id: string) => {
    const res = await api.post<{ success: boolean; message: string }>(
      `/users/unblock/${id}`
    );
    return res.data;
  },
  getBlocked: async () => {
    const res = await api.get<{ success: boolean; blocked: BlockedUser[] }>(
      '/users/blocked'
    );
    return res.data;
  },
  deleteAccount: async () => {
    const res = await api.delete<{ success: boolean; message: string }>(
      '/users/account'
    );
    return res.data;
  },
};

// ----------------- ADMIN API -----------------
export const adminApi = {
  getStats: async () => {
    const res = await api.get<{
      success: boolean;
      stats: {
        totalUsers: number;
        activeUsers: number;
        suspendedUsers: number;
        bannedUsers: number;
        totalPosts: number;
        totalConversations: number;
        pendingReports: number;
        resolvedReports: number;
      };
    }>('/admin/stats');
    return res.data;
  },
  getUsers: async () => {
    const res = await api.get<{ success: boolean; users: User[] }>('/admin/users');
    return res.data;
  },
  updateUserStatus: async (
    id: string,
    data: { status?: string; warningCount?: number; suspensionDays?: number }
  ) => {
    const res = await api.patch<{ success: boolean; user: User }>(
      `/admin/users/${id}/status`,
      data
    );
    return res.data;
  },
};

// ----------------- NOTIFICATIONS API -----------------
export const notificationsApi = {
  getAll: async () => {
    const res = await api.get<{
      success: boolean;
      notifications: NotificationItem[];
      unreadCount: number;
    }>('/notifications');
    return res.data;
  },
  markAsRead: async (id: string) => {
    const res = await api.patch<{ success: boolean }>(`/notifications/${id}/read`);
    return res.data;
  },
  markAllAsRead: async () => {
    const res = await api.patch<{ success: boolean }>('/notifications/read-all');
    return res.data;
  },
};

export default api;
