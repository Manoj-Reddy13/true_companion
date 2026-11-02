import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { conversationsApi, messagesApi, usersApi } from '../services/api.js';
import { Conversation, Message } from '../types/index.js';
import { Avatar } from '../components/common/Avatar.js';
import { useAuth } from '../context/AuthContext.js';
import { useSocket } from '../context/SocketContext.js';
import { getSocket } from '../services/socket.js';
import { ReportModal } from '../components/common/ReportModal.js';
import {
  Send,
  Paperclip,
  Check,
  CheckCheck,
  Trash2,
  PhoneOff,
  ShieldAlert,
  UserX,
  FileText,
  Download,
  Smile,
  ArrowLeft,
  Lock,
} from 'lucide-react';

export const ChatPage: React.FC = () => {
  const { id: activeConvId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast, checkUserOnline } = useSocket();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState<string | null>(null);

  // Safety actions modal
  const [isReportOpen, setIsReportOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<any>(null);

  // Scroll to bottom on new messages
  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  // Load conversations list
  const loadConversations = async () => {
    try {
      const res = await conversationsApi.getAll();
      if (res.success) {
        setConversations(res.conversations);
        if (activeConvId) {
          const current = res.conversations.find((c) => c._id === activeConvId);
          if (current) setActiveConversation(current);
        } else if (res.conversations.length > 0) {
          navigate(`/messages/${res.conversations[0]._id}`, { replace: true });
        }
      }
    } catch (err) {
      console.error('Failed to load conversations:', err);
    }
  };

  useEffect(() => {
    loadConversations();
  }, [activeConvId]);

  // Load messages for active conversation
  const loadMessages = async (convId: string) => {
    try {
      const res = await conversationsApi.getMessages(convId);
      if (res.success) {
        setMessages(res.messages);
        setTimeout(() => scrollToBottom('auto'), 100);
      }
    } catch (err) {
      console.error('Failed to load messages:', err);
    }
  };

  useEffect(() => {
    if (!activeConvId) return;

    loadMessages(activeConvId);

    const socket = getSocket();
    if (!socket) return;

    // Join room
    socket.emit('conversation:join', activeConvId);
    socket.emit('message:read', { conversationId: activeConvId });

    const handleNewMessage = (msg: Message) => {
      if (msg.conversationId === activeConvId) {
        setMessages((prev) => {
          if (prev.some((m) => m._id === msg._id)) return prev;
          return [...prev, msg];
        });
        socket.emit('message:read', { conversationId: activeConvId });
        setTimeout(() => scrollToBottom('smooth'), 100);
      }
    };

    const handleMessageDeleted = ({ messageId }: { messageId: string }) => {
      setMessages((prev) =>
        prev.map((m) =>
          m._id === messageId
            ? { ...m, isDeleted: true, content: 'This message was deleted.', attachments: [] }
            : m
        )
      );
    };

    const handleTyping = ({
      conversationId,
      username,
      isTyping,
    }: {
      conversationId: string;
      username: string;
      isTyping: boolean;
    }) => {
      if (conversationId === activeConvId) {
        setOtherUserTyping(isTyping ? username : null);
      }
    };

    const handleConvEnded = ({ conversationId }: { conversationId: string }) => {
      if (conversationId === activeConvId) {
        setActiveConversation((prev) => (prev ? { ...prev, status: 'ended' } : prev));
        showToast('Conversation Closed', 'This conversation was ended by the peer.', 'info');
      }
    };

    socket.on('message:new', handleNewMessage);
    socket.on('message:deleted', handleMessageDeleted);
    socket.on('typing:status', handleTyping);
    socket.on('conversation:ended', handleConvEnded);

    return () => {
      socket.emit('conversation:leave', activeConvId);
      socket.off('message:new', handleNewMessage);
      socket.off('message:deleted', handleMessageDeleted);
      socket.off('typing:status', handleTyping);
      socket.off('conversation:ended', handleConvEnded);
    };
  }, [activeConvId]);

  // Handle typing broadcast
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
    const socket = getSocket();
    if (socket && activeConvId) {
      socket.emit('typing:start', { conversationId: activeConvId });
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('typing:stop', { conversationId: activeConvId });
      }, 1500);
    }
  };

  // Send message
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || !activeConvId || isSending) return;

    const content = inputText.trim();
    setInputText('');

    const socket = getSocket();
    if (socket) {
      socket.emit('typing:stop', { conversationId: activeConvId });
    }

    setIsSending(true);
    try {
      const res = await messagesApi.send({
        conversationId: activeConvId,
        content,
      });
      if (res.success) {
        setMessages((prev) => {
          if (prev.some((m) => m._id === res.message._id)) return prev;
          return [...prev, res.message];
        });
        setTimeout(() => scrollToBottom('smooth'), 100);
      }
    } catch (err: any) {
      showToast('Error', err.response?.data?.message || 'Failed to send message.', 'error');
    } finally {
      setIsSending(false);
    }
  };

  // Upload attachment in chat
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeConvId) return;

    if (file.size > 10 * 1024 * 1024) {
      showToast('File Too Large', 'Maximum file size is 10MB.', 'warning');
      return;
    }

    setIsUploading(true);
    try {
      const uploadRes = await messagesApi.uploadAttachment(file);
      if (uploadRes.success) {
        const msgRes = await messagesApi.send({
          conversationId: activeConvId,
          content: '',
          attachments: [uploadRes.attachment],
          messageType: file.type.startsWith('image/') ? 'image' : 'file',
        });
        if (msgRes.success) {
          setMessages((prev) => [...prev, msgRes.message]);
          setTimeout(() => scrollToBottom('smooth'), 100);
        }
      }
    } catch (err: any) {
      showToast('Error', err.response?.data?.message || 'Attachment upload failed.', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  // Delete message
  const handleDeleteMessage = async (msgId: string) => {
    if (!window.confirm('Delete this message for everyone in the conversation?')) return;
    try {
      const res = await messagesApi.delete(msgId);
      if (res.success) {
        setMessages((prev) =>
          prev.map((m) =>
            m._id === msgId
              ? { ...m, isDeleted: true, content: 'This message was deleted.', attachments: [] }
              : m
          )
        );
      }
    } catch (err: any) {
      showToast('Error', err.response?.data?.message || 'Could not delete message.', 'error');
    }
  };

  // End conversation
  const handleEndConversation = async () => {
    if (!activeConvId) return;
    if (
      !window.confirm(
        'End this conversation? Both participants will still be able to read history, but no new messages can be sent.'
      )
    )
      return;

    try {
      const res = await conversationsApi.end(activeConvId);
      if (res.success) {
        showToast('Conversation Closed', 'The conversation has ended peacefully.', 'info');
        setActiveConversation((prev) => (prev ? { ...prev, status: 'ended' } : prev));
      }
    } catch (err: any) {
      showToast('Error', err.response?.data?.message || 'Could not end conversation.', 'error');
    }
  };

  // Block participant
  const handleBlockUser = async (targetId: string, name: string) => {
    if (!window.confirm(`Block ${name}? This will immediately end the conversation and prevent further contact.`))
      return;
    try {
      const res = await usersApi.blockUser(targetId, 'Blocked from active chat');
      if (res.success) {
        showToast('User Blocked', `${name} was blocked.`, 'info');
        loadConversations();
        navigate('/messages');
      }
    } catch (err: any) {
      showToast('Error', err.response?.data?.message || 'Could not block user.', 'error');
    }
  };

  // Find other participant in active conversation
  const otherParticipant = activeConversation?.participants.find((p) => p._id !== user?._id);
  const isOtherOnline = otherParticipant ? checkUserOnline(otherParticipant._id) : false;

  return (
    <div className="h-[calc(100vh-6rem)] max-w-6xl mx-auto bg-white dark:bg-companion-dark-surface rounded-3xl border border-zinc-200/80 dark:border-companion-dark-border shadow-soft overflow-hidden flex flex-col md:flex-row">
      {/* ---------------- LEFT: CONVERSATIONS LIST ---------------- */}
      <div
        className={`w-full md:w-80 shrink-0 border-r border-zinc-200 dark:border-companion-dark-border flex flex-col ${
          activeConvId ? 'hidden md:flex' : 'flex'
        }`}
      >
        <div className="p-4 border-b border-zinc-100 dark:border-companion-dark-border flex items-center justify-between">
          <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
            Messages
          </h2>
          <span className="text-[11px] font-medium text-zinc-400 bg-zinc-100 dark:bg-companion-dark-card px-2 py-0.5 rounded-full">
            {conversations.length} Active
          </span>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-zinc-100 dark:divide-companion-dark-border">
          {conversations.length === 0 ? (
            <div className="p-8 text-center text-xs text-zinc-400 space-y-2">
              <p>No active conversations.</p>
              <p className="text-[11px]">Accept a chat request to begin listening to someone.</p>
            </div>
          ) : (
            conversations.map((conv) => {
              const peer = conv.participants.find((p) => p._id !== user?._id);
              const isSelected = conv._id === activeConvId;
              const online = peer ? checkUserOnline(peer._id) : false;

              return (
                <div
                  key={conv._id}
                  onClick={() => navigate(`/messages/${conv._id}`)}
                  className={`p-3.5 flex items-start gap-3 cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-companion-lavender-50 dark:bg-companion-lavender-950/30'
                      : 'hover:bg-zinc-50 dark:hover:bg-companion-dark-card'
                  }`}
                >
                  <Avatar avatarId={peer?.avatar} size="md" isOnline={online} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                        {peer?.nickname || peer?.anonymousUsername || 'Companion'}
                      </span>
                      <span className="text-[10px] text-zinc-400 shrink-0">
                        {new Date(conv.lastMessageAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate mt-0.5">
                      {conv.lastMessage
                        ? conv.lastMessage.content || 'Attachment'
                        : 'Conversation created'}
                    </p>

                    {conv.status === 'ended' && (
                      <span className="inline-block mt-1 text-[10px] text-zinc-400 italic">
                        Ended
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ---------------- RIGHT: CHAT ROOM ---------------- */}
      {activeConvId && activeConversation && otherParticipant ? (
        <div className="flex-1 flex flex-col h-full bg-zinc-50/50 dark:bg-companion-dark-bg/40">
          {/* Chat Header */}
          <div className="px-5 py-3.5 bg-white dark:bg-companion-dark-surface border-b border-zinc-200 dark:border-companion-dark-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/messages')}
                className="md:hidden p-1 rounded-lg text-zinc-500 hover:bg-zinc-100"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>

              <Avatar
                avatarId={otherParticipant.avatar}
                size="md"
                isOnline={isOtherOnline}
              />
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  {otherParticipant.nickname || otherParticipant.anonymousUsername}
                </h3>
                <div className="flex items-center gap-2 text-[11px] text-zinc-400">
                  <span className="font-mono">@{otherParticipant.anonymousUsername}</span>
                  <span>•</span>
                  <span className={isOtherOnline ? 'text-emerald-500 font-medium' : ''}>
                    {isOtherOnline ? 'Online' : 'Offline'}
                  </span>
                </div>
              </div>
            </div>

            {/* Conversation Actions */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              {activeConversation.status === 'active' && (
                <button
                  onClick={handleEndConversation}
                  className="px-3 py-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-300 hover:text-rose-600 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors flex items-center gap-1.5"
                  title="End conversation peacefully"
                >
                  <PhoneOff className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">End Chat</span>
                </button>
              )}

              <button
                onClick={() =>
                  handleBlockUser(
                    otherParticipant._id,
                    otherParticipant.nickname || otherParticipant.anonymousUsername
                  )
                }
                className="p-2 text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-xl transition-colors"
                title="Block user"
              >
                <UserX className="w-4 h-4" />
              </button>

              <button
                onClick={() => setIsReportOpen(true)}
                className="p-2 text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-xl transition-colors"
                title="Report user"
              >
                <ShieldAlert className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {/* Safe conversation banner */}
            <div className="p-3 bg-companion-lavender-50/50 dark:bg-companion-lavender-950/20 border border-companion-lavender-100 dark:border-companion-lavender-900/30 rounded-2xl text-center max-w-md mx-auto text-[11px] text-zinc-500 dark:text-zinc-400">
              <Lock className="w-3.5 h-3.5 mx-auto text-companion-lavender-500 mb-1" />
              Private 1-on-1 space. Be compassionate and respectful. Never share personal passwords, phone numbers, or addresses.
            </div>

            {messages.map((msg) => {
              const isSender =
                (typeof msg.senderId === 'object' ? msg.senderId._id : msg.senderId) ===
                user?._id;

              if (msg.messageType === 'system') {
                return (
                  <div key={msg._id} className="text-center my-3">
                    <span className="inline-block px-3 py-1 rounded-full text-[11px] text-zinc-500 bg-zinc-200/70 dark:bg-zinc-800 dark:text-zinc-400">
                      {msg.content}
                    </span>
                  </div>
                );
              }

              return (
                <div
                  key={msg._id}
                  className={`flex flex-col ${isSender ? 'items-end' : 'items-start'} group`}
                >
                  <div className="flex items-end gap-2 max-w-[85%] sm:max-w-[70%]">
                    {!isSender && (
                      <Avatar
                        avatarId={otherParticipant.avatar}
                        size="sm"
                        className="mb-1 shrink-0"
                      />
                    )}

                    <div
                      className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                        isSender
                          ? 'bg-companion-lavender-500 text-white rounded-br-xs shadow-sm'
                          : 'bg-white dark:bg-companion-dark-surface text-zinc-800 dark:text-zinc-200 border border-zinc-200/80 dark:border-companion-dark-border rounded-bl-xs shadow-sm'
                      } ${msg.isDeleted ? 'italic opacity-60' : ''}`}
                    >
                      {msg.content && <p className="whitespace-pre-wrap">{msg.content}</p>}

                      {/* Attachments inside bubble */}
                      {msg.attachments && msg.attachments.length > 0 && (
                        <div className="mt-2 space-y-2">
                          {msg.attachments.map((att, i) => (
                            <div key={i} className="rounded-xl overflow-hidden">
                              {att.mimetype.startsWith('image/') ? (
                                <img
                                  src={att.url}
                                  alt={att.filename}
                                  className="max-h-60 rounded-xl object-cover cursor-pointer hover:opacity-95"
                                  onClick={() => window.open(att.url, '_blank')}
                                />
                              ) : (
                                <a
                                  href={att.url}
                                  download
                                  className="flex items-center gap-2 p-2.5 rounded-xl bg-black/10 hover:bg-black/20 text-inherit transition-colors"
                                >
                                  <FileText className="w-4 h-4" />
                                  <span className="truncate max-w-[160px]">{att.filename}</span>
                                  <Download className="w-3.5 h-3.5 shrink-0 ml-auto" />
                                </a>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Sender Delete Option */}
                    {isSender && !msg.isDeleted && activeConversation.status === 'active' && (
                      <button
                        onClick={() => handleDeleteMessage(msg._id)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-zinc-400 hover:text-rose-500 transition-opacity"
                        title="Delete message"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Message timestamp and checkmark */}
                  <div
                    className={`flex items-center gap-1 text-[10px] text-zinc-400 mt-1 px-1 ${
                      isSender ? 'mr-1' : 'ml-10'
                    }`}
                  >
                    <span>
                      {new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    {isSender && (
                      <CheckCheck className="w-3 h-3 text-companion-lavender-400" />
                    )}
                  </div>
                </div>
              );
            })}

            {/* Typing Indicator */}
            {otherUserTyping && (
              <div className="flex items-center gap-2 text-xs text-zinc-400 italic">
                <Avatar avatarId={otherParticipant.avatar} size="sm" />
                <span>{otherUserTyping} is typing...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input Bar */}
          {activeConversation.status === 'active' ? (
            <div className="p-3 sm:p-4 bg-white dark:bg-companion-dark-surface border-t border-zinc-200 dark:border-companion-dark-border">
              <form onSubmit={handleSendMessage} className="flex items-end gap-2 sm:gap-3">
                {/* File Attachment Button */}
                <label className="p-2.5 rounded-2xl text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-companion-dark-card cursor-pointer transition-colors">
                  <Paperclip className="w-4 h-4" />
                  <input
                    type="file"
                    accept="image/*,.pdf,.txt"
                    onChange={handleFileUpload}
                    disabled={isUploading}
                    className="hidden"
                  />
                </label>

                {/* Textarea Input */}
                <div className="flex-1 relative">
                  <textarea
                    rows={1}
                    value={inputText}
                    onChange={handleInputChange}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder="Type an empathetic message (Press Enter to send)..."
                    className="w-full px-4 py-2.5 text-xs sm:text-sm bg-zinc-50 dark:bg-companion-dark-card border border-zinc-200 dark:border-companion-dark-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-companion-lavender-400 text-zinc-800 dark:text-zinc-200 resize-none max-h-32"
                  />
                </div>

                {/* Send Button */}
                <button
                  type="submit"
                  disabled={!inputText.trim() || isSending}
                  className="p-2.5 rounded-2xl bg-companion-lavender-500 hover:bg-companion-lavender-600 text-white shadow-sm transition-all disabled:opacity-40"
                  aria-label="Send message"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          ) : (
            <div className="p-4 bg-zinc-100 dark:bg-companion-dark-card border-t border-zinc-200 dark:border-companion-dark-border text-center text-xs text-zinc-500">
              This conversation has ended. You can review the messages, but no further replies can be sent.
            </div>
          )}
        </div>
      ) : (
        /* Empty Right Pane when no conversation selected */
        <div className="flex-1 hidden md:flex flex-col items-center justify-center p-12 text-center text-zinc-400 space-y-3">
          <Avatar avatarId="avatar-1" size="xl" />
          <h3 className="text-base font-semibold text-zinc-700 dark:text-zinc-300">
            Select a Conversation
          </h3>
          <p className="text-xs max-w-xs leading-relaxed">
            Choose a companion from the left list to view your private conversation history and talk in real-time.
          </p>
        </div>
      )}

      {/* Report Modal */}
      {otherParticipant && (
        <ReportModal
          isOpen={isReportOpen}
          onClose={() => setIsReportOpen(false)}
          reportedUserId={otherParticipant._id}
          titleHint={otherParticipant.nickname || otherParticipant.anonymousUsername}
        />
      )}
    </div>
  );
};
