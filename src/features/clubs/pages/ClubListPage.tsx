import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { getClubs } from '../api';
import { Card, ErrorMessage, Spinner } from '@/components/ui/Feedback';
import { ClubLogo } from '@/components/ui/ClubLogo';

export function ClubListPage() {
  const [search, setSearch] = useState('');
  const { data: clubs, isLoading, isError } = useQuery({
    queryKey: ['clubs'],
    queryFn: getClubs,
  });

  if (isLoading) return <Spinner />;
  if (isError) return <ErrorMessage message="Failed to load clubs." />;

  const filteredClubs = clubs?.filter((club) =>
    `${club.name} ${club.code} ${club.description}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">Clubs</h1>
        <input
          aria-label="Search clubs"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search clubs"
          className="w-full max-w-xs px-3 py-2 text-sm"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredClubs?.map((club) => (
          <Link key={club._id} to={`/clubs/${club._id}`}>
            <Card className="h-full hover:border-brand-400">
              <div className="flex items-center gap-3">
                <ClubLogo club={club} />
                <div>
                  <p className="font-semibold">{club.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{club.code}</p>
                </div>
              </div>
              <p className="mt-2 line-clamp-2 text-sm text-gray-600 dark:text-gray-300">{club.description}</p>
              {club.isCoordinator && (
                <span className="mt-2 inline-block rounded-full bg-brand-100 px-2 py-0.5 text-xs text-brand-700">
                  CESA Coordinator
                </span>
              )}
            </Card>
          </Link>
        ))}
      </div>
      {filteredClubs?.length === 0 && <p className="mt-6 text-sm text-gray-500">No clubs match your search.</p>}
    </div>
  );
}
