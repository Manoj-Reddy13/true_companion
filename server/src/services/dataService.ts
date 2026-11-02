import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import {
  IUser,
  IPost,
  IChatRequest,
  IConversation,
  IMessage,
  IReport,
  INotification,
  IBlockedUser,
  PostCategory,
  ChatRequestStatus,
  ReportStatus,
} from '../types/index.js';
import { UserModel } from '../models/User.js';
import { PostModel } from '../models/Post.js';
import { ChatRequestModel } from '../models/ChatRequest.js';
import { ConversationModel } from '../models/Conversation.js';
import { MessageModel } from '../models/Message.js';
import { ReportModel } from '../models/Report.js';
import { NotificationModel } from '../models/Notification.js';
import { BlockedUserModel } from '../models/BlockedUser.js';

let isMongoConnected = false;

export function setMongoConnected(status: boolean) {
  isMongoConnected = status;
}

export function getMongoConnected(): boolean {
  return isMongoConnected;
}

// In-Memory / File-Persisted Fallback Store
interface LocalStore {
  users: IUser[];
  posts: IPost[];
  chatRequests: IChatRequest[];
  conversations: IConversation[];
  messages: IMessage[];
  reports: IReport[];
  notifications: INotification[];
  blockedUsers: IBlockedUser[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'store.json');

const localStore: LocalStore = {
  users: [],
  posts: [],
  chatRequests: [],
  conversations: [],
  messages: [],
  reports: [],
  notifications: [],
  blockedUsers: [],
};

// Ensure data folder and load persisted store if available
export function initLocalStore() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      localStore.users = parsed.users || [];
      localStore.posts = parsed.posts || [];
      localStore.chatRequests = parsed.chatRequests || [];
      localStore.conversations = parsed.conversations || [];
      localStore.messages = parsed.messages || [];
      localStore.reports = parsed.reports || [];
      localStore.notifications = parsed.notifications || [];
      localStore.blockedUsers = parsed.blockedUsers || [];
    }
  } catch (err) {
    console.error('Error loading fallback data store:', err);
  }
}

function persistLocalStore() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(localStore, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error persisting fallback store:', err);
  }
}

function generateId(): string {
  return new mongoose.Types.ObjectId().toString();
}

function sanitizeUser(user: IUser, includeSecret = false): IUser {
  const copy = { ...user };
  if (!includeSecret) {
    delete (copy as any).passwordHash;
    delete (copy as any).email;
  }
  return copy;
}

