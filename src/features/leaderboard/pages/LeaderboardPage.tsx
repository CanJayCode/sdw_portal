import { useQuery } from '@tanstack/react-query';
import { getCurrentSemester, getLeaderboard } from '../api';
import { ErrorMessage, Spinner } from '@/components/ui/Feedback';

export function LeaderboardPage() {
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

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs uppercase text-gray-600 dark:bg-gray-800 dark:text-gray-300">
            <tr>
              <th className="px-4 py-2">Rank</th>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Branch / Year</th>
              <th className="px-4 py-2 text-right">Points</th>
            </tr>
          </thead>
          <tbody>
            {data?.entries.map((entry) => (
              <tr key={entry.user._id} className="border-t border-gray-200 dark:border-gray-700">
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
