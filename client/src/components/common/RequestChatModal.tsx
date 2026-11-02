import React, { useState } from 'react';
import { Modal } from './Modal.js';
import { chatRequestsApi } from '../../services/api.js';
import { useSocket } from '../../context/SocketContext.js';
import { MessageSquareHeart, HeartHandshake } from 'lucide-react';
import { Post } from '../../types/index.js';

interface RequestChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: Post | null;
  onSuccess?: () => void;
}

export const RequestChatModal: React.FC<RequestChatModalProps> = ({
  isOpen,
  onClose,
  post,
  onSuccess,
}) => {
  const [introMessage, setIntroMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useSocket();

  if (!post) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const data = await chatRequestsApi.create({
        postId: post._id,
        receiverId: post.authorId._id,
        introductionMessage: introMessage.trim(),
      });
      if (data.success) {
        showToast(
          'Chat Request Sent',
          `Your request was sent to ${post.authorId.nickname || post.authorId.anonymousUsername}. You'll be notified when they accept.`,
          'success'
        );
        setIntroMessage('');
        onClose();
        if (onSuccess) onSuccess();
      }
    } catch (err: any) {
      showToast(
        'Request Notice',
        err.response?.data?.message || 'Could not send chat request.',
        'warning'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Request a Private Conversation">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="p-3.5 bg-companion-lavender-50 dark:bg-companion-lavender-950/30 border border-companion-lavender-200 dark:border-companion-lavender-900/40 rounded-xl flex items-start gap-3">
          <HeartHandshake className="w-5 h-5 text-companion-lavender-500 shrink-0 mt-0.5" />
          <div className="text-xs text-companion-charcoal dark:text-zinc-300 leading-relaxed">
            You are requesting to connect with <strong>{post.authorId.nickname || post.authorId.anonymousUsername}</strong> regarding their story:
            <p className="mt-1 font-medium text-companion-lavender-600 dark:text-companion-lavender-300 line-clamp-1 italic">
              "{post.title}"
            </p>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1.5">
            Introductory Message (Optional)
          </label>
          <textarea
            rows={3}
            value={introMessage}
            onChange={(e) => setIntroMessage(e.target.value)}
            placeholder="Introduce yourself gently, share what resonated with you, or let them know you are here to listen..."
            className="w-full px-3.5 py-2.5 text-sm bg-zinc-50 dark:bg-companion-dark-card border border-zinc-200 dark:border-companion-dark-border rounded-xl focus:outline-none focus:ring-2 focus:ring-companion-lavender-400 text-zinc-800 dark:text-zinc-200 placeholder-zinc-400 leading-relaxed"
            maxLength={400}
          />
          <div className="flex justify-between items-center mt-1 text-[11px] text-zinc-400">
            <span>Kindness and respect build safe spaces.</span>
            <span>{introMessage.length}/400</span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-companion-lavender-500 hover:bg-companion-lavender-600 rounded-xl transition-all shadow-sm hover:shadow-soft-hover disabled:opacity-50"
          >
            <MessageSquareHeart className="w-4 h-4" />
            {isSubmitting ? 'Sending...' : 'Send Request'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
