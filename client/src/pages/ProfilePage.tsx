import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { useSocket } from '../context/SocketContext.js';
import { usersApi, postsApi } from '../services/api.js';
import { Avatar, AvatarPicker } from '../components/common/Avatar.js';
import { Post, BlockedUser } from '../types/index.js';
import { PostCard } from '../components/posts/PostCard.js';
import { RequestChatModal } from '../components/common/RequestChatModal.js';
import { ReportModal } from '../components/common/ReportModal.js';
import {
  User as UserIcon,
  Bookmark,
  UserX,
  Trash2,
  Save,
  Shield,
  Calendar,
  Sparkles,
  HeartHandshake,
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, updateUser, logout } = useAuth();
  const { showToast } = useSocket();

  const [activeTab, setActiveTab] = useState<'profile' | 'bookmarks' | 'blocked'>('profile');

  // Edit states
  const [nickname, setNickname] = useState(user?.nickname || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [selectedAvatar, setSelectedAvatar] = useState(user?.avatar || 'avatar-1');
  const [isSaving, setIsSaving] = useState(false);

  // Bookmarks & Blocked lists
  const [bookmarkedPosts, setBookmarkedPosts] = useState<Post[]>([]);
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(false);

  // Modals for bookmarked cards
  const [selectedPostForChat, setSelectedPostForChat] = useState<Post | null>(null);
  const [selectedPostForReport, setSelectedPostForReport] = useState<Post | null>(null);

  useEffect(() => {
    if (user) {
      setNickname(user.nickname || '');
      setBio(user.bio || '');
      setSelectedAvatar(user.avatar || 'avatar-1');
    }
  }, [user]);

  const loadBookmarks = async () => {
    setIsLoadingList(true);
    try {
      const res = await postsApi.getBookmarkedPosts();
      if (res.success) setBookmarkedPosts(res.posts);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingList(false);
    }
  };

  const loadBlockedUsers = async () => {
    setIsLoadingList(true);
    try {
      const res = await usersApi.getBlocked();
      if (res.success) setBlockedUsers(res.blocked);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingList(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'bookmarks') loadBookmarks();
    if (activeTab === 'blocked') loadBlockedUsers();
  }, [activeTab]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await usersApi.updateProfile({
        nickname: nickname.trim(),
        bio: bio.trim(),
        avatar: selectedAvatar,
      });
      if (res.success) {
        updateUser(res.user);
        showToast('Profile Updated', 'Your anonymous details were saved.', 'success');
      }
    } catch (err: any) {
      showToast('Error', err.response?.data?.message || 'Could not update profile.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUnblock = async (targetId: string, name: string) => {
    try {
      const res = await usersApi.unblockUser(targetId);
      if (res.success) {
        showToast('Unblocked', `${name} is now unblocked.`, 'info');
        setBlockedUsers((prev) => prev.filter((b) => (typeof b.blockedUserId === 'object' ? b.blockedUserId._id : b.blockedUserId) !== targetId));
      }
    } catch (err: any) {
      showToast('Error', err.response?.data?.message || 'Failed to unblock.', 'error');
    }
  };

  const handleDeleteAccount = async () => {
    const confirmation = window.prompt(
      'Are you absolutely sure you want to permanently delete your account? Type "DELETE" to confirm:'
    );
    if (confirmation !== 'DELETE') return;

    try {
      const res = await usersApi.deleteAccount();
      if (res.success) {
        showToast('Account Deleted', 'Your data was permanently removed. Take care.', 'info');
        logout();
      }
    } catch (err: any) {
      showToast('Error', err.response?.data?.message || 'Could not delete account.', 'error');
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-16">
      {/* Header Profile Summary */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-companion-dark-surface border border-zinc-200/80 dark:border-companion-dark-border shadow-soft flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
        <Avatar avatarId={selectedAvatar} size="xl" />
        <div className="space-y-1.5 flex-1 min-w-0">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-50">
              {user.nickname || user.anonymousUsername}
            </h1>
            <span className="text-xs font-mono text-zinc-400 bg-zinc-100 dark:bg-companion-dark-card px-2.5 py-0.5 rounded-full">
              @{user.anonymousUsername}
            </span>
          </div>

          <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed max-w-lg">
            {user.bio || 'Here to listen and share in a safe space.'}
          </p>

          <div className="flex items-center justify-center sm:justify-start gap-4 text-xs text-zinc-400 pt-2">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              Joined {new Date(user.createdAt).toLocaleDateString()}
            </span>
            <span>•</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
              <Shield className="w-3 h-3" /> Anonymous Sanctuary
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-zinc-200 dark:border-companion-dark-border">
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 pb-3 px-4 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'profile'
              ? 'border-companion-lavender-500 text-companion-lavender-600 dark:text-companion-lavender-400'
              : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
          }`}
        >
          <UserIcon className="w-4 h-4" />
          <span>Edit Profile</span>
        </button>

        <button
          onClick={() => setActiveTab('bookmarks')}
          className={`flex items-center gap-2 pb-3 px-4 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'bookmarks'
              ? 'border-companion-lavender-500 text-companion-lavender-600 dark:text-companion-lavender-400'
              : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
          }`}
        >
          <Bookmark className="w-4 h-4" />
          <span>Saved Bookmarks</span>
        </button>

        <button
          onClick={() => setActiveTab('blocked')}
          className={`flex items-center gap-2 pb-3 px-4 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'blocked'
              ? 'border-companion-lavender-500 text-companion-lavender-600 dark:text-companion-lavender-400'
              : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
          }`}
        >
          <UserX className="w-4 h-4" />
          <span>Blocked Users</span>
        </button>
      </div>

      {/* ---------------- TAB 1: EDIT PROFILE ---------------- */}
      {activeTab === 'profile' && (
        <form
          onSubmit={handleSaveProfile}
          className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-companion-dark-surface border border-zinc-200/80 dark:border-companion-dark-border shadow-soft space-y-6"
        >
          {/* Avatar selection */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-2">
              Choose Avatar Mood
            </label>
            <AvatarPicker
              selected={selectedAvatar}
              onSelect={(id) => setSelectedAvatar(id)}
            />
          </div>

          {/* Nickname */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1.5">
              Friendly Display Nickname
            </label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="e.g. Quiet Heart, Gentle Morning"
              className="w-full px-4 py-2.5 text-sm bg-zinc-50 dark:bg-companion-dark-card border border-zinc-200 dark:border-companion-dark-border rounded-xl focus:outline-none focus:ring-2 focus:ring-companion-lavender-400 text-zinc-800 dark:text-zinc-200"
              maxLength={30}
            />
          </div>

          {/* Bio */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1.5">
              Short Bio
            </label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="A gentle note about yourself, what you are experiencing, or how you like to listen..."
              className="w-full px-4 py-2.5 text-sm bg-zinc-50 dark:bg-companion-dark-card border border-zinc-200 dark:border-companion-dark-border rounded-xl focus:outline-none focus:ring-2 focus:ring-companion-lavender-400 text-zinc-800 dark:text-zinc-200"
              maxLength={200}
            />
            <div className="flex justify-end text-[11px] text-zinc-400 mt-1">
              <span>{bio.length}/200</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-zinc-100 dark:border-companion-dark-border">
            <button
              type="button"
              onClick={handleDeleteAccount}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-rose-600 hover:text-rose-700 p-2 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete Account</span>
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-companion-lavender-500 hover:bg-companion-lavender-600 shadow-sm transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      )}

      {/* ---------------- TAB 2: BOOKMARKS ---------------- */}
      {activeTab === 'bookmarks' && (
        <div className="space-y-4">
          {isLoadingList ? (
            <div className="space-y-3 animate-pulse">
              <div className="p-6 rounded-2xl bg-zinc-100 dark:bg-companion-dark-card h-32" />
              <div className="p-6 rounded-2xl bg-zinc-100 dark:bg-companion-dark-card h-32" />
            </div>
          ) : bookmarkedPosts.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-white dark:bg-companion-dark-surface border border-zinc-200 dark:border-companion-dark-border space-y-2">
              <Bookmark className="w-10 h-10 text-zinc-300 mx-auto" />
              <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                No Bookmarked Stories
              </h3>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                Stories you bookmark will be stored here privately for your quiet reflection.
              </p>
            </div>
          ) : (
            bookmarkedPosts.map((post) => (
              <PostCard
                key={post._id}
                post={post}
                isBookmarked={true}
                onToggleBookmark={async (id) => {
                  await postsApi.toggleBookmark(id);
                  setBookmarkedPosts((prev) => prev.filter((p) => p._id !== id));
                }}
                onRequestChat={(p) => setSelectedPostForChat(p)}
                onReport={(p) => setSelectedPostForReport(p)}
              />
            ))
          )}
        </div>
      )}

      {/* ---------------- TAB 3: BLOCKED USERS ---------------- */}
      {activeTab === 'blocked' && (
        <div className="space-y-3">
          {isLoadingList ? (
            <div className="p-6 rounded-2xl bg-zinc-100 dark:bg-companion-dark-card animate-pulse h-24" />
          ) : blockedUsers.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-white dark:bg-companion-dark-surface border border-zinc-200 dark:border-companion-dark-border space-y-2">
              <Shield className="w-10 h-10 text-emerald-400 mx-auto" />
              <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                No Blocked Users
              </h3>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                Your block list is empty. You can block any user from chat requests or conversations to preserve your peace.
              </p>
            </div>
          ) : (
            blockedUsers.map((b) => {
              const tgt = b.blockedUserId;
              return (
                <div
                  key={b._id}
                  className="p-4 rounded-2xl bg-white dark:bg-companion-dark-surface border border-zinc-200 dark:border-companion-dark-border shadow-sm flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <Avatar avatarId={tgt?.avatar} size="sm" />
                    <div>
                      <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                        {tgt?.nickname || tgt?.anonymousUsername || 'User'}
                      </span>
                      <span className="text-[11px] font-mono text-zinc-400 block">
                        @{tgt?.anonymousUsername}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() =>
                      handleUnblock(tgt._id, tgt.nickname || tgt.anonymousUsername)
                    }
                    className="text-xs font-medium text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 border border-zinc-200 dark:border-companion-dark-border px-3 py-1.5 rounded-xl hover:bg-zinc-50 dark:hover:bg-companion-dark-card transition-colors"
                  >
                    Unblock
                  </button>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Modals for bookmarked posts */}
      <RequestChatModal
        isOpen={!!selectedPostForChat}
        onClose={() => setSelectedPostForChat(null)}
        post={selectedPostForChat}
      />

      <ReportModal
        isOpen={!!selectedPostForReport}
        onClose={() => setSelectedPostForReport(null)}
        postId={selectedPostForReport?._id}
        titleHint={selectedPostForReport?.title}
      />
    </div>
  );
};
