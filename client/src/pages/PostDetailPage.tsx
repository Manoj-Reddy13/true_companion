import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { postsApi } from '../services/api.js';
import { Post } from '../types/index.js';
import { Avatar } from '../components/common/Avatar.js';
import { RequestChatModal } from '../components/common/RequestChatModal.js';
import { ReportModal } from '../components/common/ReportModal.js';
import { useAuth } from '../context/AuthContext.js';
import { useSocket } from '../context/SocketContext.js';
import {
  ArrowLeft,
  Calendar,
  MessageSquareHeart,
  Bookmark,
  Flag,
  Lock,
  Share2,
  Eye,
  Shield,
  HeartHandshake,
} from 'lucide-react';

export const PostDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated, openAuthModal } = useAuth();
  const { showToast } = useSocket();

  const [post, setPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchPost = async () => {
      setIsLoading(true);
      try {
        const res = await postsApi.getPostById(id);
        if (res.success) {
          setPost(res.post);
        }
      } catch (err: any) {
        showToast('Not Found', 'This story could not be loaded or has been removed.', 'error');
        navigate('/explore');
      } finally {
        setIsLoading(false);
      }
    };
    fetchPost();
  }, [id]);

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto py-12 space-y-4 animate-pulse">
        <div className="w-24 h-4 bg-zinc-200 dark:bg-zinc-800 rounded" />
        <div className="w-3/4 h-8 bg-zinc-200 dark:bg-zinc-800 rounded" />
        <div className="w-full h-40 bg-zinc-200 dark:bg-zinc-800 rounded-3xl" />
      </div>
    );
  }

  if (!post) return null;

  const author = post.authorId || {
    _id: '',
    anonymousUsername: 'Anonymous',
    nickname: '',
    avatar: 'avatar-1',
  };

  const isAuthor = user && user._id === author._id;
  const isBookmarked = user?.bookmarks?.includes(post._id) || false;

  const handleToggleBookmark = async () => {
    if (!isAuthenticated) {
      openAuthModal('login');
      return;
    }
    try {
      const res = await postsApi.toggleBookmark(post._id);
      if (res.success) {
        showToast(res.bookmarked ? 'Bookmark Saved' : 'Bookmark Removed', res.message, 'info');
        if (user) {
          user.bookmarks = res.bookmarks;
        }
      }
    } catch (err: any) {
      showToast('Notice', err.response?.data?.message || 'Could not update bookmark', 'warning');
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    showToast('Link Copied', 'Story link copied to clipboard.', 'success');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-16">
      {/* Back link */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to feed
      </button>

      {/* Main Post Container */}
      <article className="p-6 sm:p-10 rounded-3xl bg-white dark:bg-companion-dark-surface border border-zinc-200/80 dark:border-companion-dark-border shadow-soft space-y-6">
        {/* Header Metadata */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-100 dark:border-companion-dark-border">
          <div className="flex items-center gap-3.5">
            <Avatar avatarId={author.avatar} size="lg" />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  {author.nickname || author.anonymousUsername}
                </span>
                <span className="text-xs font-mono text-zinc-400 dark:text-zinc-500">
                  @{author.anonymousUsername}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-zinc-400 mt-1">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(post.createdAt).toLocaleDateString(undefined, {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
                {post.viewsCount !== undefined && (
                  <span className="flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5" />
                    {post.viewsCount} readers
                  </span>
                )}
              </div>
            </div>
          </div>

          <span className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-companion-lavender-50 text-companion-lavender-700 dark:bg-companion-lavender-950/40 dark:text-companion-lavender-300 border border-companion-lavender-200 dark:border-companion-lavender-900/40 self-start sm:self-auto">
            {post.category}
          </span>
        </div>

        {/* Post Title & Full Content */}
        <div>
          <h1 className="text-xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-50 leading-tight">
            {post.title}
          </h1>
          <div className="mt-5 text-sm sm:text-base text-zinc-700 dark:text-zinc-200 leading-relaxed whitespace-pre-line space-y-4 font-normal">
            {post.description}
          </div>
        </div>

        {/* Attachments */}
        {post.attachments && post.attachments.length > 0 && (
          <div className="pt-4 border-t border-zinc-100 dark:border-companion-dark-border space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Attached Images & Files
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {post.attachments.map((att, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl overflow-hidden border border-zinc-200 dark:border-companion-dark-border"
                >
                  {att.mimetype.startsWith('image/') ? (
                    <img
                      src={att.url}
                      alt={att.filename}
                      className="w-full h-48 object-cover hover:scale-105 transition-transform duration-200"
                    />
                  ) : (
                    <a
                      href={att.url}
                      download
                      className="p-4 bg-zinc-50 dark:bg-companion-dark-card flex items-center justify-between text-xs font-medium text-companion-lavender-600 hover:underline"
                    >
                      <span>📄 {att.filename}</span>
                      <span>Download</span>
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions Bar */}
        <div className="pt-6 border-t border-zinc-100 dark:border-companion-dark-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="w-full sm:w-auto">
            {post.chatEnabled && !isAuthor ? (
              <button
                onClick={() => {
                  if (!isAuthenticated) openAuthModal('login');
                  else setIsChatModalOpen(true);
                }}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl text-xs sm:text-sm font-semibold text-white bg-companion-lavender-500 hover:bg-companion-lavender-600 shadow-sm hover:shadow-soft-hover transition-all"
              >
                <MessageSquareHeart className="w-4 h-4" />
                <span>Request to Chat with Author</span>
              </button>
            ) : isAuthor ? (
              <span className="text-xs font-medium text-companion-lavender-600 dark:text-companion-lavender-400 bg-companion-lavender-50 dark:bg-companion-lavender-950/40 px-4 py-2 rounded-xl border border-companion-lavender-200 dark:border-companion-lavender-900/40">
                This is your shared story
              </span>
            ) : (
              <span className="text-xs text-zinc-400 flex items-center gap-1.5">
                <Lock className="w-4 h-4" />
                Author has disabled chat requests for this story
              </span>
            )}
          </div>

          {/* Social Utility Buttons */}
          <div className="flex items-center gap-2 self-end sm:self-auto text-zinc-500">
            <button
              onClick={handleToggleBookmark}
              className={`p-2.5 rounded-xl border border-zinc-200 dark:border-companion-dark-border hover:bg-zinc-50 dark:hover:bg-companion-dark-card transition-colors ${
                isBookmarked ? 'text-companion-lavender-500 border-companion-lavender-300' : ''
              }`}
              title="Bookmark story"
            >
              <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-companion-lavender-500' : ''}`} />
            </button>

            <button
              onClick={handleShare}
              className="p-2.5 rounded-xl border border-zinc-200 dark:border-companion-dark-border hover:bg-zinc-50 dark:hover:bg-companion-dark-card transition-colors"
              title="Share story link"
            >
              <Share2 className="w-4 h-4" />
            </button>

            {!isAuthor && (
              <button
                onClick={() => {
                  if (!isAuthenticated) openAuthModal('login');
                  else setIsReportModalOpen(true);
                }}
                className="p-2.5 rounded-xl border border-zinc-200 dark:border-companion-dark-border hover:bg-rose-50 dark:hover:bg-rose-950/30 text-zinc-400 hover:text-rose-500 hover:border-rose-200 transition-colors"
                title="Report story"
              >
                <Flag className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </article>

      {/* Safety Reminder Banner */}
      <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-companion-dark-card border border-zinc-200 dark:border-companion-dark-border text-center text-xs text-zinc-500 dark:text-zinc-400 flex items-center justify-center gap-2">
        <Shield className="w-4 h-4 text-companion-lavender-500 shrink-0" />
        <span>Remember: Everyone here is dealing with life's weight. Treat this story with gentleness and respect.</span>
      </div>

      {/* Modals */}
      <RequestChatModal
        isOpen={isChatModalOpen}
        onClose={() => setIsChatModalOpen(false)}
        post={post}
      />

      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        postId={post._id}
        reportedUserId={author._id}
        titleHint={post.title}
      />
    </div>
  );
};
