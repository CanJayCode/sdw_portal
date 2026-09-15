import { Link } from 'react-router-dom';
import { useAuthStore } from '@/store/auth';

export function HomePage() {
  const { isAuthenticated, user } = useAuthStore();

  return (
    <div className="mx-auto max-w-2xl py-12 text-center">
      <h1 className="mb-2 text-3xl font-bold">CESA-SDW Portal</h1>

      <p className="mb-6 text-gray-600 dark:text-gray-300">
        {isAuthenticated
          ? `Welcome back, ${user?.name}.`
          : 'Log in to register for events, track achievements, and view the leaderboard.'}
      </p>

      <div className="flex justify-center gap-3">
        <Link
          to="/events"
          className="rounded-md bg-brand-600 px-4 py-2 text-sm text-white hover:bg-brand-700"
        >
          Browse Events
        </Link>

        <Link
          to="/leaderboard"
          className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-900 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-100 dark:hover:bg-gray-800"
        >
          Leaderboard
        </Link>
      </div>
    </div>
  );
}