import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAuditLogs, type AuditLogParams } from '../api';
import { getClubs } from '@/features/clubs/api';
import { Card, ErrorMessage, Spinner } from '@/components/ui/Feedback';
import {
  FilterIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  RefreshIcon,
  XIcon,
} from '@/components/ui/Icons';

const COMMON_ACTIONS = [
  'DELIST_EVENT',
  'UNDELIST_EVENT',
  'OVERRIDE_ACHIEVEMENT_APPROVAL',
  'EVENT_APPROVED',
  'ROLE_MODIFIED',
  'MEMBER_REMOVED',
  'MEMBER_ADDED',
];

export function AuditLogsPage() {
  const [action, setAction] = useState<string>('');
  const [targetResource, setTargetResource] = useState<string>('');
  const [clubId, setClubId] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(20);

  const { data: clubsData } = useQuery({
    queryKey: ['clubs'],
    queryFn: getClubs,
    staleTime: 5 * 60 * 1000,
  });

  const queryParams: AuditLogParams = {
    page,
    limit,
    ...(action ? { action } : {}),
    ...(targetResource.trim() ? { targetResource: targetResource.trim() } : {}),
    ...(clubId ? { clubId } : {}),
  };

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['audit-logs', queryParams],
    queryFn: () => getAuditLogs(queryParams),
  });

  const handleResetFilters = () => {
    setAction('');
    setTargetResource('');
    setClubId('');
    setPage(1);
  };

  const hasActiveFilters = Boolean(action || targetResource.trim() || clubId);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            Privileged Audit Logs
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Immutable audit trail of administrative overrides, role updates, and moderation actions.
          </p>
        </div>

        <button
          type="button"
          onClick={() => refetch()}
          disabled={isFetching}
          className="inline-flex items-center gap-1.5 self-start rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 sm:self-auto"
        >
          <RefreshIcon className={`h-3.5 w-3.5 ${isFetching ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-800/80">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            <FilterIcon className="h-4 w-4" />
            <span>Filter Audit Trail</span>
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1 text-xs text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
            >
              <XIcon className="h-3 w-3" />
              <span>Clear filters</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {/* Action Filter */}
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">
              Action
            </label>
            <select
              value={action}
              onChange={(e) => {
                setAction(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-xs text-gray-800 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
            >
              <option value="">All Actions</option>
              {COMMON_ACTIONS.map((act) => (
                <option key={act} value={act}>
                  {act}
                </option>
              ))}
            </select>
          </div>

          {/* Club Filter */}
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">
              Club Scope
            </label>
            <select
              value={clubId}
              onChange={(e) => {
                setClubId(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-xs text-gray-800 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
            >
              <option value="">All Clubs</option>
              {clubsData?.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.code} - {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Target Resource Search */}
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">
              Target Resource
            </label>
            <input
              type="text"
              value={targetResource}
              onChange={(e) => {
                setTargetResource(e.target.value);
                setPage(1);
              }}
              placeholder="e.g. event/achievement ID"
              className="w-full rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-xs text-gray-800 shadow-sm placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
            />
          </div>

          {/* Page Limit */}
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">
              Logs Per Page
            </label>
            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
              className="w-full rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-xs text-gray-800 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
            >
              <option value={10}>10 per page</option>
              <option value={20}>20 per page</option>
              <option value={50}>50 per page</option>
            </select>
          </div>
        </div>
      </div>

      {isLoading && <Spinner />}
      {isError && <ErrorMessage message="Failed to load privileged audit logs." />}

      {/* Logs Table / List */}
      {!isLoading && !isError && (
        <div className="space-y-3">
          {data?.logs && data.logs.length > 0 ? (
            data.logs.map((log) => {
              const performerDisplay =
                typeof log.performedBy === 'object' && log.performedBy !== null
                  ? `${log.performedBy.name} (${log.performedBy.prn})`
                  : String(log.performedBy || 'System');

              return (
                <Card
                  key={log._id}
                  className="transition-all hover:border-gray-300 dark:hover:border-gray-700"
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-brand-50 px-2 py-0.5 text-xs font-semibold text-brand-700 dark:bg-brand-950 dark:text-brand-300">
                        {log.action}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        by <strong className="text-gray-700 dark:text-gray-300">{performerDisplay}</strong>
                      </span>
                    </div>
                    <time className="text-xs text-gray-400">
                      {new Date(log.createdAt).toLocaleString()}
                    </time>
                  </div>

                  <div className="mt-2 text-xs text-gray-600 dark:text-gray-300">
                    <span className="font-medium text-gray-500 dark:text-gray-400">Target:</span>{' '}
                    <span className="font-mono">{log.targetResource}</span>
                  </div>

                  {log.reason && (
                    <div className="mt-2 rounded-md bg-gray-50 p-2 text-xs text-gray-600 dark:bg-gray-900/60 dark:text-gray-400">
                      <span className="font-medium text-gray-500 dark:text-gray-400">Reason:</span>{' '}
                      {log.reason}
                    </div>
                  )}
                </Card>
              );
            })
          ) : (
            <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center dark:border-gray-800 dark:bg-gray-800/40">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                No audit log entries found
              </p>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {hasActiveFilters
                  ? 'Try adjusting your filters to find relevant logs.'
                  : 'No privileged actions have been recorded yet.'}
              </p>
            </div>
          )}

          {/* Pagination Controls */}
          {data?.meta && (
            <div className="flex flex-col items-center justify-between gap-3 border-t border-gray-200 pt-4 text-xs text-gray-600 dark:border-gray-800 dark:text-gray-400 sm:flex-row">
              <div>
                Showing page <span className="font-semibold text-gray-800 dark:text-gray-200">{data.meta.page}</span>{' '}
                of <span className="font-semibold text-gray-800 dark:text-gray-200">{data.meta.totalPages || 1}</span>{' '}
                ({data.meta.total} total log entries)
              </div>

              <div className="inline-flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={!data.meta.hasPrevPage && page <= 1}
                  className="inline-flex items-center gap-1 rounded-md border border-gray-300 bg-white px-2.5 py-1 text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                >
                  <ChevronLeftIcon className="h-3.5 w-3.5" />
                  <span>Previous</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={!data.meta.hasNextPage}
                  className="inline-flex items-center gap-1 rounded-md border border-gray-300 bg-white px-2.5 py-1 text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                >
                  <span>Next</span>
                  <ChevronRightIcon className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
