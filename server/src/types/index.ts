import { Request } from 'express';

export type UserRole = 'user' | 'admin' | 'moderator';
export type UserStatus = 'active' | 'suspended' | 'banned';

export interface IUser {
  _id: string;
  anonymousUsername: string;
  nickname?: string;
  email?: string;
  passwordHash: string;
  avatar: string;
  bio?: string;
  role: UserRole;
  status: UserStatus;
  warningCount: number;
  suspensionUntil?: Date;
  bookmarks: string[];
  createdAt: Date;
  updatedAt: Date;
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

export interface IPostAttachment {
  url: string;
  filename: string;
  mimetype: string;
  size: number;
}

export interface IPost {
  _id: string;
  authorId: string | IUser;
  title: string;
  description: string;
  category: PostCategory;
  attachments: IPostAttachment[];
  chatEnabled: boolean;
  status: 'active' | 'hidden' | 'flagged';
  viewsCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

export type ChatRequestStatus = 'pending' | 'accepted' | 'declined' | 'cancelled';

export interface IChatRequest {
  _id: string;
  senderId: string | IUser;
  receiverId: string | IUser;
  postId?: string | IPost;
  introductionMessage?: string;
  status: ChatRequestStatus;
  createdAt: Date;
  updatedAt: Date;
}

export type ConversationStatus = 'active' | 'ended' | 'blocked';

export interface IConversation {
  _id: string;
  participants: (string | IUser)[];
  chatRequestId?: string | IChatRequest;
  postId?: string | IPost;
  status: ConversationStatus;
  endedBy?: string | IUser;
  lastMessageAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type MessageType = 'text' | 'image' | 'file' | 'system';

export interface IMessageAttachment {
  url: string;
  filename: string;
  mimetype: string;
  size: number;
}

export interface IMessage {
  _id: string;
  conversationId: string;
  senderId: string | IUser;
  messageType: MessageType;
  content: string;
  attachments: IMessageAttachment[];
  readBy: string[];
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
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

export type ReportStatus = 'pending' | 'investigating' | 'resolved' | 'dismissed';

export type AdminActionType =
  | 'none'
  | 'warning_issued'
  | 'post_removed'
  | 'account_suspended'
  | 'account_banned'
  | 'report_dismissed';

export interface IReport {
  _id: string;
  reporterId: string | IUser;
  reportedUserId?: string | IUser;
  postId?: string | IPost;
  messageId?: string | IMessage;
  reason: ReportReason;
  description?: string;
  status: ReportStatus;
  adminAction: AdminActionType;
  adminNotes?: string;
  reviewedBy?: string | IUser;
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type NotificationType =
  | 'chat_request_received'
  | 'chat_request_accepted'
  | 'chat_request_declined'
  | 'new_message'
  | 'report_update'
  | 'safety_notice'
  | 'system';

export interface INotification {
  _id: string;
  recipientId: string;
  type: NotificationType;
  referenceId?: string;
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: Date;
}

export interface IBlockedUser {
  _id: string;
  blockerId: string | IUser;
  blockedUserId: string | IUser;
  reason?: string;
  createdAt: Date;
}

export interface AuthRequest extends Request {
  user?: IUser;
}
