import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { postsApi, messagesApi } from '../services/api.js';
import { useAuth } from '../context/AuthContext.js';
import { useSocket } from '../context/SocketContext.js';
import { Avatar } from '../components/common/Avatar.js';
import { PostCategory, PostAttachment } from '../types/index.js';
import {
  Sparkles,
  Shield,
  Upload,
  X,
  Lock,
  MessageSquare,
  Save,
  CheckCircle2,
} from 'lucide-react';

const CATEGORIES: PostCategory[] = [
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

const DRAFT_KEY = 'true_companion_post_draft';

export const CreatePostPage: React.FC = () => {
  const { user, isAuthenticated, openAuthModal } = useAuth();
  const { showToast } = useSocket();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<PostCategory>('Mental Wellbeing');
  const [chatEnabled, setChatEnabled] = useState(true);
  const [attachments, setAttachments] = useState<PostAttachment[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);

  // Restore draft from localStorage
  useEffect(() => {
    try {
      const draft = localStorage.getItem(DRAFT_KEY);
      if (draft) {
        const parsed = JSON.parse(draft);
        if (parsed.title) setTitle(parsed.title);
        if (parsed.description) setDescription(parsed.description);
        if (parsed.category) setCategory(parsed.category);
        if (parsed.chatEnabled !== undefined) setChatEnabled(parsed.chatEnabled);
      }
    } catch {
      // Ignore
    }
  }, []);

  // Auto-save draft
  useEffect(() => {
    if (title || description) {
      localStorage.setItem(
        DRAFT_KEY,
        JSON.stringify({ title, description, category, chatEnabled })
      );
      setDraftSaved(true);
      const timer = setTimeout(() => setDraftSaved(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [title, description, category, chatEnabled]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      showToast('File Too Large', 'Attachments must be under 10MB.', 'warning');
      return;
    }

    setIsUploading(true);
    try {
      const data = await messagesApi.uploadAttachment(file);
      if (data.success && data.attachment) {
        setAttachments((prev) => [...prev, data.attachment]);
        showToast('Attachment Added', file.name, 'success');
      }
    } catch (err: any) {
      showToast('Upload Error', err.response?.data?.message || 'Failed to upload attachment.', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const removeAttachment = (idx: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      openAuthModal('login');
      return;
    }

    if (title.trim().length < 5) {
      showToast('Title Too Short', 'Please write a title of at least 5 characters.', 'warning');
      return;
    }

    if (description.trim().length < 15) {
      showToast('Story Too Short', 'Please describe what you are going through (at least 15 characters).', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await postsApi.createPost({
        title: title.trim(),
        description: description.trim(),
        category,
        chatEnabled,
        attachments,
      });

      if (res.success) {
        localStorage.removeItem(DRAFT_KEY);
        showToast('Story Shared Safely', 'Your story is now posted anonymously.', 'success');
        navigate(`/post/${res.post._id}`);
      }
    } catch (err: any) {
      showToast('Submission Failed', err.response?.data?.message || 'Could not post story.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-16">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            Share Your Story
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Express yourself freely in a safe harbor. Your real identity is never exposed.
          </p>
        </div>

        {draftSaved && (
          <span className="text-[11px] text-zinc-400 flex items-center gap-1 animate-pulse">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            Draft saved
          </span>
        )}
      </div>

      {/* Anonymous Identity Indicator */}
      {user && (
        <div className="p-4 rounded-2xl bg-companion-lavender-50/60 dark:bg-companion-lavender-950/20 border border-companion-lavender-200/80 dark:border-companion-lavender-900/40 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Avatar avatarId={user.avatar} size="sm" />
            <div>
              <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                Posting as {user.nickname || user.anonymousUsername}
              </p>
              <p className="text-[11px] font-mono text-zinc-400">@{user.anonymousUsername}</p>
            </div>
          </div>
          <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-900/40 flex items-center gap-1">
            <Shield className="w-3 h-3" /> Anonymous
          </span>
        </div>
      )}

      {/* Main Form */}
      <form
        onSubmit={handleSubmit}
        className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-companion-dark-surface border border-zinc-200/80 dark:border-companion-dark-border shadow-soft space-y-5"
      >
        {/* Title */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1.5">
            Post Title
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Feeling Lost About My Future, or The Silence After a Hard Day"
            className="w-full px-4 py-2.5 text-sm bg-zinc-50 dark:bg-companion-dark-card border border-zinc-200 dark:border-companion-dark-border rounded-xl focus:outline-none focus:ring-2 focus:ring-companion-lavender-400 text-zinc-800 dark:text-zinc-200"
            maxLength={120}
          />
          <div className="flex justify-end text-[11px] text-zinc-400 mt-1">
            <span>{title.length}/120</span>
          </div>
        </div>

        {/* Category */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1.5">
            Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as PostCategory)}
            className="w-full px-3.5 py-2.5 text-sm bg-zinc-50 dark:bg-companion-dark-card border border-zinc-200 dark:border-companion-dark-border rounded-xl focus:outline-none focus:ring-2 focus:ring-companion-lavender-400 text-zinc-800 dark:text-zinc-200"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Description / Story */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1.5">
            Describe What You Are Going Through
          </label>
          <textarea
            required
            rows={7}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Take your time. Describe what is on your heart without pressure. There are no judgments here..."
            className="w-full px-4 py-3 text-sm bg-zinc-50 dark:bg-companion-dark-card border border-zinc-200 dark:border-companion-dark-border rounded-xl focus:outline-none focus:ring-2 focus:ring-companion-lavender-400 text-zinc-800 dark:text-zinc-200 leading-relaxed placeholder-zinc-400"
            maxLength={3000}
          />
          <div className="flex justify-between items-center text-[11px] text-zinc-400 mt-1">
            <span>Minimum 15 characters</span>
            <span>{description.length}/3000</span>
          </div>
        </div>

        {/* Optional Attachments */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1.5">
            Attach Images or Documents (Optional)
          </label>
          <div className="flex items-center gap-3">
            <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium border border-zinc-200 dark:border-companion-dark-border bg-zinc-50 dark:bg-companion-dark-card hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition-colors">
              <Upload className="w-3.5 h-3.5" />
              <span>{isUploading ? 'Uploading...' : 'Choose File'}</span>
              <input
                type="file"
                accept="image/*,.pdf,.txt"
                onChange={handleFileUpload}
                disabled={isUploading}
                className="hidden"
              />
            </label>
            <span className="text-[11px] text-zinc-400">Max 10MB (JPG, PNG, PDF, TXT)</span>
          </div>

          {/* Attachment Chips */}
          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {attachments.map((att, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-companion-dark-card border border-zinc-200 dark:border-companion-dark-border text-xs text-zinc-700 dark:text-zinc-300"
                >
                  <span className="truncate max-w-[150px]">{att.filename}</span>
                  <button
                    type="button"
                    onClick={() => removeAttachment(i)}
                    className="text-zinc-400 hover:text-rose-500"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Chat Request Toggle */}
        <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-companion-dark-card border border-zinc-200/80 dark:border-companion-dark-border flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-companion-lavender-500" />
              Allow Private Chat Requests
            </span>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
              When enabled, companions who read your story can request a private 1-on-1 chat.
            </p>
          </div>
          <input
            type="checkbox"
            checked={chatEnabled}
            onChange={(e) => setChatEnabled(e.target.checked)}
            className="w-4 h-4 rounded text-companion-lavender-500 focus:ring-companion-lavender-400 cursor-pointer"
          />
        </div>

        {/* Submit Action */}
        <div className="pt-3 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-4 py-2.5 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || isUploading}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-companion-lavender-500 hover:bg-companion-lavender-600 shadow-sm hover:shadow-soft-hover transition-all disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isSubmitting ? 'Publishing...' : 'Share Anonymously'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
