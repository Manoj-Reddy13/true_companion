export type UserRole = 'user' | 'admin' | 'moderator';
export type UserStatus = 'active' | 'suspended' | 'banned';

export interface User {
  _id: string;
  anonymousUsername: string;
  nickname?: string;
  email?: string;
  avatar: string;
  bio?: string;
  role: UserRole;
  status: UserStatus;
  warningCount?: number;
  suspensionUntil?: string;
  bookmarks?: string[];
  createdAt: string;
  updatedAt?: string;
}

export type PostCategory =
  | 'Mental Wellbeing'
  | 'Loneliness'
  | 'Relationship Issues'
  | 'Academic Pressure'
  | 'Career Confusion'
  | 'Family Problems'
  | 'Personal Struggles'
  | 'Motivation'
  | 'Other';

export interface PostAttachment {
  url: string;
  filename: string;
  mimetype: string;
  size: number;
}

export interface Post {
  _id: string;
  authorId: {
    _id: string;
    anonymousUsername: string;
    nickname?: string;
    avatar: string;
    createdAt?: string;
  };
  title: string;
  description: string;
  category: PostCategory;
  attachments: PostAttachment[];
  chatEnabled: boolean;
  status: 'active' | 'hidden' | 'flagged';
  viewsCount?: number;
  createdAt: string;
  updatedAt?: string;
}

export type ChatRequestStatus = 'pending' | 'accepted' | 'declined' | 'cancelled';

export interface ChatRequest {
  _id: string;
  senderId: {
    _id: string;
    anonymousUsername: string;
    nickname?: string;
    avatar: string;
  };
  receiverId: {
    _id: string;
    anonymousUsername: string;
    nickname?: string;
    avatar: string;
  };
  postId?: {
    _id: string;
    title: string;
    category: PostCategory;
  };
  introductionMessage?: string;
  status: ChatRequestStatus;
  createdAt: string;
}

export type ConversationStatus = 'active' | 'ended' | 'blocked';

export interface Conversation {
  _id: string;
  participants: {
    _id: string;
    anonymousUsername: string;
    nickname?: string;
    avatar: string;
  }[];
  postId?: {
    _id: string;
    title: string;
    category: PostCategory;
  };
  chatRequestId?: string;
  status: ConversationStatus;
  endedBy?: string;
  lastMessageAt: string;
  lastMessage?: Message;
  unreadCount?: number;
  createdAt: string;
}

export type MessageType = 'text' | 'image' | 'file' | 'system';

export interface MessageAttachment {
  url: string;
  filename: string;
  mimetype: string;
  size: number;
}

export interface Message {
  _id: string;
  conversationId: string;
  senderId: {
    _id: string;
    anonymousUsername: string;
    nickname?: string;
    avatar: string;
  };
  messageType: MessageType;
  content: string;
  attachments: MessageAttachment[];
  readBy: string[];
  isDeleted: boolean;
  createdAt: string;
}

export type ReportReason =
  | 'Inappropriate messages'
  | 'Harassment'
  | 'Bullying'
  | 'Threats'
  | 'Spam'
  | 'Fake accounts'
  | 'Scams'
  | 'Inappropriate images'
  | 'Suspicious behaviour'
  | 'Immediate danger / self-harm concern'
  | 'Other';

export interface Report {
  _id: string;
  reporterId: {
    _id: string;
    anonymousUsername: string;
    nickname?: string;
    avatar: string;
  };
  reportedUserId?: {
    _id: string;
    anonymousUsername: string;
    nickname?: string;
    avatar: string;
    status: UserStatus;
    warningCount?: number;
  };
  postId?: {
    _id: string;
    title: string;
    category: PostCategory;
    description: string;
  };
  messageId?: {
    _id: string;
    content: string;
    attachments: MessageAttachment[];
  };
  reason: ReportReason;
  description?: string;
  status: 'pending' | 'investigating' | 'resolved' | 'dismissed';
  adminAction: string;
  adminNotes?: string;
  createdAt: string;
}

export interface NotificationItem {
  _id: string;
  recipientId: string;
  type: string;
  referenceId?: string;
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export interface BlockedUser {
  _id: string;
  blockerId: string;
  blockedUserId: {
    _id: string;
    anonymousUsername: string;
    nickname?: string;
    avatar: string;
  };
  reason?: string;
  createdAt: string;
}
