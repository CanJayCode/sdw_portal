import { useQuery } from '@tanstack/react-query';
import { getAuditLogs } from '../api';
import { Card, ErrorMessage, Spinner } from '@/components/ui/Feedback';

// CESA-admin-only page (see src/routes/router.tsx — gated with requireCesaAdmin).
// TODO (module owner): filter controls for action/targetResource/clubId, pagination.
// See docs/api.md section 12.

export function AuditLogsPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['audit-logs'],
    queryFn: () => getAuditLogs({ limit: 30 }),
  });

  if (isLoading) return <Spinner />;
  if (isError) return <ErrorMessage message="Failed to load audit logs." />;

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Audit Logs</h1>

      <div className="space-y-2">
        {data?.logs.map((log) => (
          <Card key={log._id}>
            <div className="flex items-center justify-between">
              <p className="font-medium">{log.action}</p>
              <p className="text-xs text-gray-400">{new Date(log.createdAt).toLocaleString()}</p>
            </div>
            <p className="text-sm text-gray-600">Target: {log.targetResource}</p>
            {log.reason && <p className="mt-1 text-sm text-gray-500">Reason: {log.reason}</p>}
          </Card>
        ))}
        {data?.logs.length === 0 && <p className="text-sm text-gray-500">No audit entries yet.</p>}
      </div>
    </div>
  );
}
