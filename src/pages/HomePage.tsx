import { Link } from 'react-router-dom';
import { useAuthStore } from '@/store/auth';

export function HomePage() {
  const { isAuthenticated, user } = useAuthStore();

  return (
    <div className="relative mx-auto max-w-3xl overflow-hidden py-20 text-center sm:py-28">
      <div className="pointer-events-none absolute left-1/2 top-8 h-64 w-64 -translate-x-1/2 rounded-full bg-brand-500/10 blur-3xl" />
      <p className="relative mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-brand-500">Campus activity, in one place</p>
      <h1 className="relative mb-4 text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-5xl">CESA-SDW Portal</h1>

      <p className="relative mx-auto mb-8 max-w-xl text-base leading-7 text-gray-600 dark:text-gray-300 sm:text-lg">
        {(isAuthenticated && !((user?.name) == "Guest User"))
          ? `Welcome back, ${user?.name}.`
          : 'Log in to register for events, track achievements, and view the leaderboard.'}
      </p>

      <div className="relative flex flex-wrap justify-center gap-3">
        <Link
          to="/events"
          className="ui-button-primary"
        >
          Browse Events
        </Link>

        <Link
          to="/leaderboard"
          className="ui-button-secondary"
        >
          Leaderboard
        </Link>
      </div>
    </div>
  );
}
