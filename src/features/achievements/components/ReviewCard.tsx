import { Card } from '@/components/ui/Feedback';
import { AchievementStatusBadge } from './AchievementStatus';
import type { Achievement } from '../types';
import type { ReviewModalType } from './ReviewModal';

interface ReviewCardProps {
  achievement: Achievement;
  canDocReview: boolean;
  canSecretaryApprove: boolean;
  canSecretaryOverride: boolean;
  onOpenModal: (type: ReviewModalType, achievement: Achievement) => void;
  onViewDetails?: (achievement: Achievement) => void;
}

export function ReviewCard({
  achievement,
  canDocReview,
  canSecretaryApprove,
  canSecretaryOverride,
  onOpenModal,
  onViewDetails,
}: ReviewCardProps) {
  const isDocQueue = achievement.status === 'PENDING_DOCUMENTATION_REVIEW';
  const isSecretaryQueue = achievement.status === 'PENDING_SECRETARY_APPROVAL';
  const isAuthenticated = achievement.status === 'AUTHENTICATED';

  // Submitter details
  const submitterName =
    achievement.submitterType === 'GUEST'
      ? achievement.guestInfo?.name || 'Guest User'
      : typeof achievement.studentId === 'object' && achievement.studentId !== null
      ? (achievement.studentId as any).name
      : 'Student';

  const submitterPrn =
    achievement.submitterType === 'GUEST'
      ? achievement.guestInfo?.prn
      : typeof achievement.studentId === 'object' && achievement.studentId !== null
      ? (achievement.studentId as any).prn
      : null;

  return (
    <Card className="border-l-4 border-l-brand-600 hover:shadow-md transition-shadow">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-brand-700 bg-brand-50 px-2 py-0.5 rounded">
              {achievement.submitterType === 'GUEST' ? 'Guest Submission' : 'Student Submission'}
            </span>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
              +{achievement.points} pts
            </span>
          </div>
          <h3 className="mt-1 text-base font-bold text-gray-900">{achievement.title}</h3>
        </div>

        <div>
          <AchievementStatusBadge status={achievement.status} />
        </div>
      </div>

      <div className="mt-2 text-xs text-gray-500 flex flex-wrap items-center gap-3">
        <span>
          Submitter: <strong className="text-gray-800">{submitterName}</strong>
        </span>
        {submitterPrn && (
          <span>
            PRN: <strong className="text-gray-800">{submitterPrn}</strong>
          </span>
        )}
        {achievement.createdAt && (
          <span>Submitted: {new Date(achievement.createdAt).toLocaleDateString()}</span>
        )}
      </div>

      <p className="mt-2 text-sm text-gray-600 line-clamp-2">{achievement.description}</p>

      {/* Evidence URLs preview */}
      {achievement.evidenceUrls && achievement.evidenceUrls.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-gray-500">Supporting Evidence:</span>
          {achievement.evidenceUrls.map((url, idx) => (
            <a
              key={idx}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded border border-gray-200 bg-gray-50 px-2 py-1 text-xs text-brand-600 hover:bg-brand-50 hover:underline"
            >
              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
              Evidence #{idx + 1}
            </a>
          ))}
        </div>
      )}

      {/* Review & Approval Actions */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-gray-100 text-xs">
        <div>
          {onViewDetails && (
            <button
              type="button"
              onClick={() => onViewDetails(achievement)}
              className="rounded px-2.5 py-1 text-xs font-medium text-gray-700 hover:bg-gray-100"
            >
              Inspect Full Details
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Doc Member review button */}
          {canDocReview && isDocQueue && (
            <button
              type="button"
              onClick={() => onOpenModal('DOC_REVIEW', achievement)}
              className="rounded bg-brand-600 px-3 py-1.5 font-semibold text-white hover:bg-brand-700 shadow-sm"
            >
              Review Evidence
            </button>
          )}

          {/* Secretary approve/reject buttons */}
          {canSecretaryApprove && isSecretaryQueue && (
            <>
              <button
                type="button"
                onClick={() => onOpenModal('SECRETARY_REJECT', achievement)}
                className="rounded border border-rose-300 bg-white px-3 py-1.5 font-semibold text-rose-700 hover:bg-rose-50"
              >
                Reject
              </button>
              <button
                type="button"
                onClick={() => onOpenModal('SECRETARY_APPROVE', achievement)}
                className="rounded bg-emerald-600 px-3 py-1.5 font-semibold text-white hover:bg-emerald-700 shadow-sm"
              >
                Approve &amp; Award Points
              </button>
            </>
          )}

          {/* Secretary override button */}
          {canSecretaryOverride && isAuthenticated && (
            <button
              type="button"
              onClick={() => onOpenModal('SECRETARY_OVERRIDE', achievement)}
              className="rounded border border-amber-300 bg-amber-50 px-3 py-1.5 font-semibold text-amber-800 hover:bg-amber-100"
            >
              Secretary Override
            </button>
          )}
        </div>
      </div>
    </Card>
  );
}
