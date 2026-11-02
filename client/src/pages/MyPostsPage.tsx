import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { postsApi } from '../services/api.js';
import { Post } from '../types/index.js';
import { useAuth } from '../context/AuthContext.js';
import { useSocket } from '../context/SocketContext.js';
import {
  FileText,
  PlusCircle,
  Trash2,
  Eye,
  Calendar,
  Lock,
  MessageSquare,
} from 'lucide-react';

export const MyPostsPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useSocket();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMyPosts = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const res = await postsApi.getPosts({ authorId: user._id, limit: 50 });
      if (res.success) {
        setPosts(res.posts);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMyPosts();
  }, [user]);

  const handleDelete = async (postId: string, title: string) => {
    if (!window.confirm(`Delete story: "${title}"?`)) return;
    try {
      const res = await postsApi.deletePost(postId);
      if (res.success) {
        showToast('Story Deleted', 'Your story has been removed.', 'info');
        setPosts((prev) => prev.filter((p) => p._id !== postId));
      }
    } catch (err: any) {
      showToast('Error', err.response?.data?.message || 'Could not delete story.', 'error');
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-16">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            My Shared Stories
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Review and manage the anonymous experiences you have shared with the community.
          </p>
        </div>

        <Link
          to="/create"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-companion-lavender-500 hover:bg-companion-lavender-600 transition-all shadow-sm"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Story</span>
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-3 animate-pulse">
          <div className="p-6 rounded-2xl bg-zinc-100 dark:bg-companion-dark-card h-28" />
          <div className="p-6 rounded-2xl bg-zinc-100 dark:bg-companion-dark-card h-28" />
        </div>
      ) : posts.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-companion-dark-surface border border-zinc-200 dark:border-companion-dark-border space-y-3">
          <FileText className="w-10 h-10 text-zinc-300 mx-auto" />
          <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
            You Haven't Shared Any Stories Yet
          </h3>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto">
            Take a moment to write down what you are carrying. Someone is here to listen.
          </p>
          <div className="pt-2">
            <Link
              to="/create"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-companion-lavender-500 hover:bg-companion-lavender-600 transition-all shadow-sm"
            >
              <PlusCircle className="w-4 h-4" />
              Write First Story
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <div
              key={post._id}
              className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-companion-dark-surface border border-zinc-200/80 dark:border-companion-dark-border shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-companion-lavender-50 text-companion-lavender-700 dark:bg-companion-lavender-950/40 dark:text-companion-lavender-300 border border-companion-lavender-200 dark:border-companion-lavender-900/40">
                    {post.category}
                  </span>
                  <span className="text-[11px] text-zinc-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(post.createdAt).toLocaleDateString()}
                  </span>
                  {post.viewsCount !== undefined && (
                    <span className="text-[11px] text-zinc-400 flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {post.viewsCount} readers
                    </span>
                  )}
                </div>

                <Link
                  to={`/post/${post._id}`}
                  className="block text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100 hover:text-companion-lavender-600 dark:hover:text-companion-lavender-400 transition-colors truncate"
                >
                  {post.title}
                </Link>

                <p className="text-xs text-zinc-500 line-clamp-1">{post.description}</p>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                <Link
                  to={`/post/${post._id}`}
                  className="px-3 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:text-companion-lavender-600 bg-zinc-50 dark:bg-companion-dark-card hover:bg-zinc-100 rounded-xl transition-colors"
                >
                  View Story
                </Link>
                <button
                  onClick={() => handleDelete(post._id, post.title)}
                  className="p-2 text-zinc-400 hover:text-rose-500 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                  title="Delete story"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
