import { Card } from '@/components/ui/Feedback';
import { AchievementStatusBadge } from './AchievementStatus';
import type { Achievement } from '../types';

interface AchievementCardProps {
  achievement: Achievement;
  onResubmitEvidence?: (achievement: Achievement) => void;
  onViewDetails?: (achievement: Achievement) => void;
  showActions?: boolean;
}

export function AchievementCard({
  achievement,
  onResubmitEvidence,
  onViewDetails,
}: AchievementCardProps) {
  const isEvidenceRequested = achievement.status === 'EVIDENCE_REQUESTED';
  const typeName =
    typeof achievement.achievementTypeId === 'object' && achievement.achievementTypeId !== null
      ? (achievement.achievementTypeId as any).name || (achievement.achievementTypeId as any).code
      : 'Achievement';

  // Latest review history entry if any
  const latestReview =
    achievement.reviewHistory && achievement.reviewHistory.length > 0
      ? achievement.reviewHistory[achievement.reviewHistory.length - 1]
      : null;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-brand-700 bg-brand-50 px-2 py-0.5 rounded">
              {typeName}
            </span>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
              +{achievement.points} pts
            </span>
          </div>
          <h3 className="mt-1 text-base font-bold text-gray-900 dark:text-gray-100">{achievement.title}</h3>
        </div>

        <div>
          <AchievementStatusBadge status={achievement.status} />
        </div>
      </div>

      <p className="mt-2 line-clamp-2 text-sm text-gray-600 dark:text-gray-300">{achievement.description}</p>

      {/* Evidence Links */}
      {achievement.evidenceUrls && achievement.evidenceUrls.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Evidence:</span>
          {achievement.evidenceUrls.map((url, i) => (
            <a
              key={i}
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
              Evidence #{i + 1}
            </a>
          ))}
        </div>
      )}

      {/* Reviewer Note / Rejection Reason Callout */}
      {isEvidenceRequested && latestReview?.notes && (
        <div className="mt-3 rounded border border-orange-200 bg-orange-50 p-2.5 text-xs text-orange-900">
          <span className="font-semibold">Reviewer requested clarification:</span> {latestReview.notes}
        </div>
      )}

      {achievement.rejectionReason && (
        <div className="mt-3 rounded border border-rose-200 bg-rose-50 p-2.5 text-xs text-rose-900">
          <span className="font-semibold">Rejection reason:</span> {achievement.rejectionReason}
        </div>
      )}

      {achievement.approvalInfo?.secretaryOverridden && achievement.approvalInfo?.overrideReason && (
        <div className="mt-3 rounded border border-rose-200 bg-rose-50 p-2.5 text-xs text-rose-900">
          <span className="font-semibold">Secretary override:</span> {achievement.approvalInfo.overrideReason}
        </div>
      )}

      {/* Footer Actions */}
      <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3 text-xs text-gray-500 dark:border-gray-700 dark:text-gray-400">
        <div>
          {achievement.createdAt && (
            <span>Submitted {new Date(achievement.createdAt).toLocaleDateString()}</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {onViewDetails && (
            <button
              type="button"
              onClick={() => onViewDetails(achievement)}
              className="rounded px-2.5 py-1 font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
            >
              View Details
            </button>
          )}

          {isEvidenceRequested && onResubmitEvidence && (
            <button
              type="button"
              onClick={() => onResubmitEvidence(achievement)}
              className="rounded bg-orange-600 px-3 py-1 font-medium text-white hover:bg-orange-700 shadow-sm"
            >
              Resubmit Evidence
            </button>
          )}
        </div>
      </div>
    </Card>
  );
}
