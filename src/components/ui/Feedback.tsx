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
      className={`rounded-lg border bg-white p-4 text-gray-900 shadow-sm dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 ${className}`}
    >
      {children}
    </div>
  );
}

const STATUS_COLORS: Record<string, string> = {
  PUBLISHED: 'bg-green-100 text-green-700',
  AUTHENTICATED: 'bg-green-100 text-green-700',
  PENDING_APPROVAL: 'bg-yellow-100 text-yellow-700',
  PENDING_DOCUMENTATION_REVIEW: 'bg-yellow-100 text-yellow-700',
  PENDING_SECRETARY_APPROVAL: 'bg-yellow-100 text-yellow-700',
  DRAFT: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-100',
  REJECTED: 'bg-red-100 text-red-700',
  REJECTED_BY_DOCUMENTATION: 'bg-red-100 text-red-700',
  REJECTED_BY_SECRETARY: 'bg-red-100 text-red-700',
  DELISTED: 'bg-red-100 text-red-700',
  CANCELLED: 'bg-red-100 text-red-700',
  COMPLETED: 'bg-blue-100 text-blue-700',
};

export function StatusBadge({ status }: { status: string }) {
  const colorClass = STATUS_COLORS[status] ?? 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-100';
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${colorClass}`}>
      {status.replaceAll('_', ' ')}
    </span>
  );
}
