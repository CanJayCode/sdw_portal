import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { getEvents } from '../api';
import { Card, ErrorMessage, Spinner, StatusBadge } from '@/components/ui/Feedback';
import { ClubLogo } from '@/components/ui/ClubLogo';

export function EventListPage() {
  const [upcomingOnly, setUpcomingOnly] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('ALL');

  const { data, isLoading, isError } = useQuery({
    queryKey: ['events', { upcoming: upcomingOnly }],
    queryFn: () => getEvents({ upcoming: upcomingOnly, limit: 20 }),
  });

  const categories = Array.from(new Set(data?.events.map((event) => event.category).filter(Boolean) ?? []));
  const filteredEvents = data?.events.filter((event) => {
    const matchesSearch = `${event.title} ${event.description} ${event.clubId.name} ${event.venue}`
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesCategory = category === 'ALL' || event.category === category;
    return matchesSearch && matchesCategory;
  });

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">Events</h1>
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <input aria-label="Search events" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search events" className="px-3 py-2" />
          {categories.length > 0 && (
            <select aria-label="Filter by category" value={category} onChange={(event) => setCategory(event.target.value)} className="px-3 py-2">
              <option value="ALL">All categories</option>
              {categories.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          )}
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={upcomingOnly} onChange={(e) => setUpcomingOnly(e.target.checked)} />
            Upcoming only
          </label>
        </div>
      </div>

      {isLoading && <Spinner />}
      {isError && <ErrorMessage message="Failed to load events." />}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredEvents?.map((event) => (
          <Link key={event._id} to={`/events/${event._id}`}>
            <Card className="h-full hover:border-brand-400">
              {event.bannerUrl && (
                <img src={event.bannerUrl} alt="" className="mb-2 h-32 w-full rounded-md object-cover" />
              )}
              <div className="mb-1 flex items-center justify-between gap-2">
                <span className="flex items-center gap-2 text-xs text-gray-500"><ClubLogo club={event.clubId} size="sm" />{event.clubId.code}</span>
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
      {filteredEvents?.length === 0 && <p className="mt-6 text-sm text-gray-500">No events match your filters.</p>}
    </div>
  );
}
