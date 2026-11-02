import React from 'react';
import { Link } from 'react-router-dom';
import { Post } from '../../types/index.js';
import { Avatar } from '../common/Avatar.js';
import { useAuth } from '../../context/AuthContext.js';
import {
  MessageSquareHeart,
  Bookmark,
  Flag,
  Share2,
  Calendar,
  Lock,
} from 'lucide-react';

interface PostCardProps {
  post: Post;
  onRequestChat: (post: Post) => void;
  onReport: (post: Post) => void;
  onToggleBookmark?: (postId: string) => void;
  isBookmarked?: boolean;
}

const CATEGORY_COLORS: Record<string, string> = {
  'Mental Wellbeing': 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900/40',
  'Loneliness': 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900/40',
  'Relationship Issues': 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900/40',
  'Academic Pressure': 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900/40',
  'Career Confusion': 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-900/40',
  'Family Problems': 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-900/40',
  'Personal Struggles': 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-900/40',
  'Motivation': 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-900/40',
  'Other': 'bg-zinc-50 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700',
};

export const PostCard: React.FC<PostCardProps> = ({
  post,
  onRequestChat,
  onReport,
  onToggleBookmark,
  isBookmarked = false,
}) => {
  const { user, isAuthenticated, openAuthModal } = useAuth();

  const author = post.authorId || {
    _id: '',
    anonymousUsername: 'Anonymous',
    nickname: '',
    avatar: 'avatar-1',
  };

  const isAuthor = user && user._id === author._id;

  const categoryStyle =
    CATEGORY_COLORS[post.category] ||
    'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200';

  const formattedDate = new Date(post.createdAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const handleRequestClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      openAuthModal('login');
      return;
    }
    onRequestChat(post);
  };

  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      openAuthModal('login');
      return;
    }
    if (onToggleBookmark) onToggleBookmark(post._id);
  };

  const handleReportClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      openAuthModal('login');
      return;
    }
    onReport(post);
  };

  return (
    <article className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-companion-dark-surface border border-zinc-200/80 dark:border-companion-dark-border shadow-soft hover:shadow-card transition-all duration-200 flex flex-col justify-between">
      <div>
        {/* Post Card Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <Avatar avatarId={author.avatar} size="md" />
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                  {author.nickname || author.anonymousUsername}
                </span>
                <span className="text-[11px] font-mono text-zinc-400 dark:text-zinc-500">
                  @{author.anonymousUsername}
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-zinc-400 mt-0.5">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {formattedDate}
                </span>
              </div>
            </div>
          </div>

          {/* Category Pill */}
          <span
            className={`px-3 py-1 rounded-full text-[11px] font-medium border shrink-0 ${categoryStyle}`}
          >
            {post.category}
          </span>
        </div>

        {/* Post Title & Description */}
        <Link to={`/post/${post._id}`} className="group block">
          <h3 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-companion-lavender-600 dark:group-hover:text-companion-lavender-400 transition-colors leading-snug">
            {post.title}
          </h3>
          <p className="mt-2 text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 line-clamp-3 leading-relaxed whitespace-pre-line">
            {post.description}
          </p>
        </Link>

        {/* Optional Attachments / Images Preview */}
        {post.attachments && post.attachments.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {post.attachments.map((att, idx) => (
              <div
                key={idx}
                className="relative rounded-xl overflow-hidden border border-zinc-200 dark:border-companion-dark-border max-w-[200px] max-h-[140px]"
              >
                {att.mimetype.startsWith('image/') ? (
                  <img
                    src={att.url}
                    alt={att.filename}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="p-3 bg-zinc-50 dark:bg-companion-dark-card text-xs text-zinc-600 dark:text-zinc-300">
                    📄 {att.filename}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Card Actions Footer */}
      <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-companion-dark-border flex items-center justify-between gap-3">
        {/* Request to chat action */}
        {post.chatEnabled && !isAuthor ? (
          <button
            onClick={handleRequestClick}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-companion-lavender-500 hover:bg-companion-lavender-600 shadow-sm hover:shadow-soft-hover transition-all"
          >
            <MessageSquareHeart className="w-4 h-4" />
            <span>Request to Chat</span>
          </button>
        ) : isAuthor ? (
          <span className="text-[11px] font-medium text-companion-lavender-600 dark:text-companion-lavender-400 bg-companion-lavender-50 dark:bg-companion-lavender-950/40 px-3 py-1.5 rounded-xl border border-companion-lavender-200 dark:border-companion-lavender-900/40">
            Your Story
          </span>
        ) : (
          <span className="text-xs text-zinc-400 flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5" />
            Chat requests disabled
          </span>
        )}

        {/* Utility buttons (Bookmark & Report) */}
        <div className="flex items-center gap-1.5 text-zinc-400">
          {onToggleBookmark && (
            <button
              onClick={handleBookmarkClick}
              className={`p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-companion-dark-card transition-colors ${
                isBookmarked ? 'text-companion-lavender-500' : 'hover:text-zinc-600 dark:hover:text-zinc-200'
              }`}
              title={isBookmarked ? 'Remove bookmark' : 'Save bookmark'}
              aria-label="Bookmark post"
            >
              <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-companion-lavender-500' : ''}`} />
            </button>
          )}

          {!isAuthor && (
            <button
              onClick={handleReportClick}
              className="p-2 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/30 text-zinc-400 hover:text-rose-500 transition-colors"
              title="Report post"
              aria-label="Report post"
            >
              <Flag className="w-4 h-4" />
            </button>
          )}

          <Link
            to={`/post/${post._id}`}
            className="text-xs font-semibold text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 px-2 py-1"
          >
            Read More →
          </Link>
        </div>
      </div>
    </article>
  );
};