// ----------------- USER REPO -----------------
export const UserRepo = {
  async create(userData: Partial<IUser>): Promise<IUser> {
    if (isMongoConnected) {
      const doc = await UserModel.create(userData);
      return doc.toJSON() as unknown as IUser;
    }
    const newUser: IUser = {
      _id: generateId(),
      anonymousUsername: userData.anonymousUsername!,
      nickname: userData.nickname || '',
      email: userData.email || '',
      passwordHash: userData.passwordHash!,
      avatar: userData.avatar || 'avatar-1',
      bio: userData.bio || 'Here to listen and share.',
      role: userData.role || 'user',
      status: userData.status || 'active',
      warningCount: 0,
      suspensionUntil: undefined,
      bookmarks: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    localStore.users.push(newUser);
    persistLocalStore();
    return sanitizeUser(newUser);
  },

  async findById(id: string, includeSecret = false): Promise<IUser | null> {
    if (isMongoConnected) {
      let query = UserModel.findById(id);
      if (includeSecret) {
        query = query.select('+passwordHash +email');
      }
      const doc = await query.exec();
      if (!doc) return null;
      const json = doc.toJSON({ includeSecrets: includeSecret });
      if (includeSecret && (doc as any).passwordHash) {
        json.passwordHash = (doc as any).passwordHash;
      }
      return json as unknown as IUser;
    }
    const user = localStore.users.find((u) => u._id === id);
    if (!user) return null;
    return sanitizeUser(user, includeSecret);
  },

  async findByUsername(username: string, includeSecret = false): Promise<IUser | null> {
    if (isMongoConnected) {
      let query = UserModel.findOne({
        anonymousUsername: { $regex: new RegExp(`^${username}$`, 'i') },
      });
      if (includeSecret) {
        query = query.select('+passwordHash +email');
      }
      const doc = await query.exec();
      if (!doc) return null;
      const json = doc.toJSON({ includeSecrets: includeSecret });
      if (includeSecret && (doc as any).passwordHash) {
        json.passwordHash = (doc as any).passwordHash;
      }
      return json as unknown as IUser;
    }
    const user = localStore.users.find(
      (u) => u.anonymousUsername.toLowerCase() === username.toLowerCase()
    );
    if (!user) return null;
    return sanitizeUser(user, includeSecret);
  },

  async findByEmail(email: string, includeSecret = false): Promise<IUser | null> {
    if (!email) return null;
    if (isMongoConnected) {
      let query = UserModel.findOne({ email: email.toLowerCase() });
      if (includeSecret) {
        query = query.select('+passwordHash +email');
      }
      const doc = await query.exec();
      if (!doc) return null;
      const json = doc.toJSON({ includeSecrets: includeSecret });
      if (includeSecret && (doc as any).passwordHash) {
        json.passwordHash = (doc as any).passwordHash;
      }
      return json as unknown as IUser;
    }
    const user = localStore.users.find(
      (u) => u.email && u.email.toLowerCase() === email.toLowerCase()
    );
    if (!user) return null;
    return sanitizeUser(user, includeSecret);
  },

  async update(id: string, updates: Partial<IUser>): Promise<IUser | null> {
    if (isMongoConnected) {
      const doc = await UserModel.findByIdAndUpdate(
        id,
        { ...updates, updatedAt: new Date() },
        { new: true }
      );
      return doc ? (doc.toJSON() as unknown as IUser) : null;
    }
    const idx = localStore.users.findIndex((u) => u._id === id);
    if (idx === -1) return null;
    localStore.users[idx] = {
      ...localStore.users[idx],
      ...updates,
      updatedAt: new Date(),
    };
    persistLocalStore();
    return sanitizeUser(localStore.users[idx]);
  },

  async delete(id: string): Promise<boolean> {
    if (isMongoConnected) {
      const res = await UserModel.findByIdAndDelete(id);
      return !!res;
    }
    const initialLen = localStore.users.length;
    localStore.users = localStore.users.filter((u) => u._id !== id);
    persistLocalStore();
    return localStore.users.length < initialLen;
  },

  async count(filter: { role?: string; status?: string } = {}): Promise<number> {
    if (isMongoConnected) {
      return await UserModel.countDocuments(filter);
    }
    return localStore.users.filter((u) => {
      if (filter.role && u.role !== filter.role) return false;
      if (filter.status && u.status !== filter.status) return false;
      return true;
    }).length;
  },

  async getAll(): Promise<IUser[]> {
    if (isMongoConnected) {
      const docs = await UserModel.find().sort({ createdAt: -1 });
      return docs.map((d) => d.toJSON() as unknown as IUser);
    }
    return localStore.users.map((u) => sanitizeUser(u));
  },
};

// ----------------- POST REPO -----------------
export const PostRepo = {
  async create(postData: Partial<IPost>): Promise<IPost> {
    if (isMongoConnected) {
      const doc = await PostModel.create(postData);
      const populated = await PostModel.findById(doc._id).populate(
        'authorId',
        'anonymousUsername nickname avatar createdAt'
      );
      return populated!.toJSON() as unknown as IPost;
    }
    const newPost: IPost = {
      _id: generateId(),
      authorId: postData.authorId as any,
      title: postData.title!,
      description: postData.description!,
      category: postData.category!,
      attachments: postData.attachments || [],
      chatEnabled: postData.chatEnabled !== undefined ? postData.chatEnabled : true,
      status: postData.status || 'active',
      viewsCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    localStore.posts.unshift(newPost);
    persistLocalStore();
    return this.populateAuthor(newPost);
  },

  async populateAuthor(post: IPost): Promise<IPost> {
    const authorIdStr =
      typeof post.authorId === 'object' ? (post.authorId as any)._id : post.authorId;
    const author = await UserRepo.findById(authorIdStr);
    return {
      ...post,
      authorId: author
        ? {
            _id: author._id,
            anonymousUsername: author.anonymousUsername,
            nickname: author.nickname,
            avatar: author.avatar,
            createdAt: author.createdAt,
          } as any
        : post.authorId,
    };
  },

  async find(
    filter: {
      category?: string;
      search?: string;
      authorId?: string;
      status?: string;
    } = {},
    options: { skip?: number; limit?: number } = {}
  ): Promise<{ posts: IPost[]; total: number }> {
    const { skip = 0, limit = 20 } = options;

    if (isMongoConnected) {
      const query: any = { status: filter.status || 'active' };
      if (filter.category && filter.category !== 'All') {
        query.category = filter.category;
      }
      if (filter.authorId) {
        query.authorId = filter.authorId;
      }
      if (filter.search) {
        query.$or = [
          { title: { $regex: filter.search, $options: 'i' } },
          { description: { $regex: filter.search, $options: 'i' } },
        ];
      }
      const total = await PostModel.countDocuments(query);
      const docs = await PostModel.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('authorId', 'anonymousUsername nickname avatar createdAt');

      return {
        posts: docs.map((d) => d.toJSON() as unknown as IPost),
        total,
      };
    }

    let filtered = localStore.posts.filter((p) => {
      if (p.status !== (filter.status || 'active')) return false;
      if (filter.category && filter.category !== 'All' && p.category !== filter.category)
        return false;
      if (filter.authorId) {
        const pAuthorId =
          typeof p.authorId === 'object' ? (p.authorId as any)._id : p.authorId;
        if (pAuthorId !== filter.authorId) return false;
      }
      if (filter.search) {
        const q = filter.search.toLowerCase();
        const matchTitle = p.title.toLowerCase().includes(q);
        const matchDesc = p.description.toLowerCase().includes(q);
        if (!matchTitle && !matchDesc) return false;
      }
      return true;
    });

    const total = filtered.length;
    const pageItems = filtered.slice(skip, skip + limit);
    const populated = await Promise.all(pageItems.map((p) => this.populateAuthor(p)));

    return { posts: populated, total };
  },

  async findById(id: string): Promise<IPost | null> {
    if (isMongoConnected) {
      const doc = await PostModel.findById(id).populate(
        'authorId',
        'anonymousUsername nickname avatar createdAt'
      );
      return doc ? (doc.toJSON() as unknown as IPost) : null;
    }
    const post = localStore.posts.find((p) => p._id === id);
    if (!post) return null;
    return this.populateAuthor(post);
  },

  async update(id: string, updates: Partial<IPost>): Promise<IPost | null> {
    if (isMongoConnected) {
      const doc = await PostModel.findByIdAndUpdate(
        id,
        { ...updates, updatedAt: new Date() },
        { new: true }
      ).populate('authorId', 'anonymousUsername nickname avatar createdAt');
      return doc ? (doc.toJSON() as unknown as IPost) : null;
    }
    const idx = localStore.posts.findIndex((p) => p._id === id);
    if (idx === -1) return null;
    localStore.posts[idx] = {
      ...localStore.posts[idx],
      ...updates,
      updatedAt: new Date(),
    };
    persistLocalStore();
    return this.populateAuthor(localStore.posts[idx]);
  },

  async delete(id: string): Promise<boolean> {
    if (isMongoConnected) {
      const res = await PostModel.findByIdAndDelete(id);
      return !!res;
    }
    const initLen = localStore.posts.length;
    localStore.posts = localStore.posts.filter((p) => p._id !== id);
    persistLocalStore();
    return localStore.posts.length < initLen;
  },

  async count(filter: any = {}): Promise<number> {
    if (isMongoConnected) {
      return await PostModel.countDocuments(filter);
    }
    return localStore.posts.length;
  },
};

// ----------------- CHAT REQUEST REPO -----------------
export const ChatRequestRepo = {
  async create(data: Partial<IChatRequest>): Promise<IChatRequest> {
    if (isMongoConnected) {
      const doc = await ChatRequestModel.create(data);
      const populated = await ChatRequestModel.findById(doc._id)
        .populate('senderId', 'anonymousUsername nickname avatar')
        .populate('receiverId', 'anonymousUsername nickname avatar')
        .populate('postId', 'title category');
      return populated!.toJSON() as unknown as IChatRequest;
    }
    const newReq: IChatRequest = {
      _id: generateId(),
      senderId: data.senderId as any,
      receiverId: data.receiverId as any,
      postId: data.postId as any,
      introductionMessage: data.introductionMessage || '',
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    localStore.chatRequests.unshift(newReq);
    persistLocalStore();
    return this.populate(newReq);
  },

  async populate(req: IChatRequest): Promise<IChatRequest> {
    const sId = typeof req.senderId === 'object' ? (req.senderId as any)._id : req.senderId;
    const rId = typeof req.receiverId === 'object' ? (req.receiverId as any)._id : req.receiverId;
    const pId = typeof req.postId === 'object' ? (req.postId as any)._id : req.postId;

    const sender = await UserRepo.findById(sId);
    const receiver = await UserRepo.findById(rId);
    const post = pId ? await PostRepo.findById(pId) : null;

    return {
      ...req,
      senderId: sender ? ({ _id: sender._id, anonymousUsername: sender.anonymousUsername, nickname: sender.nickname, avatar: sender.avatar } as any) : req.senderId,
      receiverId: receiver ? ({ _id: receiver._id, anonymousUsername: receiver.anonymousUsername, nickname: receiver.nickname, avatar: receiver.avatar } as any) : req.receiverId,
      postId: post ? ({ _id: post._id, title: post.title, category: post.category } as any) : req.postId,
    };
  },

  async findById(id: string): Promise<IChatRequest | null> {
    if (isMongoConnected) {
      const doc = await ChatRequestModel.findById(id)
        .populate('senderId', 'anonymousUsername nickname avatar')
        .populate('receiverId', 'anonymousUsername nickname avatar')
        .populate('postId', 'title category');
      return doc ? (doc.toJSON() as unknown as IChatRequest) : null;
    }
    const r = localStore.chatRequests.find((req) => req._id === id);
    if (!r) return null;
    return this.populate(r);
  },

  async findActiveBetween(senderId: string, receiverId: string, postId?: string): Promise<IChatRequest | null> {
    if (isMongoConnected) {
      const query: any = {
        senderId,
        receiverId,
        status: 'pending',
      };
      if (postId) query.postId = postId;
      const doc = await ChatRequestModel.findOne(query);
      return doc ? (doc.toJSON() as unknown as IChatRequest) : null;
    }
    const found = localStore.chatRequests.find((req) => {
      const s = typeof req.senderId === 'object' ? (req.senderId as any)._id : req.senderId;
      const r = typeof req.receiverId === 'object' ? (req.receiverId as any)._id : req.receiverId;
      const p = typeof req.postId === 'object' ? (req.postId as any)._id : req.postId;
      return s === senderId && r === receiverId && req.status === 'pending' && (!postId || p === postId);
    });
    return found ? this.populate(found) : null;
  },

  async findReceived(userId: string): Promise<IChatRequest[]> {
    if (isMongoConnected) {
      const docs = await ChatRequestModel.find({ receiverId: userId })
        .sort({ createdAt: -1 })
        .populate('senderId', 'anonymousUsername nickname avatar')
        .populate('receiverId', 'anonymousUsername nickname avatar')
        .populate('postId', 'title category');
      return docs.map((d) => d.toJSON() as unknown as IChatRequest);
    }
    const list = localStore.chatRequests.filter((req) => {
      const r = typeof req.receiverId === 'object' ? (req.receiverId as any)._id : req.receiverId;
      return r === userId;
    });
    return Promise.all(list.map((r) => this.populate(r)));
  },

  async findSent(userId: string): Promise<IChatRequest[]> {
    if (isMongoConnected) {
      const docs = await ChatRequestModel.find({ senderId: userId })
        .sort({ createdAt: -1 })
        .populate('senderId', 'anonymousUsername nickname avatar')
        .populate('receiverId', 'anonymousUsername nickname avatar')
        .populate('postId', 'title category');
      return docs.map((d) => d.toJSON() as unknown as IChatRequest);
    }
    const list = localStore.chatRequests.filter((req) => {
      const s = typeof req.senderId === 'object' ? (req.senderId as any)._id : req.senderId;
      return s === userId;
    });
    return Promise.all(list.map((r) => this.populate(r)));
  },

  async updateStatus(id: string, status: ChatRequestStatus): Promise<IChatRequest | null> {
    if (isMongoConnected) {
      const doc = await ChatRequestModel.findByIdAndUpdate(
        id,
        { status, updatedAt: new Date() },
        { new: true }
      )
        .populate('senderId', 'anonymousUsername nickname avatar')
        .populate('receiverId', 'anonymousUsername nickname avatar')
        .populate('postId', 'title category');
      return doc ? (doc.toJSON() as unknown as IChatRequest) : null;
    }
    const idx = localStore.chatRequests.findIndex((req) => req._id === id);
    if (idx === -1) return null;
    localStore.chatRequests[idx].status = status;
    localStore.chatRequests[idx].updatedAt = new Date();
    persistLocalStore();
    return this.populate(localStore.chatRequests[idx]);
  },

  async delete(id: string): Promise<boolean> {
    if (isMongoConnected) {
      const res = await ChatRequestModel.findByIdAndDelete(id);
      return !!res;
    }
    const initLen = localStore.chatRequests.length;
    localStore.chatRequests = localStore.chatRequests.filter((r) => r._id !== id);
    persistLocalStore();
    return localStore.chatRequests.length < initLen;
  },
};

// ----------------- CONVERSATION REPO -----------------
export const ConversationRepo = {
  async create(data: Partial<IConversation>): Promise<IConversation> {
    if (isMongoConnected) {
      const doc = await ConversationModel.create(data);
      const populated = await ConversationModel.findById(doc._id)
        .populate('participants', 'anonymousUsername nickname avatar')
        .populate('postId', 'title category');
      return populated!.toJSON() as unknown as IConversation;
    }
    const newConv: IConversation = {
      _id: generateId(),
      participants: data.participants as any,
      chatRequestId: data.chatRequestId as any,
      postId: data.postId as any,
      status: 'active',
      lastMessageAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    localStore.conversations.unshift(newConv);
    persistLocalStore();
    return this.populate(newConv);
  },

  async populate(conv: IConversation): Promise<IConversation> {
    const participantIds = conv.participants.map((p) =>
      typeof p === 'object' ? (p as any)._id : p
    );
    const participants = await Promise.all(
      participantIds.map(async (id) => {
        const u = await UserRepo.findById(id);
        return u
          ? ({ _id: u._id, anonymousUsername: u.anonymousUsername, nickname: u.nickname, avatar: u.avatar } as any)
          : id;
      })
    );
    let post = null;
    if (conv.postId) {
      const pId = typeof conv.postId === 'object' ? (conv.postId as any)._id : conv.postId;
      post = await PostRepo.findById(pId);
    }
    return {
      ...conv,
      participants,
      postId: post ? ({ _id: post._id, title: post.title, category: post.category } as any) : conv.postId,
    };
  },

  async findByUser(userId: string): Promise<IConversation[]> {
    if (isMongoConnected) {
      const docs = await ConversationModel.find({
        participants: userId,
        status: { $ne: 'blocked' },
      })
        .sort({ lastMessageAt: -1 })
        .populate('participants', 'anonymousUsername nickname avatar')
        .populate('postId', 'title category');
      return docs.map((d) => d.toJSON() as unknown as IConversation);
    }
    const convs = localStore.conversations.filter((c) => {
      const pIds = c.participants.map((p) => (typeof p === 'object' ? (p as any)._id : p));
      return pIds.includes(userId) && c.status !== 'blocked';
    });
    convs.sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());
    return Promise.all(convs.map((c) => this.populate(c)));
  },

  async findById(id: string): Promise<IConversation | null> {
    if (isMongoConnected) {
      const doc = await ConversationModel.findById(id)
        .populate('participants', 'anonymousUsername nickname avatar')
        .populate('postId', 'title category');
      return doc ? (doc.toJSON() as unknown as IConversation) : null;
    }
    const c = localStore.conversations.find((conv) => conv._id === id);
    if (!c) return null;
    return this.populate(c);
  },

  async findBetween(userA: string, userB: string): Promise<IConversation | null> {
    if (isMongoConnected) {
      const doc = await ConversationModel.findOne({
        participants: { $all: [userA, userB] },
      })
        .populate('participants', 'anonymousUsername nickname avatar')
        .populate('postId', 'title category');
      return doc ? (doc.toJSON() as unknown as IConversation) : null;
    }
    const c = localStore.conversations.find((conv) => {
      const pIds = conv.participants.map((p) => (typeof p === 'object' ? (p as any)._id : p));
      return pIds.includes(userA) && pIds.includes(userB);
    });
    if (!c) return null;
    return this.populate(c);
  },

  async update(id: string, updates: Partial<IConversation>): Promise<IConversation | null> {
    if (isMongoConnected) {
      const doc = await ConversationModel.findByIdAndUpdate(
        id,
        { ...updates, updatedAt: new Date() },
        { new: true }
      )
        .populate('participants', 'anonymousUsername nickname avatar')
        .populate('postId', 'title category');
      return doc ? (doc.toJSON() as unknown as IConversation) : null;
    }
    const idx = localStore.conversations.findIndex((c) => c._id === id);
    if (idx === -1) return null;
    localStore.conversations[idx] = {
      ...localStore.conversations[idx],
      ...updates,
      updatedAt: new Date(),
    };
    persistLocalStore();
    return this.populate(localStore.conversations[idx]);
  },

  async count(): Promise<number> {
    if (isMongoConnected) {
      return await ConversationModel.countDocuments();
    }
    return localStore.conversations.length;
  },
};

// ----------------- MESSAGE REPO -----------------
export const MessageRepo = {
  async create(data: Partial<IMessage>): Promise<IMessage> {
    if (isMongoConnected) {
      const doc = await MessageModel.create(data);
      await ConversationModel.findByIdAndUpdate(data.conversationId, {
        lastMessageAt: new Date(),
      });
      const populated = await MessageModel.findById(doc._id).populate(
        'senderId',
        'anonymousUsername nickname avatar'
      );
      return populated!.toJSON() as unknown as IMessage;
    }
    const newMsg: IMessage = {
      _id: generateId(),
      conversationId: data.conversationId!,
      senderId: data.senderId as any,
      messageType: data.messageType || 'text',
      content: data.content || '',
      attachments: data.attachments || [],
      readBy: [typeof data.senderId === 'object' ? (data.senderId as any)._id : (data.senderId as string)],
      isDeleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    localStore.messages.push(newMsg);
    // Update conversation lastMessageAt
    const convIdx = localStore.conversations.findIndex((c) => c._id === data.conversationId);
    if (convIdx !== -1) {
      localStore.conversations[convIdx].lastMessageAt = new Date();
    }
    persistLocalStore();
    return this.populate(newMsg);
  },

  async populate(msg: IMessage): Promise<IMessage> {
    const sId = typeof msg.senderId === 'object' ? (msg.senderId as any)._id : msg.senderId;
    const sender = await UserRepo.findById(sId);
    return {
      ...msg,
      senderId: sender
        ? ({ _id: sender._id, anonymousUsername: sender.anonymousUsername, nickname: sender.nickname, avatar: sender.avatar } as any)
        : msg.senderId,
    };
  },

  async findByConversation(conversationId: string): Promise<IMessage[]> {
    if (isMongoConnected) {
      const docs = await MessageModel.find({ conversationId })
        .sort({ createdAt: 1 })
        .populate('senderId', 'anonymousUsername nickname avatar');
      return docs.map((d) => d.toJSON() as unknown as IMessage);
    }
    const msgs = localStore.messages.filter((m) => m.conversationId === conversationId);
    msgs.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    return Promise.all(msgs.map((m) => this.populate(m)));
  },

  async findById(id: string): Promise<IMessage | null> {
    if (isMongoConnected) {
      const doc = await MessageModel.findById(id).populate(
        'senderId',
        'anonymousUsername nickname avatar'
      );
      return doc ? (doc.toJSON() as unknown as IMessage) : null;
    }
    const msg = localStore.messages.find((m) => m._id === id);
    if (!msg) return null;
    return this.populate(msg);
  },

  async markAsDeleted(id: string): Promise<IMessage | null> {
    if (isMongoConnected) {
      const doc = await MessageModel.findByIdAndUpdate(
        id,
        { isDeleted: true, content: 'This message was deleted.', attachments: [], updatedAt: new Date() },
        { new: true }
      ).populate('senderId', 'anonymousUsername nickname avatar');
      return doc ? (doc.toJSON() as unknown as IMessage) : null;
    }
    const idx = localStore.messages.findIndex((m) => m._id === id);
    if (idx === -1) return null;
    localStore.messages[idx].isDeleted = true;
    localStore.messages[idx].content = 'This message was deleted.';
    localStore.messages[idx].attachments = [];
    localStore.messages[idx].updatedAt = new Date();
    persistLocalStore();
    return this.populate(localStore.messages[idx]);
  },

  async markAsRead(conversationId: string, userId: string): Promise<void> {
    if (isMongoConnected) {
      await MessageModel.updateMany(
        { conversationId, readBy: { $ne: userId } },
        { $addToSet: { readBy: userId } }
      );
      return;
    }
    let changed = false;
    localStore.messages.forEach((m) => {
      if (m.conversationId === conversationId && !m.readBy.includes(userId)) {
        m.readBy.push(userId);
        changed = true;
      }
    });
    if (changed) persistLocalStore();
  },
};

// ----------------- REPORT REPO -----------------
export const ReportRepo = {
  async create(data: Partial<IReport>): Promise<IReport> {
    if (isMongoConnected) {
      const doc = await ReportModel.create(data);
      const populated = await ReportModel.findById(doc._id)
        .populate('reporterId', 'anonymousUsername nickname avatar')
        .populate('reportedUserId', 'anonymousUsername nickname avatar status warningCount')
        .populate('postId', 'title category description')
        .populate('messageId', 'content attachments');
      return populated!.toJSON() as unknown as IReport;
    }
    const newReport: IReport = {
      _id: generateId(),
      reporterId: data.reporterId as any,
      reportedUserId: data.reportedUserId as any,
      postId: data.postId as any,
      messageId: data.messageId as any,
      reason: data.reason!,
      description: data.description || '',
      status: 'pending',
      adminAction: 'none',
      adminNotes: '',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    localStore.reports.unshift(newReport);
    persistLocalStore();
    return this.populate(newReport);
  },

  async populate(report: IReport): Promise<IReport> {
    const repId = typeof report.reporterId === 'object' ? (report.reporterId as any)._id : report.reporterId;
    const tgtUserId = report.reportedUserId ? (typeof report.reportedUserId === 'object' ? (report.reportedUserId as any)._id : report.reportedUserId) : null;
    const pId = report.postId ? (typeof report.postId === 'object' ? (report.postId as any)._id : report.postId) : null;
    const mId = report.messageId ? (typeof report.messageId === 'object' ? (report.messageId as any)._id : report.messageId) : null;

    const reporter = await UserRepo.findById(repId);
    const reportedUser = tgtUserId ? await UserRepo.findById(tgtUserId) : null;
    const post = pId ? await PostRepo.findById(pId) : null;
    const message = mId ? await MessageRepo.findById(mId) : null;

    return {
      ...report,
      reporterId: reporter ? ({ _id: reporter._id, anonymousUsername: reporter.anonymousUsername, nickname: reporter.nickname, avatar: reporter.avatar } as any) : report.reporterId,
      reportedUserId: reportedUser ? ({ _id: reportedUser._id, anonymousUsername: reportedUser.anonymousUsername, nickname: reportedUser.nickname, avatar: reportedUser.avatar, status: reportedUser.status, warningCount: reportedUser.warningCount } as any) : report.reportedUserId,
      postId: post ? ({ _id: post._id, title: post.title, category: post.category, description: post.description } as any) : report.postId,
      messageId: message ? ({ _id: message._id, content: message.content, attachments: message.attachments } as any) : report.messageId,
    };
  },

  async find(filter: { status?: ReportStatus } = {}): Promise<IReport[]> {
    if (isMongoConnected) {
      const query: any = {};
      if (filter.status) query.status = filter.status;
      const docs = await ReportModel.find(query)
        .sort({ createdAt: -1 })
        .populate('reporterId', 'anonymousUsername nickname avatar')
        .populate('reportedUserId', 'anonymousUsername nickname avatar status warningCount')
        .populate('postId', 'title category description')
        .populate('messageId', 'content attachments');
      return docs.map((d) => d.toJSON() as unknown as IReport);
    }
    const filtered = localStore.reports.filter((r) => {
      if (filter.status && r.status !== filter.status) return false;
      return true;
    });
    return Promise.all(filtered.map((r) => this.populate(r)));
  },

  async findById(id: string): Promise<IReport | null> {
    if (isMongoConnected) {
      const doc = await ReportModel.findById(id)
        .populate('reporterId', 'anonymousUsername nickname avatar')
        .populate('reportedUserId', 'anonymousUsername nickname avatar status warningCount')
        .populate('postId', 'title category description')
        .populate('messageId', 'content attachments');
      return doc ? (doc.toJSON() as unknown as IReport) : null;
    }
    const r = localStore.reports.find((rep) => rep._id === id);
    if (!r) return null;
    return this.populate(r);
  },

  async update(id: string, updates: Partial<IReport>): Promise<IReport | null> {
    if (isMongoConnected) {
      const doc = await ReportModel.findByIdAndUpdate(
        id,
        { ...updates, updatedAt: new Date() },
        { new: true }
      )
        .populate('reporterId', 'anonymousUsername nickname avatar')
        .populate('reportedUserId', 'anonymousUsername nickname avatar status warningCount')
        .populate('postId', 'title category description')
        .populate('messageId', 'content attachments');
      return doc ? (doc.toJSON() as unknown as IReport) : null;
    }
    const idx = localStore.reports.findIndex((r) => r._id === id);
    if (idx === -1) return null;
    localStore.reports[idx] = {
      ...localStore.reports[idx],
      ...updates,
      updatedAt: new Date(),
    };
    persistLocalStore();
    return this.populate(localStore.reports[idx]);
  },

  async count(filter: { status?: string } = {}): Promise<number> {
    if (isMongoConnected) {
      return await ReportModel.countDocuments(filter);
    }
    return localStore.reports.filter((r) => {
      if (filter.status && r.status !== filter.status) return false;
      return true;
    }).length;
  },
};

// ----------------- NOTIFICATION REPO -----------------
export const NotificationRepo = {
  async create(data: Partial<INotification>): Promise<INotification> {
    if (isMongoConnected) {
      const doc = await NotificationModel.create(data);
      return doc.toJSON() as unknown as INotification;
    }
    const newNotif: INotification = {
      _id: generateId(),
      recipientId: data.recipientId!,
      type: data.type!,
      referenceId: data.referenceId,
      title: data.title!,
      message: data.message!,
      link: data.link,
      isRead: false,
      createdAt: new Date(),
    };
    localStore.notifications.unshift(newNotif);
    persistLocalStore();
    return newNotif;
  },

  async findByUser(recipientId: string, limit = 50): Promise<INotification[]> {
    if (isMongoConnected) {
      const docs = await NotificationModel.find({ recipientId })
        .sort({ createdAt: -1 })
        .limit(limit);
      return docs.map((d) => d.toJSON() as unknown as INotification);
    }
    return localStore.notifications
      .filter((n) => n.recipientId === recipientId)
      .slice(0, limit);
  },

  async countUnread(recipientId: string): Promise<number> {
    if (isMongoConnected) {
      return await NotificationModel.countDocuments({ recipientId, isRead: false });
    }
    return localStore.notifications.filter(
      (n) => n.recipientId === recipientId && !n.isRead
    ).length;
  },

  async markAsRead(id: string, recipientId: string): Promise<boolean> {
    if (isMongoConnected) {
      const res = await NotificationModel.findOneAndUpdate(
        { _id: id, recipientId },
        { isRead: true }
      );
      return !!res;
    }
    const n = localStore.notifications.find(
      (notif) => notif._id === id && notif.recipientId === recipientId
    );
    if (!n) return false;
    n.isRead = true;
    persistLocalStore();
    return true;
  },

  async markAllAsRead(recipientId: string): Promise<void> {
    if (isMongoConnected) {
      await NotificationModel.updateMany({ recipientId, isRead: false }, { isRead: true });
      return;
    }
    localStore.notifications.forEach((n) => {
      if (n.recipientId === recipientId) {
        n.isRead = true;
      }
    });
    persistLocalStore();
  },
};

// ----------------- BLOCKED USER REPO -----------------
export const BlockedUserRepo = {
  async block(blockerId: string, blockedUserId: string, reason = ''): Promise<IBlockedUser> {
    if (isMongoConnected) {
      const doc = await BlockedUserModel.findOneAndUpdate(
        { blockerId, blockedUserId },
        { reason, createdAt: new Date() },
        { upsert: true, new: true }
      );
      return doc.toJSON() as unknown as IBlockedUser;
    }
    const existing = localStore.blockedUsers.find(
      (b) => b.blockerId === blockerId && b.blockedUserId === blockedUserId
    );
    if (existing) {
      existing.reason = reason;
      persistLocalStore();
      return existing;
    }
    const newBlocked: IBlockedUser = {
      _id: generateId(),
      blockerId,
      blockedUserId,
      reason,
      createdAt: new Date(),
    };
    localStore.blockedUsers.push(newBlocked);
    persistLocalStore();
    return newBlocked;
  },

  async unblock(blockerId: string, blockedUserId: string): Promise<boolean> {
    if (isMongoConnected) {
      const res = await BlockedUserModel.findOneAndDelete({ blockerId, blockedUserId });
      return !!res;
    }
    const initLen = localStore.blockedUsers.length;
    localStore.blockedUsers = localStore.blockedUsers.filter(
      (b) => !(b.blockerId === blockerId && b.blockedUserId === blockedUserId)
    );
    persistLocalStore();
    return localStore.blockedUsers.length < initLen;
  },

  async isBlocked(userA: string, userB: string): Promise<boolean> {
    if (isMongoConnected) {
      const doc = await BlockedUserModel.findOne({
        $or: [
          { blockerId: userA, blockedUserId: userB },
          { blockerId: userB, blockedUserId: userA },
        ],
      });
      return !!doc;
    }
    return localStore.blockedUsers.some(
      (b) =>
        (b.blockerId === userA && b.blockedUserId === userB) ||
        (b.blockerId === userB && b.blockedUserId === userA)
    );
  },

  async findBlockedByUser(userId: string): Promise<IBlockedUser[]> {
    if (isMongoConnected) {
      const docs = await BlockedUserModel.find({ blockerId: userId }).populate(
        'blockedUserId',
        'anonymousUsername nickname avatar'
      );
      return docs.map((d) => d.toJSON() as unknown as IBlockedUser);
    }
    const list = localStore.blockedUsers.filter((b) => b.blockerId === userId);
    return Promise.all(
      list.map(async (b) => {
        const u = await UserRepo.findById(b.blockedUserId as string);
        return {
          ...b,
          blockedUserId: u
            ? ({ _id: u._id, anonymousUsername: u.anonymousUsername, nickname: u.nickname, avatar: u.avatar } as any)
            : b.blockedUserId,
        };
      })
    );
  },
};
