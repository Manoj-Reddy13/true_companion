import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { chatRequestsApi } from '../services/api.js';
import { ChatRequest } from '../types/index.js';
import { Avatar } from '../components/common/Avatar.js';
import { useSocket } from '../context/SocketContext.js';
import { ReportModal } from '../components/common/ReportModal.js';
import { usersApi } from '../services/api.js';
import {
  HeartHandshake,
  Check,
  X,
  Clock,
  Send,
  Inbox,
  ShieldAlert,
  ArrowRight,
  MessageSquare,
} from 'lucide-react';

export const ChatRequestsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received');
  const [receivedRequests, setReceivedRequests] = useState<ChatRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<ChatRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [reportTarget, setReportTarget] = useState<{ userId: string; username: string } | null>(
    null
  );

  const { showToast } = useSocket();
  const navigate = useNavigate();

  const loadRequests = async () => {
    setIsLoading(true);
    try {
      const [recData, sentData] = await Promise.all([
        chatRequestsApi.getReceived(),
        chatRequestsApi.getSent(),
      ]);
      if (recData.success) setReceivedRequests(recData.requests);
      if (sentData.success) setSentRequests(sentData.requests);
    } catch (err) {
      console.error('Failed to load chat requests:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleAccept = async (id: string) => {
    try {
      const res = await chatRequestsApi.accept(id);
      if (res.success) {
        showToast('Request Accepted', 'Conversation started! You can now chat in private.', 'success');
        setReceivedRequests((prev) =>
          prev.map((r) => (r._id === id ? { ...r, status: 'accepted' } : r))
        );
        navigate(`/messages/${res.conversationId}`);
      }
    } catch (err: any) {
      showToast('Error', err.response?.data?.message || 'Could not accept request.', 'error');
    }
  };

  const handleDecline = async (id: string) => {
    try {
      const res = await chatRequestsApi.decline(id);
      if (res.success) {
        showToast('Request Declined', 'The request has been politely declined.', 'info');
        setReceivedRequests((prev) =>
          prev.map((r) => (r._id === id ? { ...r, status: 'declined' } : r))
        );
      }
    } catch (err: any) {
      showToast('Error', err.response?.data?.message || 'Could not decline request.', 'error');
    }
  };

  const handleCancel = async (id: string) => {
    try {
      const res = await chatRequestsApi.cancel(id);
      if (res.success) {
        showToast('Request Cancelled', 'Your pending request was withdrawn.', 'info');
        setSentRequests((prev) => prev.filter((r) => r._id !== id));
      }
    } catch (err: any) {
      showToast('Error', err.response?.data?.message || 'Could not cancel request.', 'error');
    }
  };

  const handleBlockUser = async (userId: string, username: string) => {
    if (!window.confirm(`Are you sure you want to block ${username}?`)) return;
    try {
      const res = await usersApi.blockUser(userId, 'Blocked from chat requests');
      if (res.success) {
        showToast('User Blocked', `${username} has been blocked.`, 'info');
        setReceivedRequests((prev) =>
          prev.filter((r) => {
            const sId = typeof r.senderId === 'object' ? r.senderId._id : r.senderId;
            return sId !== userId;
          })
        );
      }
    } catch (err: any) {
      showToast('Error', err.response?.data?.message || 'Failed to block user.', 'error');
    }
  };

  const pendingReceived = receivedRequests.filter((r) => r.status === 'pending');
  const pastReceived = receivedRequests.filter((r) => r.status !== 'pending');

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-16">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          Chat Requests
        </h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
          Manage your private conversation requests. Connections happen only when both sides feel comfortable.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-zinc-200 dark:border-companion-dark-border">
        <button
          onClick={() => setActiveTab('received')}
          className={`flex items-center gap-2 pb-3 px-4 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'received'
              ? 'border-companion-lavender-500 text-companion-lavender-600 dark:text-companion-lavender-400'
              : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
          }`}
        >
          <Inbox className="w-4 h-4" />
          <span>Received</span>
          {pendingReceived.length > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-companion-lavender-500 text-white">
              {pendingReceived.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('sent')}
          className={`flex items-center gap-2 pb-3 px-4 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'sent'
              ? 'border-companion-lavender-500 text-companion-lavender-600 dark:text-companion-lavender-400'
              : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
          }`}
        >
          <Send className="w-4 h-4" />
          <span>Sent Requests</span>
          <span className="text-[11px] text-zinc-400">({sentRequests.length})</span>
        </button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="p-5 rounded-2xl bg-white dark:bg-companion-dark-surface border border-zinc-200 dark:border-companion-dark-border animate-pulse h-28"
            />
          ))}
        </div>
      ) : activeTab === 'received' ? (
        /* ---------------- RECEIVED REQUESTS ---------------- */
        <div className="space-y-4">
          {pendingReceived.length === 0 && pastReceived.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-white dark:bg-companion-dark-surface border border-zinc-200 dark:border-companion-dark-border space-y-2">
              <HeartHandshake className="w-10 h-10 text-zinc-300 mx-auto" />
              <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                No Chat Requests Yet
              </h3>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                When other anonymous members read your stories and want to connect, their requests will appear here.
              </p>
            </div>
          ) : (
            <>
              {pendingReceived.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    Pending Acceptance ({pendingReceived.length})
                  </h3>
                  {pendingReceived.map((req) => {
                    const sender = req.senderId;
                    return (
                      <div
                        key={req._id}
                        className="p-5 rounded-2xl bg-white dark:bg-companion-dark-surface border border-companion-lavender-200 dark:border-companion-dark-border shadow-soft space-y-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <Avatar avatarId={sender.avatar} size="md" />
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                                  {sender.nickname || sender.anonymousUsername}
                                </span>
                                <span className="text-[11px] font-mono text-zinc-400">
                                  @{sender.anonymousUsername}
                                </span>
                              </div>
                              <span className="text-[10px] text-zinc-400">
                                {new Date(req.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>

                          {/* Quick Actions for Safety */}
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() =>
                                handleBlockUser(
                                  sender._id,
                                  sender.nickname || sender.anonymousUsername
                                )
                              }
                              className="text-[11px] text-zinc-400 hover:text-rose-500 px-2 py-1 rounded"
                              title="Block user"
                            >
                              Block
                            </button>
                            <button
                              onClick={() =>
                                setReportTarget({
                                  userId: sender._id,
                                  username: sender.nickname || sender.anonymousUsername,
                                })
                              }
                              className="text-[11px] text-zinc-400 hover:text-rose-500 px-2 py-1 rounded"
                              title="Report request"
                            >
                              Report
                            </button>
                          </div>
                        </div>

                        {req.postId && (
                          <div className="text-xs bg-zinc-50 dark:bg-companion-dark-card p-2.5 rounded-xl border border-zinc-100 dark:border-companion-dark-border/60">
                            <span className="text-zinc-400 font-normal">Regarding your post: </span>
                            <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                              "{req.postId.title}"
                            </span>
                          </div>
                        )}

                        {req.introductionMessage && (
                          <p className="text-xs text-zinc-700 dark:text-zinc-300 italic bg-companion-lavender-50/50 dark:bg-companion-lavender-950/20 p-3 rounded-xl border border-companion-lavender-100 dark:border-companion-lavender-900/30">
                            "{req.introductionMessage}"
                          </p>
                        )}

                        {/* Accept / Decline Action Buttons */}
                        <div className="flex items-center justify-end gap-2.5 pt-1">
                          <button
                            onClick={() => handleDecline(req._id)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-medium text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-companion-dark-card transition-colors"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Decline</span>
                          </button>
                          <button
                            onClick={() => handleAccept(req._id)}
                            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-semibold text-white bg-companion-lavender-500 hover:bg-companion-lavender-600 transition-all shadow-sm"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Accept & Start Chat</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Past / Resolved Requests */}
              {pastReceived.length > 0 && (
                <div className="space-y-3 pt-4">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    Past Requests ({pastReceived.length})
                  </h3>
                  {pastReceived.map((req) => (
                    <div
                      key={req._id}
                      className="p-4 rounded-xl bg-zinc-50 dark:bg-companion-dark-card border border-zinc-200/60 dark:border-companion-dark-border flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <Avatar avatarId={req.senderId.avatar} size="sm" />
                        <span className="font-medium text-zinc-800 dark:text-zinc-200">
                          {req.senderId.nickname || req.senderId.anonymousUsername}
                        </span>
                      </div>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                          req.status === 'accepted'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : 'bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400'
                        }`}
                      >
                        {req.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      ) : (
        /* ---------------- SENT REQUESTS ---------------- */
        <div className="space-y-3">
          {sentRequests.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-white dark:bg-companion-dark-surface border border-zinc-200 dark:border-companion-dark-border space-y-2">
              <Send className="w-10 h-10 text-zinc-300 mx-auto" />
              <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                No Sent Requests
              </h3>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                Explore the feed and click "Request to Chat" on any story to connect with a peer.
              </p>
            </div>
          ) : (
            sentRequests.map((req) => {
              const receiver = req.receiverId;
              const isPending = req.status === 'pending';
              return (
                <div
                  key={req._id}
                  className="p-5 rounded-2xl bg-white dark:bg-companion-dark-surface border border-zinc-200 dark:border-companion-dark-border shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3">
                    <Avatar avatarId={receiver?.avatar} size="md" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                          {receiver?.nickname || receiver?.anonymousUsername}
                        </span>
                        <span className="text-[11px] font-mono text-zinc-400">
                          @{receiver?.anonymousUsername}
                        </span>
                      </div>
                      {req.postId && (
                        <p className="text-xs text-zinc-500 mt-0.5 line-clamp-1">
                          Story: "{req.postId.title}"
                        </p>
                      )}
                      <span className="text-[10px] text-zinc-400">
                        Sent on {new Date(req.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-auto">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${
                        req.status === 'accepted'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : req.status === 'declined'
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                      }`}
                    >
                      {req.status}
                    </span>

                    {isPending && (
                      <button
                        onClick={() => handleCancel(req._id)}
                        className="text-xs text-zinc-500 hover:text-rose-600 px-3 py-1 rounded-xl border border-zinc-200 dark:border-companion-dark-border hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors"
                      >
                        Withdraw
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Report Modal */}
      {reportTarget && (
        <ReportModal
          isOpen={!!reportTarget}
          onClose={() => setReportTarget(null)}
          reportedUserId={reportTarget.userId}
          titleHint={reportTarget.username}
        />
      )}
    </div>
  );
};
