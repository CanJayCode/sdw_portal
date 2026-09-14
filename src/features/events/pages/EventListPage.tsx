import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { getEvents } from '../api';
import { Card, ErrorMessage, Spinner, StatusBadge } from '@/components/ui/Feedback';

export function EventListPage() {
  const [upcomingOnly, setUpcomingOnly] = useState(true);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['events', { upcoming: upcomingOnly }],
    queryFn: () => getEvents({ upcoming: upcomingOnly, limit: 20 }),
  });

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Events</h1>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={upcomingOnly}
            onChange={(e) => setUpcomingOnly(e.target.checked)}
          />
          Upcoming only
        </label>
      </div>

      {isLoading && <Spinner />}
      {isError && <ErrorMessage message="Failed to load events." />}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {data?.events.map((event) => (
          <Link key={event._id} to={`/events/${event._id}`}>
            <Card className="h-full hover:border-brand-400">
              {event.bannerUrl && (
                <img src={event.bannerUrl} alt="" className="mb-2 h-32 w-full rounded-md object-cover" />
              )}
              <div className="mb-1 flex items-center justify-between">
                <span className="text-xs text-gray-500">{event.clubId.code}</span>
                <StatusBadge status={event.status} />
              </div>
              <p className="font-semibold">{event.title}</p>
              <p className="text-xs text-gray-500">
                {new Date(event.startDate).toLocaleDateString()} · {event.venue}
              </p>
              <p className="mt-1 text-xs text-gray-500">
                {event.registeredCount}/{event.capacity} registered
              </p>
            </Card>
          </Link>
        ))}
      </div>

      {/* TODO (owner of this module): pagination controls using data.meta, clubId filter dropdown */}
    </div>
  );
}
