import React, { useState } from 'react';
import { Modal } from './Modal.js';
import { reportsApi } from '../../services/api.js';
import { useSocket } from '../../context/SocketContext.js';
import { ReportReason } from '../../types/index.js';
import { ShieldAlert, AlertTriangle } from 'lucide-react';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  postId?: string;
  reportedUserId?: string;
  messageId?: string;
  titleHint?: string;
}

const REPORT_REASONS: ReportReason[] = [
  'Inappropriate messages',
  'Harassment',
  'Bullying',
  'Threats',
  'Spam',
  'Fake accounts',
  'Scams',
  'Inappropriate images',
  'Suspicious behaviour',
  'Immediate danger / self-harm concern',
  'Other',
];

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  postId,
  reportedUserId,
  messageId,
  titleHint,
}) => {
  const [reason, setReason] = useState<ReportReason>('Harassment');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useSocket();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const data = await reportsApi.create({
        reason,
        description,
        postId,
        reportedUserId,
        messageId,
      });
      if (data.success) {
        showToast(
          'Report Received',
          'Thank you. Our moderation team has been notified and will review this content.',
          'success'
        );
        setDescription('');
        onClose();
      }
    } catch (err: any) {
      showToast('Error', err.response?.data?.message || 'Failed to submit report', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Report to Moderation Team">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-start gap-3 p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 rounded-xl">
          <ShieldAlert className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
          <p className="text-xs text-rose-700 dark:text-rose-300 leading-relaxed">
            Your safety and emotional wellbeing are our highest priority. All reports are strictly anonymous and reviewed confidentially by human moderators.
          </p>
        </div>

        {titleHint && (
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Reporting: <span className="font-semibold text-zinc-700 dark:text-zinc-200">{titleHint}</span>
          </p>
        )}

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1.5">
            Reason for Report
          </label>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value as ReportReason)}
            className="w-full px-3 py-2 text-sm bg-zinc-50 dark:bg-companion-dark-card border border-zinc-200 dark:border-companion-dark-border rounded-xl focus:outline-none focus:ring-2 focus:ring-companion-lavender-400 text-zinc-800 dark:text-zinc-200"
          >
            {REPORT_REASONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        {reason === 'Immediate danger / self-harm concern' && (
          <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-xl flex items-start gap-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-800 dark:text-amber-200 leading-relaxed">
              If someone is in immediate physical danger, please contact national emergency services (in India, dial <strong>112</strong> or <strong>14416</strong> for Tele-MANAS). True Companion cannot replace emergency first-responders.
            </p>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1.5">
            Additional Details (Optional)
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Help our moderation team understand the context..."
            className="w-full px-3 py-2 text-sm bg-zinc-50 dark:bg-companion-dark-card border border-zinc-200 dark:border-companion-dark-border rounded-xl focus:outline-none focus:ring-2 focus:ring-companion-lavender-400 text-zinc-800 dark:text-zinc-200 placeholder-zinc-400"
            maxLength={1000}
          />
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
            className="px-5 py-2 text-sm font-medium text-white bg-rose-500 hover:bg-rose-600 rounded-xl transition-colors shadow-sm disabled:opacity-50"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Report'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
