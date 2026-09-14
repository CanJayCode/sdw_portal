import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { getClubs } from '../api';
import { Card, ErrorMessage, Spinner } from '@/components/ui/Feedback';

export function ClubListPage() {
  const { data: clubs, isLoading, isError } = useQuery({
    queryKey: ['clubs'],
    queryFn: getClubs,
  });

  if (isLoading) return <Spinner />;
  if (isError) return <ErrorMessage message="Failed to load clubs." />;

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Clubs</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {clubs?.map((club) => (
          <Link key={club._id} to={`/clubs/${club._id}`}>
            <Card className="h-full hover:border-brand-400">
              <div className="flex items-center gap-3">
                {club.logoUrl && <img src={club.logoUrl} alt="" className="h-10 w-10 rounded-full" />}
                <div>
                  <p className="font-semibold">{club.name}</p>
                  <p className="text-xs text-gray-500">{club.code}</p>
                </div>
              </div>
              <p className="mt-2 line-clamp-2 text-sm text-gray-600">{club.description}</p>
              {club.isCoordinator && (
                <span className="mt-2 inline-block rounded-full bg-brand-100 px-2 py-0.5 text-xs text-brand-700">
                  CESA Coordinator
                </span>
              )}
            </Card>
          </Link>
        ))}
      </div>

      {/* TODO (owner of this module): add empty state, search/filter if needed */}
    </div>
  );
}
