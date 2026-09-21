import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getAchievementById } from '../api';
import { AchievementStatus } from '../components/AchievementStatus';
import { ReviewModal, type ReviewModalType } from '../components/ReviewModal';
import { Card, Spinner, ErrorMessage } from '@/components/ui/Feedback';
import { useAuthStore } from '@/store/auth';
import { isDocMember, isSecretary, isCesaAdmin } from '@/lib/permissions';
import { ArrowLeftIcon, ExternalLinkIcon } from '@/components/ui/Icons';
import type { Achievement } from '../types';

interface AchievementDetailPageProps {
  achievement?: Achievement;
  onBack?: () => void;
}

export const AchievementDetailPage: React.FC<AchievementDetailPageProps> = ({
  achievement: propAchievement,
  onBack,
}) => {
  const { id } = useParams<{ id: string }>();
  const { auth } = useAuthStore();
  const [modalType, setModalType] = useState<ReviewModalType>(null);

  // If no achievement prop provided, fetch via ID
  const { data: fetchedAchievement, isLoading, isError } = useQuery({
    queryKey: ['achievement', id],
    queryFn: () => getAchievementById(id!),
    enabled: !propAchievement && Boolean(id),
  });

  const achievement = propAchievement || fetchedAchievement;

  if (isLoading) return <Spinner />;
  if (isError || (!achievement && !propAchievement)) {
    return (
      <div className="mx-auto max-w-3xl py-6">
        <ErrorMessage message="Could not load achievement details. Please try again." />
        <div className="mt-4">
          <Link to="/achievements" className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:underline">
            <ArrowLeftIcon className="h-4 w-4" />
            <span>Back to Achievements</span>
          </Link>
        </div>
      </div>
    );
  }

  if (!achievement) return null;

  const canDocReview = isDocMember(auth) || isCesaAdmin(auth);
  const canSecretaryApprove = isSecretary(auth) || isCesaAdmin(auth);
  const isEvidenceRequested = achievement.status === 'EVIDENCE_REQUESTED';
  const isDocQueue = achievement.status === 'PENDING_DOCUMENTATION_REVIEW';
  const isSecretaryQueue = achievement.status === 'PENDING_SECRETARY_APPROVAL';
  const isAuthenticated = achievement.status === 'AUTHENTICATED';

  const typeName =
    typeof achievement.achievementTypeId === 'object' && achievement.achievementTypeId !== null
      ? (achievement.achievementTypeId as any).name || (achievement.achievementTypeId as any).code
      : 'Achievement';

  return (
    <div className="mx-auto max-w-3xl py-6">
      <div className="mb-4">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-brand-600 hover:text-brand-800"
          >
            <ArrowLeftIcon className="h-3.5 w-3.5" />
            <span>Back to list</span>
          </button>
        ) : (
          <Link
            to="/achievements"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-brand-600 hover:text-brand-800"
          >
            <ArrowLeftIcon className="h-3.5 w-3.5" />
            <span>Back to Achievements</span>
          </Link>
        )}
      </div>

      <Card className="space-y-6">
        {/* Header */}
        <div className="border-b border-gray-100 pb-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="rounded bg-brand-50 px-2.5 py-1 text-xs font-bold text-brand-700 uppercase">
                {typeName}
              </span>
              <span className="rounded bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
                +{achievement.points} Leaderboard Points
              </span>
            </div>
            {achievement.createdAt && (
              <span className="text-xs text-gray-400">
                Submitted {new Date(achievement.createdAt).toLocaleString()}
              </span>
            )}
          </div>
          <h1 className="mt-3 text-2xl font-bold text-gray-900">{achievement.title}</h1>
        </div>

        {/* Status Timeline */}
        <div className="rounded-lg border border-gray-100 bg-gray-50/50 p-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Workflow Status</h2>
          <AchievementStatus
            status={achievement.status}
            showTimeline={true}
            notes={achievement.reviewHistory?.[achievement.reviewHistory.length - 1]?.notes}
            rejectionReason={achievement.rejectionReason}
            overrideReason={achievement.approvalInfo?.overrideReason}
          />
        </div>

        {/* Description */}
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Description</h2>
          <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">{achievement.description}</p>
        </div>

        {/* Submitter Info */}
        {(achievement.studentId || achievement.guestInfo) && (
          <div className="rounded-lg border border-gray-100 bg-gray-50 p-3 text-xs text-gray-600">
            <span className="font-bold text-gray-700 uppercase tracking-wider">Submitter Information: </span>
            {achievement.submitterType === 'GUEST' ? (
              <span>
                {achievement.guestInfo?.name} (PRN: {achievement.guestInfo?.prn}, Email: {achievement.guestInfo?.email}) [Guest Submission]
              </span>
            ) : typeof achievement.studentId === 'object' && achievement.studentId !== null ? (
              <span>
                {(achievement.studentId as any).name} (PRN: {(achievement.studentId as any).prn}, Branch: {(achievement.studentId as any).branch}, Year: {(achievement.studentId as any).year})
              </span>
            ) : (
              <span>Student Account</span>
            )}
          </div>
        )}

        {/* Supporting Evidence */}
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Supporting Evidence</h2>
          {achievement.evidenceUrls && achievement.evidenceUrls.length > 0 ? (
            <div className="space-y-2">
              {achievement.evidenceUrls.map((url, idx) => (
                <div key={idx} className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3 text-sm">
                  <div className="flex items-center gap-2 truncate">
                    <svg className="h-4 w-4 text-brand-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="truncate text-xs font-sans text-gray-700">{url}</span>
                  </div>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-3 inline-flex items-center gap-1 rounded bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700 hover:bg-brand-100 flex-shrink-0"
                  >
                    <span>Open Link</span>
                    <ExternalLinkIcon className="h-3 w-3" />
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-500 italic">No evidence URLs provided.</p>
          )}
        </div>

        {/* Review History */}
        {achievement.reviewHistory && achievement.reviewHistory.length > 0 && (
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Audit &amp; Review History</h2>
            <div className="space-y-2">
              {achievement.reviewHistory.map((item, idx) => (
                <div key={idx} className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-xs">
                  <div className="flex items-center justify-between font-semibold text-gray-800">
                    <span>Action: {item.action.replaceAll('_', ' ')}</span>
                    <span className="text-gray-400 font-normal">{new Date(item.reviewedAt).toLocaleString()}</span>
                  </div>
                  {item.notes && <p className="mt-1 text-gray-600">&quot;{item.notes}&quot;</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Contextual Actions Bar */}
        <div className="flex flex-wrap items-center justify-end gap-3 pt-4 border-t border-gray-100">
          {/* Resubmit Evidence button for student */}
          {isEvidenceRequested && (
            <button
              type="button"
              onClick={() => setModalType('RESUBMIT_EVIDENCE')}
              className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700 shadow-sm"
            >
              Resubmit Evidence
            </button>
          )}

          {/* Doc Member review button */}
          {canDocReview && isDocQueue && (
            <button
              type="button"
              onClick={() => setModalType('DOC_REVIEW')}
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 shadow-sm"
            >
              Perform Documentation Review
            </button>
          )}

          {/* Secretary approval/rejection */}
          {canSecretaryApprove && isSecretaryQueue && (
            <>
              <button
                type="button"
                onClick={() => setModalType('SECRETARY_REJECT')}
                className="rounded-lg border border-rose-300 bg-white px-4 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-50"
              >
                Reject Submission
              </button>
              <button
                type="button"
                onClick={() => setModalType('SECRETARY_APPROVE')}
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 shadow-sm"
              >
                Approve &amp; Authenticate
              </button>
            </>
          )}

          {/* Secretary Override */}
          {canSecretaryApprove && isAuthenticated && (
            <button
              type="button"
              onClick={() => setModalType('SECRETARY_OVERRIDE')}
              className="rounded-lg border border-amber-400 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-900 hover:bg-amber-100"
            >
              Apply Secretary Override
            </button>
          )}
        </div>
      </Card>

      <ReviewModal
        type={modalType}
        achievement={achievement}
        isOpen={Boolean(modalType)}
        onClose={() => setModalType(null)}
      />
    </div>
  );
};
