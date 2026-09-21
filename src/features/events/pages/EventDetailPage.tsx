import { useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { cancelRegistration, getEventById, registerForEvent } from '../api';
import { Card, ErrorMessage, Spinner, StatusBadge } from '@/components/ui/Feedback';
import { useAuthStore } from '@/store/auth';
import { ClubLogo } from '@/components/ui/ClubLogo';

export function EventDetailPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuthStore();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['events', eventId],
    queryFn: () => getEventById(eventId!),
    enabled: !!eventId,
  });

  const registerMutation = useMutation({
    mutationFn: () => registerForEvent(eventId!),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['events', eventId] }),
  });

  const cancelMutation = useMutation({
    mutationFn: () => cancelRegistration(eventId!),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['events', eventId] }),
  });

  if (isLoading) return <Spinner />;
  if (isError || !data) return <ErrorMessage message="Failed to load event." />;

  const { event, userRegistration } = data;
  const isFull = event.registeredCount >= event.capacity;

  return (
    <div className="mx-auto max-w-2xl">
      {event.bannerUrl && (
        <img src={event.bannerUrl} alt="" className="mb-4 h-56 w-full rounded-lg object-cover" />
      )}

      <div className="mb-2 flex items-center justify-between">
        <span className="flex items-center gap-2 text-sm text-gray-500"><ClubLogo club={event.clubId} size="sm" />{event.clubId.name}</span>
        <StatusBadge status={event.status} />
      </div>

      <h1 className="mb-2 text-2xl font-bold">{event.title}</h1>
      <p className="mb-4 text-gray-700">{event.description}</p>

      <Card className="mb-4 space-y-1 text-sm">
        <p>
          <span className="text-gray-500">Venue:</span> {event.venue} ({event.mode})
        </p>
        <p>
          <span className="text-gray-500">Starts:</span> {new Date(event.startDate).toLocaleString()}
        </p>
        <p>
          <span className="text-gray-500">Registration deadline:</span>{' '}
          {new Date(event.registrationDeadline).toLocaleString()}
        </p>
        <p>
          <span className="text-gray-500">Capacity:</span> {event.registeredCount}/{event.capacity}
        </p>
      </Card>

      {!isAuthenticated && <ErrorMessage message="Log in to register for this event." />}

      {isAuthenticated && event.status === 'PUBLISHED' && (
        <>
          {userRegistration && userRegistration.status === 'REGISTERED' ? (
            <div>
              <p className="mb-2 text-sm text-green-700">
                You're registered! Ticket: {userRegistration.ticketCode}
              </p>
              <button
                onClick={() => cancelMutation.mutate()}
                disabled={cancelMutation.isPending}
                className="rounded-md border border-red-300 px-4 py-2 text-sm text-red-700 hover:bg-red-50"
              >
                Cancel registration
              </button>
            </div>
          ) : (
            <button
              onClick={() => registerMutation.mutate()}
              disabled={registerMutation.isPending || isFull}
              className="rounded-md bg-brand-600 px-4 py-2 text-sm text-white hover:bg-brand-700 disabled:opacity-50"
            >
              {isFull ? 'Event full' : registerMutation.isPending ? 'Registering...' : 'Register'}
            </button>
          )}
          {registerMutation.isError && <ErrorMessage message="Registration failed." />}
        </>
      )}

      {/* TODO (owner of this module): organizer check-in UI (POST /events/:id/check-in),
          create/approve/delist actions gated with lib/permissions helpers */}
    </div>
  );
}
