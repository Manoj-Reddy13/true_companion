import React, { useState, useEffect } from 'react';
import { adminApi, reportsApi } from '../services/api.js';
import { Report, User, UserStatus } from '../types/index.js';
import { useAuth } from '../context/AuthContext.js';
import { useSocket } from '../context/SocketContext.js';
import { Avatar } from '../components/common/Avatar.js';
import {
  ShieldAlert,
  Users,
  FileText,
  MessageSquare,
  AlertTriangle,
  CheckCircle,
  Ban,
  Clock,
  Trash2,
  RefreshCw,
  Search,
} from 'lucide-react';

export const AdminPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useSocket();

  const [stats, setStats] = useState<any>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [usersList, setUsersList] = useState<User[]>([]);
  const [activeTab, setActiveTab] = useState<'reports' | 'users'>('reports');
  const [reportFilter, setReportFilter] = useState<string>('pending');
  const [userSearch, setUserSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Selected report for action
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [actionType, setActionType] = useState<string>('warning_issued');
  const [adminNotes, setAdminNotes] = useState('');
  const [isApplyingAction, setIsApplyingAction] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [statsRes, reportsRes, usersRes] = await Promise.all([
        adminApi.getStats(),
        reportsApi.getAll(reportFilter === 'all' ? undefined : reportFilter),
        adminApi.getUsers(),
      ]);
      if (statsRes.success) setStats(statsRes.stats);
      if (reportsRes.success) setReports(reportsRes.reports);
      if (usersRes.success) setUsersList(usersRes.users);
    } catch (err: any) {
      showToast('Error', 'Failed to load administrative dashboard data.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [reportFilter]);

  if (!user || (user.role !== 'admin' && user.role !== 'moderator')) {
    return (
      <div className="max-w-md mx-auto py-20 text-center space-y-3">
        <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Access Denied</h2>
        <p className="text-xs text-zinc-500">
          This dashboard is strictly reserved for authorized platform moderators and administrators.
        </p>
      </div>
    );
  }

  const handleApplyReportAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReport) return;

    setIsApplyingAction(true);
    try {
      const res = await reportsApi.update(selectedReport._id, {
        status: 'resolved',
        adminAction: actionType,
        adminNotes: adminNotes.trim(),
      });
      if (res.success) {
        showToast('Action Applied', 'Moderation action executed and logged.', 'success');
        setSelectedReport(null);
        setAdminNotes('');
        loadData();
      }
    } catch (err: any) {
      showToast('Error', err.response?.data?.message || 'Failed to apply action.', 'error');
    } finally {
      setIsApplyingAction(false);
    }
  };

  const handleDismissReport = async (reportId: string) => {
    try {
      const res = await reportsApi.update(reportId, {
        status: 'dismissed',
        adminAction: 'report_dismissed',
        adminNotes: 'Dismissed by moderator - no violation found.',
      });
      if (res.success) {
        showToast('Report Dismissed', 'Marked as dismissed.', 'info');
        loadData();
      }
    } catch (err: any) {
      showToast('Error', 'Failed to dismiss report.', 'error');
    }
  };

  const handleUpdateUserStatus = async (userId: string, newStatus: UserStatus) => {
    try {
      const res = await adminApi.updateUserStatus(userId, {
        status: newStatus,
        suspensionDays: newStatus === 'suspended' ? 7 : undefined,
      });
      if (res.success) {
        showToast('User Status Updated', `Account status changed to ${newStatus}.`, 'info');
        loadData();
      }
    } catch (err: any) {
      showToast('Error', 'Failed to change user status.', 'error');
    }
  };

  const filteredUsers = usersList.filter(
    (u) =>
      u.anonymousUsername.toLowerCase().includes(userSearch.toLowerCase()) ||
      (u.nickname && u.nickname.toLowerCase().includes(userSearch.toLowerCase()))
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-amber-800 bg-amber-100 dark:bg-amber-950/60 dark:text-amber-300 mb-2">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
            Administrative Safety & Moderation Hub
          </div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            Platform Moderation Console
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Maintain community peace, review user complaints, and enforce compassionate guidelines.
          </p>
        </div>

        <button
          onClick={loadData}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-companion-dark-border bg-white dark:bg-companion-dark-surface hover:bg-zinc-50 transition-colors self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Metrics Row */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-white dark:bg-companion-dark-surface border border-zinc-200 dark:border-companion-dark-border shadow-sm">
            <div className="flex items-center justify-between text-zinc-400 mb-2">
              <span className="text-xs font-medium">Registered Users</span>
              <Users className="w-4 h-4 text-companion-lavender-500" />
            </div>
            <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{stats.totalUsers}</p>
            <span className="text-[11px] text-emerald-500 font-medium">
              {stats.activeUsers} Active Accounts
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-companion-dark-surface border border-zinc-200 dark:border-companion-dark-border shadow-sm">
            <div className="flex items-center justify-between text-zinc-400 mb-2">
              <span className="text-xs font-medium">Shared Stories</span>
              <FileText className="w-4 h-4 text-companion-blue-500" />
            </div>
            <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{stats.totalPosts}</p>
            <span className="text-[11px] text-zinc-400">Across 9 categories</span>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-companion-dark-surface border border-zinc-200 dark:border-companion-dark-border shadow-sm">
            <div className="flex items-center justify-between text-zinc-400 mb-2">
              <span className="text-xs font-medium">Conversations</span>
              <MessageSquare className="w-4 h-4 text-emerald-500" />
            </div>
            <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{stats.totalConversations}</p>
            <span className="text-[11px] text-zinc-400">1-on-1 connections</span>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-companion-dark-surface border border-zinc-200 dark:border-companion-dark-border shadow-sm">
            <div className="flex items-center justify-between text-zinc-400 mb-2">
              <span className="text-xs font-medium">Pending Reports</span>
              <AlertTriangle className="w-4 h-4 text-rose-500" />
            </div>
            <p className="text-2xl font-bold text-rose-600 dark:text-rose-400">{stats.pendingReports}</p>
            <span className="text-[11px] text-zinc-400">{stats.resolvedReports} Resolved</span>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-zinc-200 dark:border-companion-dark-border">
        <button
          onClick={() => setActiveTab('reports')}
          className={`flex items-center gap-2 pb-3 px-4 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'reports'
              ? 'border-companion-lavender-500 text-companion-lavender-600 dark:text-companion-lavender-400'
              : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>Reported Items ({reports.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 pb-3 px-4 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'users'
              ? 'border-companion-lavender-500 text-companion-lavender-600 dark:text-companion-lavender-400'
              : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>User Directory ({usersList.length})</span>
        </button>
      </div>

      {/* ---------------- TAB 1: REPORTS TABLE ---------------- */}
      {activeTab === 'reports' && (
        <div className="space-y-4">
          {/* Sub-filter */}
          <div className="flex items-center gap-2">
            {['pending', 'resolved', 'dismissed', 'all'].map((f) => (
              <button
                key={f}
                onClick={() => setReportFilter(f)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium capitalize transition-colors ${
                  reportFilter === f
                    ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                    : 'bg-zinc-100 dark:bg-companion-dark-card text-zinc-600 dark:text-zinc-300'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {reports.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-white dark:bg-companion-dark-surface border border-zinc-200 dark:border-companion-dark-border space-y-2">
              <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto" />
              <h3 className="text-base font-semibold text-zinc-800 dark:text-zinc-200">
                Inbox Zero for Moderation
              </h3>
              <p className="text-xs text-zinc-400">
                No active complaints matching this filter. Our community remains peaceful.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {reports.map((report) => (
                <div
                  key={report._id}
                  className="p-5 rounded-2xl bg-white dark:bg-companion-dark-surface border border-zinc-200 dark:border-companion-dark-border shadow-sm space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-900/40">
                        {report.reason}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                          report.status === 'pending'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-zinc-100 text-zinc-700'
                        }`}
                      >
                        {report.status}
                      </span>
                    </div>

                    <span className="text-[11px] text-zinc-400">
                      Reported {new Date(report.createdAt).toLocaleString()}
                    </span>
                  </div>

                  {/* Context of the report */}
                  {report.postId && (
                    <div className="p-3 bg-zinc-50 dark:bg-companion-dark-card rounded-xl text-xs space-y-1 border border-zinc-100 dark:border-companion-dark-border">
                      <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                        Reported Story: "{report.postId.title}"
                      </span>
                      <p className="text-zinc-500 line-clamp-2">{report.postId.description}</p>
                    </div>
                  )}

                  {report.messageId && (
                    <div className="p-3 bg-zinc-50 dark:bg-companion-dark-card rounded-xl text-xs space-y-1 border border-zinc-100 dark:border-companion-dark-border">
                      <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                        Reported Message Content:
                      </span>
                      <p className="text-zinc-500 italic">"{report.messageId.content}"</p>
                    </div>
                  )}

                  {report.reportedUserId && (
                    <div className="text-xs text-zinc-600 dark:text-zinc-400">
                      Target User:{' '}
                      <strong className="text-zinc-800 dark:text-zinc-200">
                        @{report.reportedUserId.anonymousUsername}
                      </strong>{' '}
                      (Warnings: {report.reportedUserId.warningCount || 0})
                    </div>
                  )}

                  {report.description && (
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-companion-dark-card p-2.5 rounded-xl">
                      Reporter explanation: "{report.description}"
                    </p>
                  )}

                  {/* Actions Bar */}
                  {report.status === 'pending' && (
                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100 dark:border-companion-dark-border">
                      <button
                        onClick={() => handleDismissReport(report._id)}
                        className="px-3 py-1.5 text-xs text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 border border-zinc-200 dark:border-companion-dark-border rounded-xl"
                      >
                        Dismiss as False Positive
                      </button>
                      <button
                        onClick={() => setSelectedReport(report)}
                        className="px-4 py-1.5 text-xs font-semibold text-white bg-companion-lavender-500 hover:bg-companion-lavender-600 rounded-xl shadow-sm"
                      >
                        Take Moderation Action
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ---------------- TAB 2: USERS DIRECTORY ---------------- */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
            <input
              type="text"
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              placeholder="Search users by anonymous handle or nickname..."
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-white dark:bg-companion-dark-surface border border-zinc-200 dark:border-companion-dark-border rounded-xl focus:outline-none focus:ring-2 focus:ring-companion-lavender-400 text-zinc-800 dark:text-zinc-200"
            />
          </div>

          <div className="bg-white dark:bg-companion-dark-surface rounded-2xl border border-zinc-200 dark:border-companion-dark-border overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 dark:bg-companion-dark-card border-b border-zinc-200 dark:border-companion-dark-border text-zinc-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-4 py-3">Anonymous Handle</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Warnings</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-companion-dark-border">
                {filteredUsers.map((u) => (
                  <tr key={u._id} className="hover:bg-zinc-50/50 dark:hover:bg-companion-dark-card/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Avatar avatarId={u.avatar} size="sm" />
                        <div>
                          <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                            {u.nickname || u.anonymousUsername}
                          </span>
                          <span className="font-mono text-[10px] text-zinc-400 block">
                            @{u.anonymousUsername}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 capitalize text-zinc-600 dark:text-zinc-300">
                      {u.role}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          u.status === 'active'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : u.status === 'suspended'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                        }`}
                      >
                        {u.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-zinc-600 dark:text-zinc-300">
                      {u.warningCount || 0}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {u.role !== 'admin' && (
                        <div className="flex items-center justify-end gap-1.5">
                          {u.status !== 'active' && (
                            <button
                              onClick={() => handleUpdateUserStatus(u._id, 'active')}
                              className="px-2.5 py-1 text-[11px] font-medium text-emerald-600 border border-emerald-200 hover:bg-emerald-50 rounded-lg"
                            >
                              Restore
                            </button>
                          )}
                          {u.status === 'active' && (
                            <button
                              onClick={() => handleUpdateUserStatus(u._id, 'suspended')}
                              className="px-2.5 py-1 text-[11px] font-medium text-amber-600 border border-amber-200 hover:bg-amber-50 rounded-lg"
                            >
                              Suspend (7d)
                            </button>
                          )}
                          {u.status !== 'banned' && (
                            <button
                              onClick={() => handleUpdateUserStatus(u._id, 'banned')}
                              className="px-2.5 py-1 text-[11px] font-medium text-rose-600 border border-rose-200 hover:bg-rose-50 rounded-lg"
                            >
                              Ban
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Action Execution Dialog */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white dark:bg-companion-dark-surface max-w-md w-full p-6 rounded-3xl shadow-xl border border-zinc-200 dark:border-companion-dark-border space-y-4">
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              Apply Moderation Action
            </h3>

            <p className="text-xs text-zinc-500">
              Report Reason:{' '}
              <strong className="text-zinc-800 dark:text-zinc-200">{selectedReport.reason}</strong>
            </p>

            <form onSubmit={handleApplyReportAction} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1.5">
                  Action to Execute
                </label>
                <select
                  value={actionType}
                  onChange={(e) => setActionType(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-companion-dark-card border border-zinc-200 dark:border-companion-dark-border rounded-xl text-zinc-800 dark:text-zinc-200"
                >
                  <option value="warning_issued">Issue Formal Community Warning</option>
                  <option value="post_removed">Remove / Hide Inappropriate Post</option>
                  <option value="account_suspended">Suspend Account for 7 Days</option>
                  <option value="account_banned">Permanently Terminate Account</option>
                  <option value="report_dismissed">Dismiss Report</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1.5">
                  Moderator Notes & Rationale
                </label>
                <textarea
                  rows={3}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Notes explaining why this decision was reached..."
                  className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-companion-dark-card border border-zinc-200 dark:border-companion-dark-border rounded-xl text-zinc-800 dark:text-zinc-200"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedReport(null)}
                  className="px-4 py-2 text-xs font-medium text-zinc-500 hover:text-zinc-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isApplyingAction}
                  className="px-5 py-2 text-xs font-semibold text-white bg-companion-lavender-500 hover:bg-companion-lavender-600 rounded-xl shadow-sm disabled:opacity-50"
                >
                  {isApplyingAction ? 'Applying...' : 'Confirm Action'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
