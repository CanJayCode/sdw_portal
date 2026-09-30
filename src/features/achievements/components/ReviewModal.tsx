import { useState, type FormEvent } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  approveAchievement,
  overrideAchievement,
  rejectAchievement,
  resubmitEvidence,
  reviewAchievement,
} from '../api';
import type { Achievement } from '../types';

export type ReviewModalType =
  | 'DOC_REVIEW'
  | 'SECRETARY_APPROVE'
  | 'SECRETARY_REJECT'
  | 'SECRETARY_OVERRIDE'
  | 'RESUBMIT_EVIDENCE'
  | null;

interface ReviewModalProps {
  type: ReviewModalType;
  achievement: Achievement | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  type,
  achievement,
  isOpen,
  onClose,
}) => {
  const queryClient = useQueryClient();

  // Doc review state
  const [docAction, setDocAction] = useState<'APPROVE' | 'REQUEST_EVIDENCE' | 'REJECT'>('APPROVE');
  const [docNotes, setDocNotes] = useState('');

  // Rejection / Override reason
  const [reason, setReason] = useState('');

  // Resubmit evidence state
  const [evidenceUrls, setEvidenceUrls] = useState<string[]>(['']);
  const [resubmitNotes, setResubmitNotes] = useState('');

  // Error feedback
  const [formError, setFormError] = useState<string | null>(null);

  // Invalidate queries helper
  const handleSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['achievements'] });
    onClose();
    resetForm();
  };

  const resetForm = () => {
    setDocAction('APPROVE');
    setDocNotes('');
    setReason('');
    setEvidenceUrls(['']);
    setResubmitNotes('');
    setFormError(null);
  };

  // Mutations
  const docReviewMutation = useMutation({
    mutationFn: ({ id, action, notes }: { id: string; action: 'APPROVE' | 'REQUEST_EVIDENCE' | 'REJECT'; notes: string }) =>
      reviewAchievement(id, { action, notes }),
    onSuccess: handleSuccess,
    onError: (err: any) => {
      setFormError(err?.response?.data?.message || 'Failed to submit documentation review');
    },
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => approveAchievement(id),
    onSuccess: handleSuccess,
    onError: (err: any) => {
      setFormError(err?.response?.data?.message || 'Failed to approve achievement');
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reasonText }: { id: string; reasonText: string }) =>
      rejectAchievement(id, reasonText),
    onSuccess: handleSuccess,
    onError: (err: any) => {
      setFormError(err?.response?.data?.message || 'Failed to reject achievement');
    },
  });

  const overrideMutation = useMutation({
    mutationFn: ({ id, reasonText }: { id: string; reasonText: string }) =>
      overrideAchievement(id, reasonText),
    onSuccess: handleSuccess,
    onError: (err: any) => {
      setFormError(err?.response?.data?.message || 'Failed to apply secretary override');
    },
  });

  const resubmitMutation = useMutation({
    mutationFn: ({ id, urls, notes }: { id: string; urls: string[]; notes: string }) =>
      resubmitEvidence(id, { evidenceUrls: urls, notes }),
    onSuccess: handleSuccess,
    onError: (err: any) => {
      setFormError(err?.response?.data?.message || 'Failed to resubmit evidence');
    },
  });

  if (!isOpen || !achievement) return null;

  const isPending =
    docReviewMutation.isPending ||
    approveMutation.isPending ||
    rejectMutation.isPending ||
    overrideMutation.isPending ||
    resubmitMutation.isPending;

  // Submit Handler
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (type === 'DOC_REVIEW') {
      if (!docNotes.trim()) {
        setFormError('Reviewer notes are required.');
        return;
      }
      docReviewMutation.mutate({ id: achievement._id, action: docAction, notes: docNotes });
    } else if (type === 'SECRETARY_APPROVE') {
      approveMutation.mutate(achievement._id);
    } else if (type === 'SECRETARY_REJECT') {
      if (!reason.trim()) {
        setFormError('Rejection reason is required.');
        return;
      }
      rejectMutation.mutate({ id: achievement._id, reasonText: reason });
    } else if (type === 'SECRETARY_OVERRIDE') {
      if (!reason.trim()) {
        setFormError('Reason for override is required.');
        return;
      }
      overrideMutation.mutate({ id: achievement._id, reasonText: reason });
    } else if (type === 'RESUBMIT_EVIDENCE') {
      const validUrls = evidenceUrls.filter((u) => u.trim().length > 0);
      if (validUrls.length === 0) {
        setFormError('At least one valid evidence URL is required.');
        return;
      }
      resubmitMutation.mutate({
        id: achievement._id,
        urls: validUrls,
        notes: resubmitNotes,
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b pb-3">
          <h2 className="text-lg font-bold text-gray-900">
            {type === 'DOC_REVIEW' && 'Review Evidence (Documentation Member)'}
            {type === 'SECRETARY_APPROVE' && 'Authenticate Achievement (Secretary)'}
            {type === 'SECRETARY_REJECT' && 'Reject Achievement (Secretary)'}
            {type === 'SECRETARY_OVERRIDE' && 'Secretary Override'}
            {type === 'RESUBMIT_EVIDENCE' && 'Resubmit Supporting Evidence'}
          </h2>
          <button
            type="button"
            onClick={() => {
              resetForm();
              onClose();
            }}
            className="text-gray-400 hover:text-gray-600 text-lg"
          >
            ✕
          </button>
        </div>

        <div className="mt-4 rounded-lg bg-gray-50 p-3 text-sm">
          <p className="font-semibold text-gray-800">{achievement.title}</p>
          <p className="text-xs text-gray-600 mt-1">{achievement.description}</p>
          <div className="mt-2 flex items-center gap-3 text-xs text-gray-500">
            <span>Points: <strong className="text-gray-800">{achievement.points}</strong></span>
            <span>Status: <strong className="text-gray-800">{achievement.status.replaceAll('_', ' ')}</strong></span>
          </div>
        </div>

        {formError && (
          <div className="mt-3 rounded-md bg-rose-50 border border-rose-200 p-2 text-xs text-rose-700">
            {formError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Documentation Member Action */}
          {type === 'DOC_REVIEW' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Review Decision
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setDocAction('APPROVE')}
                    className={`rounded-lg border px-3 py-2 text-xs font-semibold ${
                      docAction === 'APPROVE'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-700 ring-2 ring-emerald-500'
                        : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    onClick={() => setDocAction('REQUEST_EVIDENCE')}
                    className={`rounded-lg border px-3 py-2 text-xs font-semibold ${
                      docAction === 'REQUEST_EVIDENCE'
                        ? 'border-amber-600 bg-amber-50 text-amber-700 ring-2 ring-amber-500'
                        : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Request Evidence
                  </button>
                  <button
                    type="button"
                    onClick={() => setDocAction('REJECT')}
                    className={`rounded-lg border px-3 py-2 text-xs font-semibold ${
                      docAction === 'REJECT'
                        ? 'border-rose-600 bg-rose-50 text-rose-700 ring-2 ring-rose-500'
                        : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Reject
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reviewer Notes <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={docNotes}
                  onChange={(e) => setDocNotes(e.target.value)}
                  placeholder="State certificate verification details or specify missing evidence..."
                  className="w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:border-brand-500 focus:outline-none"
                  required
                />
              </div>
            </>
          )}

          {/* Secretary Approve Confirmation */}
          {type === 'SECRETARY_APPROVE' && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
              <p className="font-semibold">Confirm Final Secretary Authentication</p>
              <p className="mt-1 text-xs text-emerald-700">
                Approving this achievement will authenticate it and immediately credit{' '}
                <strong>{achievement.points} points</strong> to the student on the CESA Leaderboard for the active semester.
              </p>
            </div>
          )}

          {/* Secretary Reject */}
          {type === 'SECRETARY_REJECT' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rejection Reason <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Explain why this achievement is rejected (e.g. Duplicate submission, invalid criteria)..."
                className="w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:border-brand-500 focus:outline-none"
                required
              />
            </div>
          )}

          {/* Secretary Override */}
          {type === 'SECRETARY_OVERRIDE' && (
            <div>
              <div className="mb-3 rounded-lg border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900">
                <strong>Administrative Override:</strong> Overriding an authenticated achievement will reverse points from the student&apos;s CESA Leaderboard tally and record an audit log entry.
              </div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reason for Override <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Detailed reason for overriding approval..."
                className="w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:border-brand-500 focus:outline-none"
                required
              />
            </div>
          )}

          {/* Resubmit Evidence */}
          {type === 'RESUBMIT_EVIDENCE' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Updated Evidence URLs <span className="text-rose-500">*</span>
                </label>
                {evidenceUrls.map((url, idx) => (
                  <div key={idx} className="mb-2 flex items-center gap-2">
                    <input
                      type="url"
                      value={url}
                      onChange={(e) => {
                        const newUrls = [...evidenceUrls];
                        newUrls[idx] = e.target.value;
                        setEvidenceUrls(newUrls);
                      }}
                      placeholder="https://storage.institution.edu/..."
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
                      required
                    />
                    {evidenceUrls.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setEvidenceUrls(evidenceUrls.filter((_, i) => i !== idx))}
                        className="text-xs text-rose-600 hover:text-rose-800"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setEvidenceUrls([...evidenceUrls, ''])}
                  className="text-xs font-semibold text-brand-600 hover:text-brand-800"
                >
                  + Add another URL
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes / Clarification for Reviewer
                </label>
                <textarea
                  rows={2}
                  value={resubmitNotes}
                  onChange={(e) => setResubmitNotes(e.target.value)}
                  placeholder="Explain the new evidence uploaded..."
                  className="w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:border-brand-500 focus:outline-none"
                />
              </div>
            </>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t">
            <button
              type="button"
              onClick={() => {
                resetForm();
                onClose();
              }}
              disabled={isPending}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
            >
              {isPending ? 'Processing...' : 'Confirm'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
