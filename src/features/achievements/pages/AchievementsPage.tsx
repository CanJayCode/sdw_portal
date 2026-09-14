import { useQuery } from '@tanstack/react-query';
import { getMyAchievements } from '../api';
import { Card, ErrorMessage, Spinner, StatusBadge } from '@/components/ui/Feedback';

// -----------------------------------------------------------------------
// STARTER IMPLEMENTATION — shows "My Achievements" (GET /achievements/my).
//
// TODO for the module owner, using the api.ts functions already provided:
//   1. Submit form (POST /achievements) — use react-hook-form + zod like
//      src/features/auth/pages/RegisterPage.tsx.
//   2. Review queue page for Doc Members / Secretary (GET /achievements) —
//      gate visibility with lib/permissions (isDocMember / isSecretary).
//   3. Review/approve/reject actions using reviewAchievement,
//      approveAchievement, rejectAchievement, overrideAchievement.
//   4. Resubmit-evidence form for EVIDENCE_REQUESTED items.
// See docs/api.md section 7 for the full status-transition diagram.
// -----------------------------------------------------------------------

export function AchievementsPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['achievements', 'my'],
    queryFn: () => getMyAchievements(),
  });

  if (isLoading) return <Spinner />;
  if (isError) return <ErrorMessage message="Failed to load achievements." />;

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">My Achievements</h1>

      <div className="space-y-3">
        {data?.achievements.map((a) => (
          <Card key={a._id}>
            <div className="flex items-center justify-between">
              <p className="font-semibold">{a.title}</p>
              <StatusBadge status={a.status} />
            </div>
            <p className="mt-1 text-sm text-gray-600">{a.description}</p>
            <p className="mt-1 text-xs text-gray-500">{a.points} points</p>
          </Card>
        ))}
        {data?.achievements.length === 0 && (
          <p className="text-sm text-gray-500">No achievements submitted yet.</p>
        )}
      </div>
    </div>
  );
}
