import type { AchievementStatus as StatusType } from '../types';

interface AchievementStatusProps {
  status: StatusType;
  showTimeline?: boolean;
  notes?: string;
  rejectionReason?: string;
  overrideReason?: string;
}

const STATUS_CONFIG: Record<
  StatusType,
  { label: string; bg: string; text: string; border: string; step: number; isTerminalReject?: boolean }
> = {
  SUBMITTED: {
    label: 'Submitted',
    bg: 'bg-slate-100',
    text: 'text-slate-800',
    border: 'border-slate-200',
    step: 1,
  },
  PENDING_DOCUMENTATION_REVIEW: {
    label: 'Pending Doc Review',
    bg: 'bg-amber-100',
    text: 'text-amber-800',
    border: 'border-amber-300',
    step: 2,
  },
  EVIDENCE_REQUESTED: {
    label: 'Evidence Requested',
    bg: 'bg-orange-100',
    text: 'text-orange-800',
    border: 'border-orange-300',
    step: 2,
  },
  APPROVED_BY_DOCUMENTATION: {
    label: 'Approved by Documentation',
    bg: 'bg-sky-100',
    text: 'text-sky-800',
    border: 'border-sky-300',
    step: 2,
  },
  PENDING_SECRETARY_APPROVAL: {
    label: 'Pending Secretary Approval',
    bg: 'bg-indigo-100',
    text: 'text-indigo-800',
    border: 'border-indigo-300',
    step: 3,
  },
  AUTHENTICATED: {
    label: 'Authenticated (Points Awarded)',
    bg: 'bg-emerald-100',
    text: 'text-emerald-800',
    border: 'border-emerald-300',
    step: 4,
  },
  REJECTED_BY_DOCUMENTATION: {
    label: 'Rejected by Documentation',
    bg: 'bg-rose-100',
    text: 'text-rose-800',
    border: 'border-rose-300',
    step: 2,
    isTerminalReject: true,
  },
  REJECTED_BY_SECRETARY: {
    label: 'Rejected by Secretary',
    bg: 'bg-rose-100',
    text: 'text-rose-800',
    border: 'border-rose-300',
    step: 3,
    isTerminalReject: true,
  },
  REJECTED: {
    label: 'Rejected',
    bg: 'bg-rose-100',
    text: 'text-rose-800',
    border: 'border-rose-300',
    step: 2,
    isTerminalReject: true,
  },
};

export function AchievementStatusBadge({ status }: { status: StatusType }) {
  const config = STATUS_CONFIG[status] ?? {
    label: status.replaceAll('_', ' '),
    bg: 'bg-gray-100',
    text: 'text-gray-700',
    border: 'border-gray-300',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${config.bg} ${config.text} ${config.border}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-75" />
      {config.label}
    </span>
  );
}

export function AchievementStatus({
  status,
  showTimeline = false,
  notes,
  rejectionReason,
  overrideReason,
}: AchievementStatusProps) {
  const config = STATUS_CONFIG[status];
  const isRejected = config?.isTerminalReject;
  const isEvidenceNeeded = status === 'EVIDENCE_REQUESTED';
  const isAuthenticated = status === 'AUTHENTICATED';

  const steps = [
    { name: 'Submission', step: 1 },
    { name: 'Documentation Review', step: 2 },
    { name: 'Secretary Approval', step: 3 },
    { name: 'Leaderboard Points', step: 4 },
  ];

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <AchievementStatusBadge status={status} />
      </div>

      {/* Alert banner for critical states */}
      {isEvidenceNeeded && (
        <div className="rounded-md border border-orange-300 bg-orange-50 p-3 text-sm text-orange-900">
          <div className="flex items-center font-medium">
            <svg className="mr-1.5 h-4 w-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            Reviewer Requested Additional Evidence
          </div>
          {notes && <p className="mt-1 text-xs text-orange-800">Reviewer Note: &quot;{notes}&quot;</p>}
          <p className="mt-1 text-xs font-semibold text-orange-800">
            Please provide updated evidence URLs to continue the verification process.
          </p>
        </div>
      )}

      {isRejected && (
        <div className="rounded-md border border-rose-300 bg-rose-50 p-3 text-sm text-rose-900">
          <p className="font-medium">Submission Not Approved</p>
          {(rejectionReason || overrideReason || notes) && (
            <p className="mt-1 text-xs text-rose-800">Reason: {rejectionReason || overrideReason || notes}</p>
          )}
        </div>
      )}

      {isAuthenticated && (
        <div className="rounded-md border border-emerald-300 bg-emerald-50 p-3 text-sm text-emerald-900">
          <p className="font-medium">Verified &amp; Authenticated</p>
          <p className="mt-0.5 text-xs text-emerald-800">
            Points have been officially credited to the CESA Leaderboard for this semester.
          </p>
        </div>
      )}

      {/* Visual Workflow Stepper Timeline */}
      {showTimeline && (
        <div className="mt-3 pt-2">
          <div className="grid grid-cols-4 gap-2 text-center text-xs">
            {steps.map((s) => {
              const isPast = config.step > s.step || (isAuthenticated && s.step === 4);
              const isCurrent = config.step === s.step && !isRejected;
              const isStepRejected = isRejected && config.step === s.step;

              return (
                <div key={s.step} className="flex flex-col items-center">
                  <div
                    className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                      isStepRejected
                        ? 'bg-rose-600 text-white'
                        : isPast
                        ? 'bg-brand-600 text-white'
                        : isCurrent
                        ? 'bg-amber-500 text-white ring-2 ring-amber-200'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {isStepRejected ? '✕' : isPast ? '✓' : s.step}
                  </div>
                  <span
                    className={`mt-1 font-medium ${
                      isStepRejected
                        ? 'text-rose-600'
                        : isCurrent
                        ? 'text-amber-700'
                        : isPast
                        ? 'text-brand-700'
                        : 'text-gray-400'
                    }`}
                  >
                    {s.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
