import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getReviewQueue } from '../api';
import { ReviewCard } from '../components/ReviewCard';
import { ReviewModal, type ReviewModalType } from '../components/ReviewModal';
import { AchievementDetailPage } from './AchievementDetailPage';
import { ErrorMessage, Spinner } from '@/components/ui/Feedback';
import { useAuthStore } from '@/store/auth';
import { isDocMember, isSecretary, isCesaAdmin } from '@/lib/permissions';
import type { Achievement, AchievementStatus } from '../types';

export const AchievementReviewPage: React.FC = () => {
  const { auth } = useAuthStore();

  const [selectedStatus, setSelectedStatus] = useState<AchievementStatus | ''>('');
  const [assignedToMe, setAssignedToMe] = useState(false);
  const [page, setPage] = useState(1);
  const limit = 10;

  // Selected item for modal or detail view
  const [modalType, setModalType] = useState<ReviewModalType>(null);
  const [activeAchievement, setActiveAchievement] = useState<Achievement | null>(null);
  const [inspectingAchievement, setInspectingAchievement] = useState<Achievement | null>(null);

  const canDocReview = isDocMember(auth) || isCesaAdmin(auth);
  const canSecretaryApprove = isSecretary(auth) || isCesaAdmin(auth);
  const hasReviewAccess = canDocReview || canSecretaryApprove;

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['reviewQueue', { status: selectedStatus, assignedToMe, page, limit }],
    queryFn: () =>
      getReviewQueue({
        status: selectedStatus || undefined,
        assignedToMe: assignedToMe || undefined,
        page,
        limit,
      }),
    enabled: hasReviewAccess,
  });

  if (!hasReviewAccess) {
    return (
      <div className="mx-auto max-w-2xl py-12 text-center">
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-8">
          <h2 className="text-xl font-bold text-amber-900">Review Queue Access Restricted</h2>
          <p className="mt-2 text-sm text-amber-800">
            The documentation review and secretary approval queues are accessible only by designated ACM Documentation Members, CESA Secretaries, and CESA Administrators.
          </p>
        </div>
      </div>
    );
  }

  if (inspectingAchievement) {
    return (
      <AchievementDetailPage
        achievement={inspectingAchievement}
        onBack={() => setInspectingAchievement(null)}
      />
    );
  }

  const handleOpenModal = (type: ReviewModalType, ach: Achievement) => {
    setActiveAchievement(ach);
    setModalType(type);
  };

  return (
    <div className="py-4 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Achievement Review Queue</h1>
          <p className="text-sm text-gray-600">
            Verify student proof of achievements, request clarifying evidence, or grant official institutional endorsement.
          </p>
        </div>

        <button
          type="button"
          onClick={() => refetch()}
          className="self-start sm:self-auto rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 shadow-sm"
        >
          ↻ Refresh Queue
        </button>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Queue Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value as AchievementStatus | '');
                setPage(1);
              }}
              className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-700 focus:border-brand-500 focus:outline-none"
            >
              <option value="">All Statuses</option>
              <option value="PENDING_DOCUMENTATION_REVIEW">Pending Doc Review</option>
              <option value="PENDING_SECRETARY_APPROVAL">Pending Secretary Approval</option>
              <option value="EVIDENCE_REQUESTED">Evidence Requested</option>
              <option value="AUTHENTICATED">Authenticated (Approved)</option>
              <option value="REJECTED_BY_DOCUMENTATION">Rejected by Doc</option>
              <option value="REJECTED_BY_SECRETARY">Rejected by Secretary</option>
            </select>
          </div>

          {canDocReview && (
            <div className="flex items-center gap-2 pt-4 sm:pt-0">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-gray-700">
                <input
                  type="checkbox"
                  checked={assignedToMe}
                  onChange={(e) => {
                    setAssignedToMe(e.target.checked);
                    setPage(1);
                  }}
                  className="rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                />
                Only assigned to me (Round-Robin)
              </label>
            </div>
          )}
        </div>

        <div className="text-xs text-gray-500">
          Total items: <strong className="text-gray-800">{data?.meta?.total ?? 0}</strong>
        </div>
      </div>

      {/* Queue Listing */}
      {isLoading ? (
        <Spinner />
      ) : isError ? (
        <ErrorMessage message="Failed to load review queue. Please check your internet connection or login status." />
      ) : data?.achievements.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center">
          <p className="font-semibold text-gray-800">Review queue is empty</p>
          <p className="mt-1 text-xs text-gray-500">
            There are currently no achievements matching the selected criteria.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {data?.achievements.map((item) => (
            <ReviewCard
              key={item._id}
              achievement={item}
              canDocReview={canDocReview}
              canSecretaryApprove={canSecretaryApprove}
              canSecretaryOverride={canSecretaryApprove}
              onOpenModal={handleOpenModal}
              onViewDetails={(ach) => setInspectingAchievement(ach)}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {data?.meta && data.meta.totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-200 pt-4 text-xs">
          <span className="text-gray-600">
            Page {data.meta.page} of {data.meta.totalPages}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={!data.meta.hasPrevPage}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded border border-gray-300 px-3 py-1.5 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={!data.meta.hasNextPage}
              onClick={() => setPage((p) => p + 1)}
              className="rounded border border-gray-300 px-3 py-1.5 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Review Modal */}
      <ReviewModal
        type={modalType}
        achievement={activeAchievement}
        isOpen={Boolean(modalType)}
        onClose={() => {
          setModalType(null);
          setActiveAchievement(null);
        }}
      />
    </div>
  );
};
