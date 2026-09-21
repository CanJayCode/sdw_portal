import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getClubById } from '../api';
import { Card, ErrorMessage, Spinner } from '@/components/ui/Feedback';
import { ClubLogo } from '@/components/ui/ClubLogo';

export function ClubDetailPage() {
  const { clubId } = useParams<{ clubId: string }>();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['clubs', clubId],
    queryFn: () => getClubById(clubId!),
    enabled: !!clubId,
  });

  if (isLoading) return <Spinner />;
  if (isError || !data) return <ErrorMessage message="Failed to load club." />;

  const { club, stats } = data;

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-4 flex items-center gap-4">
        <ClubLogo club={club} size="lg" />
        <div>
          <h1 className="text-2xl font-bold">{club.name}</h1>
          <p className="text-sm text-gray-500">{club.code}</p>
        </div>
      </div>

      <Card className="mb-4">
        <p className="text-sm text-gray-700">{club.description}</p>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <p className="text-2xl font-bold">{stats.activeMembersCount}</p>
          <p className="text-sm text-gray-500">Active members</p>
        </Card>
        <Card>
          <p className="text-2xl font-bold">{stats.upcomingEventsCount}</p>
          <p className="text-sm text-gray-500">Upcoming events</p>
        </Card>
      </div>

      {/* TODO (owner of this module): list club's upcoming events, member roster (GET /clubs/:id/roles), etc. */}
    </div>
  );
}
