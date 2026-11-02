import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { postsApi } from '../services/api.js';
import { Post, PostCategory } from '../types/index.js';
import { PostCard } from '../components/posts/PostCard.js';
import { RequestChatModal } from '../components/common/RequestChatModal.js';
import { ReportModal } from '../components/common/ReportModal.js';
import { useAuth } from '../context/AuthContext.js';
import { useSocket } from '../context/SocketContext.js';
import {
  Search,
  Filter,
  Sparkles,
  HeartHandshake,
  PlusCircle,
  RefreshCw,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const CATEGORIES = [
  'All',
  'Mental Wellbeing',
  'Loneliness',
  'Relationship Issues',
  'Academic Pressure',
  'Career Confusion',
  'Family Problems',
  'Personal Struggles',
  'Motivation',
  'Other',
];

export const DashboardPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'All';

  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');
  const [posts, setPosts] = useState<Post[]>([]);
  const [totalPosts, setTotalPosts] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Modals state
  const [selectedPostForChat, setSelectedPostForChat] = useState<Post | null>(null);
  const [selectedPostForReport, setSelectedPostForReport] = useState<Post | null>(null);

  const { user } = useAuth();
  const { showToast } = useSocket();

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Sync category from URL
  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat && cat !== selectedCategory) {
      setSelectedCategory(cat);
      setPage(1);
    }
  }, [searchParams]);

  const fetchPosts = async () => {
    setIsLoading(true);
    try {
      const data = await postsApi.getPosts({
        category: selectedCategory === 'All' ? undefined : selectedCategory,
        search: debouncedSearch || undefined,
        page,
        limit: 10,
      });
      if (data.success) {
        setPosts(data.posts);
        setTotalPosts(data.total);
        setTotalPages(data.totalPages);
      }
    } catch (err) {
      console.error('Error fetching posts:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [selectedCategory, debouncedSearch, page]);

  const handleCategorySelect = (cat: string) => {
    setSelectedCategory(cat);
    setPage(1);
    if (cat === 'All') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', cat);
    }
    setSearchParams(searchParams);
  };

  const handleToggleBookmark = async (postId: string) => {
    try {
      const res = await postsApi.toggleBookmark(postId);
      if (res.success) {
        showToast(
          res.bookmarked ? 'Bookmark Saved' : 'Bookmark Removed',
          res.message,
          'info'
        );
        if (user) {
          user.bookmarks = res.bookmarks;
        }
      }
    } catch (err: any) {
      showToast('Notice', err.response?.data?.message || 'Could not update bookmark', 'warning');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-companion-lavender-100/70 via-white to-companion-blue-50/70 dark:from-companion-lavender-950/30 dark:via-companion-dark-surface dark:to-companion-dark-card border border-zinc-200/80 dark:border-companion-dark-border shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-companion-lavender-600 dark:text-companion-lavender-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-companion-lavender-500" />
            Empathy & Peer Support Feed
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-50 mt-1">
            {user
              ? `Welcome, ${user.nickname || user.anonymousUsername}`
              : "You're in a Safe Sanctuary"}
          </h1>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 max-w-md leading-relaxed">
            Read heartfelt stories from anonymous companions or request a 1-on-1 private conversation to listen and support.
          </p>
        </div>

        <Link
          to="/create"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-semibold text-white bg-companion-lavender-500 hover:bg-companion-lavender-600 shadow-sm hover:shadow-soft-hover transition-all shrink-0 self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Share a Story</span>
        </Link>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search stories by keyword (e.g. anxiety, burnout, college, relationship)..."
            className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-white dark:bg-companion-dark-surface border border-zinc-200 dark:border-companion-dark-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-companion-lavender-400 text-zinc-800 dark:text-zinc-200 shadow-sm placeholder-zinc-400 transition-colors"
          />
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategorySelect(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-companion-lavender-500 text-white shadow-sm'
                  : 'bg-white dark:bg-companion-dark-surface text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-companion-dark-border hover:border-companion-lavender-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Post List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="p-6 rounded-3xl bg-white dark:bg-companion-dark-surface border border-zinc-200 dark:border-companion-dark-border animate-pulse space-y-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-zinc-200 dark:bg-zinc-800" />
                  <div className="space-y-1.5">
                    <div className="w-28 h-3.5 bg-zinc-200 dark:bg-zinc-800 rounded" />
                    <div className="w-20 h-2.5 bg-zinc-200 dark:bg-zinc-800 rounded" />
                  </div>
                </div>
                <div className="w-3/4 h-5 bg-zinc-200 dark:bg-zinc-800 rounded mt-4" />
                <div className="w-full h-3 bg-zinc-200 dark:bg-zinc-800 rounded" />
                <div className="w-5/6 h-3 bg-zinc-200 dark:bg-zinc-800 rounded" />
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-white dark:bg-companion-dark-surface border border-zinc-200 dark:border-companion-dark-border shadow-sm space-y-3">
            <HeartHandshake className="w-10 h-10 text-companion-lavender-400 mx-auto opacity-70" />
            <h3 className="text-base font-semibold text-zinc-800 dark:text-zinc-200">
              No Stories Found
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
              There are currently no active stories matching this filter. Be the first to share your thoughts anonymously.
            </p>
            <div className="pt-2">
              <Link
                to="/create"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-companion-lavender-500 hover:bg-companion-lavender-600 rounded-xl shadow-sm transition-all"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                Share Your Story
              </Link>
            </div>
          </div>
        ) : (
          posts.map((post) => {
            const isBookmarked = user?.bookmarks?.includes(post._id) || false;
            return (
              <PostCard
                key={post._id}
                post={post}
                isBookmarked={isBookmarked}
                onToggleBookmark={handleToggleBookmark}
                onRequestChat={(p) => setSelectedPostForChat(p)}
                onReport={(p) => setSelectedPostForReport(p)}
              />
            );
          })
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 rounded-xl text-xs font-medium border border-zinc-200 dark:border-companion-dark-border bg-white dark:bg-companion-dark-surface text-zinc-700 dark:text-zinc-300 disabled:opacity-40 hover:bg-zinc-50 dark:hover:bg-companion-dark-card transition-colors"
          >
            ← Previous
          </button>
          <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
            Page {page} of {totalPages} ({totalPosts} stories)
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 rounded-xl text-xs font-medium border border-zinc-200 dark:border-companion-dark-border bg-white dark:bg-companion-dark-surface text-zinc-700 dark:text-zinc-300 disabled:opacity-40 hover:bg-zinc-50 dark:hover:bg-companion-dark-card transition-colors"
          >
            Next →
          </button>
        </div>
      )}

      {/* Modals */}
      <RequestChatModal
        isOpen={!!selectedPostForChat}
        onClose={() => setSelectedPostForChat(null)}
        post={selectedPostForChat}
      />

      <ReportModal
        isOpen={!!selectedPostForReport}
        onClose={() => setSelectedPostForReport(null)}
        postId={selectedPostForReport?._id}
        reportedUserId={
          selectedPostForReport?.authorId && typeof selectedPostForReport.authorId === 'object'
            ? selectedPostForReport.authorId._id
            : undefined
        }
        titleHint={selectedPostForReport?.title}
      />
    </div>
  );
};
