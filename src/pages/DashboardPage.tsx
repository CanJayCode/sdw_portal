import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/store/auth';
import { getEvents } from '@/features/events/api';
import { Card, ErrorMessage, Spinner, StatusBadge } from '@/components/ui/Feedback';

export function DashboardPage() {
  const { user, auth } = useAuthStore();
  const eventsQuery = useQuery({
    queryKey: ['dashboard', 'events'],
    queryFn: () => getEvents({ upcoming: true, limit: 6 }),
  });

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-2xl border border-brand-500/20 bg-gradient-to-br from-brand-700/90 via-ink-700 to-ink-800 px-6 py-8 text-white shadow-lg shadow-brand-950/20">
        <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-brand-500/20 blur-3xl" />
        <p className="relative text-sm font-medium text-brand-100">Student dashboard</p>
        <h1 className="relative mt-2 text-3xl font-bold tracking-tight">Welcome back, {user?.name}.</h1>
        <p className="relative mt-2 max-w-2xl text-brand-100">
          Keep track of your clubs, discover upcoming activities, and build your achievement record.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link to="/events" className="relative rounded-lg bg-white px-4 py-2 text-sm font-medium text-brand-700 transition-colors hover:bg-brand-50">
            Browse activities
          </Link>
          <Link to="/achievements" className="relative rounded-lg border border-white/20 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10">
            Manage achievements
          </Link>
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">My clubs</h2>
          <Link to="/clubs" className="text-sm font-medium text-brand-600 hover:underline dark:text-brand-400">
            Explore clubs
          </Link>
        </div>
        {auth?.memberships?.length ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {auth.memberships.map((membership) => (
              <Card key={membership.clubId}>
                <p className="font-semibold">{membership.clubName}</p>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{membership.clubCode}</p>
                <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">
                  {membership.roles.map((role) => role.name).join(', ') || 'Member'}
                </p>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <p className="font-medium">You have not joined a club yet.</p>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">Browse clubs to find a community that fits your interests.</p>
          </Card>
        )}
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">Upcoming activities</h2>
          <Link to="/events" className="text-sm font-medium text-brand-600 hover:underline dark:text-brand-400">
            View all
          </Link>
        </div>
        {eventsQuery.isLoading && <Spinner />}
        {eventsQuery.isError && <ErrorMessage message="Failed to load upcoming activities." />}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {eventsQuery.data?.events.map((event) => (
            <Link key={event._id} to={`/events/${event._id}`}>
              <Card className="h-full hover:border-brand-400">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs text-gray-500 dark:text-gray-400">{event.clubId.code}</p>
                  <StatusBadge status={event.status} />
                </div>
                <p className="mt-3 font-semibold">{event.title}</p>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                  {new Date(event.startDate).toLocaleDateString()} · {event.venue}
                </p>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}