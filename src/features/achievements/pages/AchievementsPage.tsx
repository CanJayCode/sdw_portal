import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getMyAchievements } from '../api';
import { AchievementCard } from '../components/AchievementCard';
import { AchievementForm } from '../components/AchievementForm';
import { AchievementReviewPage } from './AchievementReviewPage';
import { AchievementDetailPage } from './AchievementDetailPage';
import { ReviewModal, type ReviewModalType } from '../components/ReviewModal';
import { ErrorMessage, Spinner } from '@/components/ui/Feedback';
import { useAuthStore } from '@/store/auth';
import { isDocMember, isSecretary, isCesaAdmin } from '@/lib/permissions';
import type { Achievement, AchievementStatus } from '../types';

export { SubmitAchievementPage } from './SubmitAchievementPage';
export { AchievementDetailPage } from './AchievementDetailPage';
export { AchievementReviewPage } from './AchievementReviewPage';

type ActiveTab = 'MY_ACHIEVEMENTS' | 'SUBMIT' | 'GUEST_SUBMIT' | 'REVIEW_QUEUE';

export function AchievementsPage() {
  const { auth, isAuthenticated } = useAuthStore();
  const [activeTab, setActiveTab] = useState<ActiveTab>('MY_ACHIEVEMENTS');

  // Filters & pagination for "My Achievements"
  const [statusFilter, setStatusFilter] = useState<AchievementStatus | ''>('');
  const [page, setPage] = useState(1);
  const limit = 10;

  // Modals & inspect states
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const [modalType, setModalType] = useState<ReviewModalType>(null);
  const [inspectingAchievement, setInspectingAchievement] = useState<Achievement | null>(null);

  const canDocReview = isDocMember(auth) || isCesaAdmin(auth);
  const canSecretaryApprove = isSecretary(auth) || isCesaAdmin(auth);
  const canReview = canDocReview || canSecretaryApprove;

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['achievements', 'my', { status: statusFilter, page, limit }],
    queryFn: () =>
      getMyAchievements({
        status: statusFilter || undefined,
        page,
        limit,
      }),
    enabled: isAuthenticated,
  });

  // If inspecting a specific achievement
  if (inspectingAchievement) {
    return (
      <AchievementDetailPage
        achievement={inspectingAchievement}
        onBack={() => setInspectingAchievement(null)}
      />
    );
  }

  const handleResubmitEvidence = (achievement: Achievement) => {
    setSelectedAchievement(achievement);
    setModalType('RESUBMIT_EVIDENCE');
  };

  const handleViewDetails = (achievement: Achievement) => {
    setInspectingAchievement(achievement);
  };

  return (
    <div className="space-y-6 py-4">
      {/* Page Title & Subtitle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Achievements Hub</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
            Submit accomplishments, track documentation verification, and earn points on the CESA Leaderboard.
          </p>
        </div>

        {isAuthenticated && activeTab !== 'SUBMIT' && (
          <button
            type="button"
            onClick={() => setActiveTab('SUBMIT')}
            className="self-start sm:self-auto rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 shadow-sm"
          >
            + Submit New Achievement
          </button>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="flex overflow-x-auto border-b border-gray-200 dark:border-gray-700">
        <button
          type="button"
          onClick={() => setActiveTab('MY_ACHIEVEMENTS')}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-semibold whitespace-nowrap transition-colors ${
            activeTab === 'MY_ACHIEVEMENTS'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-gray-500 hover:text-gray-300'
          }`}
        >
          <span>My Achievements</span>
          {data?.meta && (
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-700 dark:bg-gray-700 dark:text-gray-100">
              {data.meta.total}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('SUBMIT')}
          className={`border-b-2 px-4 py-2.5 text-sm font-semibold whitespace-nowrap transition-colors ${
            activeTab === 'SUBMIT'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-gray-500 hover:text-gray-300'
          }`}
        >
          Submit Achievement
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('GUEST_SUBMIT')}
          className={`border-b-2 px-4 py-2.5 text-sm font-semibold whitespace-nowrap transition-colors ${
            activeTab === 'GUEST_SUBMIT'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-gray-500 hover:text-gray-300'
          }`}
        >
          Guest Submission
        </button>

        {canReview && (
          <button
            type="button"
            onClick={() => setActiveTab('REVIEW_QUEUE')}
            className={`flex items-center gap-1.5 border-b-2 px-4 py-2.5 text-sm font-semibold whitespace-nowrap transition-colors ${
              activeTab === 'REVIEW_QUEUE'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-300'
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-indigo-500" />
            <span>Reviewer Queue</span>
            {canSecretaryApprove && (
              <span className="rounded bg-indigo-50 px-1.5 py-0.5 text-[10px] font-bold text-indigo-700">
                Secretary
              </span>
            )}
            {canDocReview && !canSecretaryApprove && (
              <span className="rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-bold text-amber-700">
                Doc Member
              </span>
            )}
          </button>
        )}
      </div>

      {/* Tab 1: My Achievements */}
      {activeTab === 'MY_ACHIEVEMENTS' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="ui-card flex flex-wrap items-center justify-between gap-3 p-3">
            <div className="flex items-center gap-3">
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-300">Filter Status:</label>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value as AchievementStatus | '');
                  setPage(1);
                }}
                className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-700 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
              >
                <option value="">All Statuses</option>
                <option value="SUBMITTED">Submitted</option>
                <option value="PENDING_DOCUMENTATION_REVIEW">Pending Doc Review</option>
                <option value="EVIDENCE_REQUESTED">Evidence Requested</option>
                <option value="APPROVED_BY_DOCUMENTATION">Approved by Doc</option>
                <option value="PENDING_SECRETARY_APPROVAL">Pending Secretary Approval</option>
                <option value="AUTHENTICATED">Authenticated (Approved)</option>
                <option value="REJECTED_BY_DOCUMENTATION">Rejected by Doc</option>
                <option value="REJECTED_BY_SECRETARY">Rejected by Secretary</option>
              </select>
            </div>

            <button
              type="button"
              onClick={() => refetch()}
              className="rounded-lg border border-gray-300 px-2.5 py-1 text-xs text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              ↻ Refresh
            </button>
          </div>

          {/* List of My Achievements */}
          {isLoading ? (
            <Spinner />
          ) : isError ? (
            <ErrorMessage message="Failed to load your achievements. Please try again." />
          ) : data?.achievements.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center dark:border-gray-700 dark:bg-gray-900">
              <p className="text-base font-semibold text-gray-800 dark:text-gray-100">No achievements found</p>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                You haven&apos;t submitted any achievements matching this criteria yet.
              </p>
              <button
                type="button"
                onClick={() => setActiveTab('SUBMIT')}
                className="mt-4 rounded-lg bg-brand-600 px-4 py-2 text-xs font-semibold text-white hover:bg-brand-700 shadow-sm"
              >
                Submit Your First Achievement
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {data?.achievements.map((item) => (
                <AchievementCard
                  key={item._id}
                  achievement={item}
                  onResubmitEvidence={handleResubmitEvidence}
                  onViewDetails={handleViewDetails}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {data?.meta && data.meta.totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-gray-200 pt-3 text-xs dark:border-gray-700">
              <span className="text-gray-600 dark:text-gray-300">
                Page {data.meta.page} of {data.meta.totalPages} ({data.meta.total} total achievements)
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={!data.meta.hasPrevPage}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="rounded border border-gray-300 px-3 py-1.5 text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
                >
                  Previous
                </button>
                <button
                  type="button"
                  disabled={!data.meta.hasNextPage}
                  onClick={() => setPage((p) => p + 1)}
                  className="rounded border border-gray-300 px-3 py-1.5 text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Submit Achievement */}
      {activeTab === 'SUBMIT' && (
        <div className="mx-auto max-w-2xl">
          <AchievementForm
            isGuest={false}
            onSuccess={() => {
              setActiveTab('MY_ACHIEVEMENTS');
              refetch();
            }}
          />
        </div>
      )}

      {/* Tab 3: Guest Submission */}
      {activeTab === 'GUEST_SUBMIT' && (
        <div className="mx-auto max-w-2xl">
          <AchievementForm
            isGuest={true}
            onSuccess={() => {
              setActiveTab('MY_ACHIEVEMENTS');
              refetch();
            }}
          />
        </div>
      )}

      {/* Tab 4: Review Queue */}
      {activeTab === 'REVIEW_QUEUE' && canReview && <AchievementReviewPage />}

      {/* Resubmit Evidence Modal */}
      <ReviewModal
        type={modalType}
        achievement={selectedAchievement}
        isOpen={Boolean(modalType)}
        onClose={() => {
          setModalType(null);
          setSelectedAchievement(null);
        }}
      />
    </div>
  );
}
