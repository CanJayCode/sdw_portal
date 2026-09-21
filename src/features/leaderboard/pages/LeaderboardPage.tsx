import { useQuery } from '@tanstack/react-query';
import { getCurrentSemester, getLeaderboard } from '../api';
import { ErrorMessage, Spinner } from '@/components/ui/Feedback';
import { useAuthStore } from '@/store/auth';

export function LeaderboardPage() {
  const currentUser = useAuthStore((state) => state.user);
  const { data: semester } = useQuery({
    queryKey: ['semesters', 'current'],
    queryFn: getCurrentSemester,
  });

  const { data, isLoading, isError } = useQuery({
    queryKey: ['leaderboard', semester?._id],
    queryFn: () => getLeaderboard({ semesterId: semester?._id }),
    enabled: !!semester,
  });

  if (isLoading) return <Spinner />;
  if (isError) return <ErrorMessage message="Failed to load leaderboard." />;

  return (
    <div>
      <h1 className="text-2xl font-bold">Leaderboard</h1>
      {semester && <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">{semester.name}</p>}

      <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <table className="w-full min-w-[560px] text-sm">
          <thead className="bg-gray-50/80 text-left text-xs uppercase tracking-wider text-gray-600 dark:bg-gray-800/80 dark:text-gray-300">
            <tr>
              <th className="px-4 py-2">Rank</th>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Branch / Year</th>
              <th className="px-4 py-2 text-right">Points</th>
            </tr>
          </thead>
          <tbody>
            {data?.entries.map((entry) => (
              <tr key={entry.user._id} className={`border-t border-gray-200 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800/60 ${currentUser?.prn === entry.user.prn ? 'bg-brand-500/10' : ''}`}>
                <td className="px-4 py-2 font-semibold text-gray-900 dark:text-gray-100">#{entry.rank}</td>
                <td className="px-4 py-2 font-medium text-gray-900 dark:text-gray-100">{entry.user.name}</td>
                <td className="px-4 py-2 text-gray-600 dark:text-gray-300">
                  {entry.user.branch} · {entry.user.year}
                </td>
                <td className="px-4 py-2 text-right font-semibold text-gray-900 dark:text-gray-100">{entry.totalPoints}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* TODO (owner of this module): semester picker, link to /leaderboard/history,
          individual user profile view (GET /leaderboard/users/:userId) */}
    </div>
  );
}
