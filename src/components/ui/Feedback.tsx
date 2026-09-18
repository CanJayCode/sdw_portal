// Small shared UI primitives. Add to this file rather than redefining
// spinners/badges/cards inside individual feature folders.

export function Spinner() {
  return (
    <div className="flex justify-center py-8" role="status" aria-label="Loading">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
    </div>
  );
}

export function ErrorMessage({ message }: { message: string }) {
  return (
    <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
      {message}
    </div>
  );
}

export function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`ui-card ${className}`}
    >
      {children}
    </div>
  );
}

const STATUS_COLORS: Record<string, string> = {
  PUBLISHED: 'bg-green-500/10 text-green-400 ring-1 ring-inset ring-green-500/20',
  AUTHENTICATED: 'bg-green-500/10 text-green-400 ring-1 ring-inset ring-green-500/20',
  PENDING_APPROVAL: 'bg-amber-500/10 text-amber-300 ring-1 ring-inset ring-amber-500/20',
  PENDING_DOCUMENTATION_REVIEW: 'bg-amber-500/10 text-amber-300 ring-1 ring-inset ring-amber-500/20',
  PENDING_SECRETARY_APPROVAL: 'bg-amber-500/10 text-amber-300 ring-1 ring-inset ring-amber-500/20',
  DRAFT: 'bg-gray-500/10 text-gray-400 ring-1 ring-inset ring-gray-500/20',
  REJECTED: 'bg-red-500/10 text-red-400 ring-1 ring-inset ring-red-500/20',
  REJECTED_BY_DOCUMENTATION: 'bg-red-500/10 text-red-400 ring-1 ring-inset ring-red-500/20',
  REJECTED_BY_SECRETARY: 'bg-red-500/10 text-red-400 ring-1 ring-inset ring-red-500/20',
  DELISTED: 'bg-red-500/10 text-red-400 ring-1 ring-inset ring-red-500/20',
  CANCELLED: 'bg-red-500/10 text-red-400 ring-1 ring-inset ring-red-500/20',
  COMPLETED: 'bg-brand-500/10 text-brand-400 ring-1 ring-inset ring-brand-500/20',
};

export function StatusBadge({ status }: { status: string }) {
  const colorClass = STATUS_COLORS[status] ?? 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-100';
  return (
    <span className={`rounded-md px-2 py-1 text-xs font-medium ${colorClass}`}>
      {status.replaceAll('_', ' ')}
    </span>
  );
}
