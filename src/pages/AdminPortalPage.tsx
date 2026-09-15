import { useState, type FormEvent } from 'react';
import axios from 'axios';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/auth';
import { canPerformInClub, hasPermissionAnywhere } from '@/lib/permissions';
import { createEvent, approveEvent, delistEvent, getClubEvents } from '@/features/events/api';
import type { EventMode } from '@/types/api';
import { Card, ErrorMessage, Spinner, StatusBadge } from '@/components/ui/Feedback';

const initialForm = {
  title: '',
  description: '',
  bannerUrl: '',
  venue: '',
  mode: 'OFFLINE' as EventMode,
  startDate: '',
  endDate: '',
  registrationDeadline: '',
  capacity: '50',
};

const mutationErrorMessage = (error: unknown, fallback: string) => {
  if (!axios.isAxiosError(error)) return fallback;
  const response = error.response?.data as { message?: string; errors?: Array<{ field?: string; message?: string }> } | undefined;
  const details = response?.errors?.map((item) => `${item.field}: ${item.message}`).join(', ');
  return details ? `${response?.message ?? fallback}: ${details}` : response?.message ?? fallback;
};

export function AdminPortalPage() {
  const { auth } = useAuthStore();
  const queryClient = useQueryClient();
  const memberships = auth?.memberships ?? [];
  const [clubId, setClubId] = useState(memberships[0]?.clubId ?? '');
  const [form, setForm] = useState(initialForm);
  const [message, setMessage] = useState('');

  const canCreate = clubId ? canPerformInClub(auth, clubId, 'CREATE_EVENT') : false;
  const canApprove = clubId ? canPerformInClub(auth, clubId, 'EDIT_EVENT') : false;
  const canDelist = hasPermissionAnywhere(auth, 'DELETE_EVENT_CESA');

  const eventsQuery = useQuery({
    queryKey: ['admin', 'events', clubId],
    queryFn: () => getClubEvents(clubId, { limit: 50 }),
    enabled: Boolean(clubId),
  });

  const refreshEvents = () => {
    queryClient.invalidateQueries({ queryKey: ['admin', 'events', clubId] });
    queryClient.invalidateQueries({ queryKey: ['events'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
  };

  const createMutation = useMutation({
    mutationFn: () =>
      createEvent(clubId, {
        title: form.title,
        description: form.description,
        bannerUrl: form.bannerUrl,
        venue: form.venue,
        mode: form.mode,
        startDate: new Date(form.startDate).toISOString(),
        endDate: new Date(form.endDate).toISOString(),
        registrationDeadline: new Date(form.registrationDeadline).toISOString(),
        capacity: Number(form.capacity),
      }),
    onSuccess: () => {
      setForm(initialForm);
      setMessage('Activity created and sent through the club approval workflow.');
      refreshEvents();
    },
  });

  const approveMutation = useMutation({
    mutationFn: (eventId: string) => approveEvent(clubId, eventId),
    onSuccess: () => {
      setMessage('Activity approved and published.');
      refreshEvents();
    },
  });

  const delistMutation = useMutation({
    mutationFn: (eventId: string) => delistEvent(clubId, eventId, 'Removed by club administrator.'),
    onSuccess: () => {
      setMessage('Activity delisted and registrations were handled by the server.');
      refreshEvents();
    },
  });

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage('');
    createMutation.mutate();
  };

  if (!hasPermissionAnywhere(auth, 'CREATE_EVENT') && !hasPermissionAnywhere(auth, 'EDIT_EVENT') && !canDelist) {
    return (
      <Card>
        <h1 className="text-xl font-bold">Club management</h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
          Your account does not have permission to manage club activities.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-medium text-brand-600 dark:text-brand-400">Admin portal</p>
        <h1 className="mt-1 text-2xl font-bold">Club activity management</h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
          Create and review activities for clubs where your role grants access.
        </p>
      </div>

      <div className="max-w-sm">
        <label className="mb-1 block text-sm font-medium" htmlFor="managed-club">Managed club</label>
        <select
          id="managed-club"
          value={clubId}
          onChange={(event) => setClubId(event.target.value)}
          className="w-full rounded-md border bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900"
        >
          {memberships.map((membership) => (
            <option key={membership.clubId} value={membership.clubId}>{membership.clubName}</option>
          ))}
        </select>
      </div>

      {message && <p className="rounded-md bg-green-50 px-4 py-3 text-sm text-green-700 dark:bg-green-950 dark:text-green-300">{message}</p>}
      {createMutation.isError && <ErrorMessage message={mutationErrorMessage(createMutation.error, 'The activity could not be created.')} />}
      {approveMutation.isError && <ErrorMessage message={mutationErrorMessage(approveMutation.error, 'The activity could not be approved.')} />}
      {delistMutation.isError && <ErrorMessage message={mutationErrorMessage(delistMutation.error, 'The activity could not be delisted.')} />}

      {canCreate && (
        <Card>
          <h2 className="text-lg font-bold">Create an activity</h2>
          <form onSubmit={submit} className="mt-4 grid gap-4 sm:grid-cols-2">
            <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Activity title" className="rounded-md border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900" />
            <input required value={form.venue} onChange={(e) => setForm({ ...form, venue: e.target.value })} placeholder="Venue or meeting link" className="rounded-md border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900" />
            <input type="url" value={form.bannerUrl} onChange={(e) => setForm({ ...form, bannerUrl: e.target.value })} placeholder="Banner image URL (optional)" className="rounded-md border px-3 py-2 text-sm sm:col-span-2 dark:border-gray-700 dark:bg-gray-900" />
            <textarea required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description" className="min-h-24 rounded-md border px-3 py-2 text-sm sm:col-span-2 dark:border-gray-700 dark:bg-gray-900" />
            <select value={form.mode} onChange={(e) => setForm({ ...form, mode: e.target.value as EventMode })} className="rounded-md border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900">
              <option value="OFFLINE">Offline</option>
              <option value="ONLINE">Online</option>
              <option value="HYBRID">Hybrid</option>
            </select>
            <input required min="1" type="number" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} placeholder="Capacity" className="rounded-md border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900" />
            <label className="text-sm">Starts<input required type="datetime-local" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className="mt-1 w-full rounded-md border px-3 py-2 dark:border-gray-700 dark:bg-gray-900" /></label>
            <label className="text-sm">Ends<input required type="datetime-local" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} className="mt-1 w-full rounded-md border px-3 py-2 dark:border-gray-700 dark:bg-gray-900" /></label>
            <label className="text-sm sm:col-span-2">Registration deadline<input required type="datetime-local" value={form.registrationDeadline} onChange={(e) => setForm({ ...form, registrationDeadline: e.target.value })} className="mt-1 w-full rounded-md border px-3 py-2 dark:border-gray-700 dark:bg-gray-900" /></label>
            <button disabled={createMutation.isPending} className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50 sm:col-span-2">{createMutation.isPending ? 'Creating...' : 'Create activity'}</button>
          </form>
        </Card>
      )}

      <section>
        <h2 className="mb-4 text-lg font-bold">Activities</h2>
        {eventsQuery.isLoading && <Spinner />}
        {eventsQuery.isError && <ErrorMessage message="Failed to load club activities." />}
        <div className="space-y-3">
          {eventsQuery.data?.events.map((event) => (
            <Card key={event._id} className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="font-semibold">{event.title}</p>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{new Date(event.startDate).toLocaleString()}</p>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={event.status} />
                {canApprove && event.status === 'PENDING_APPROVAL' && <button onClick={() => approveMutation.mutate(event._id)} className="rounded-md bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700">Approve</button>}
                {canDelist && event.status === 'PUBLISHED' && <button onClick={() => delistMutation.mutate(event._id)} className="rounded-md border border-red-300 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-950">Delist</button>}
              </div>
            </Card>
          ))}
        </div>
        <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
          Activity editing is not exposed by the current backend API. The portal supports the available create, approve, and delist workflow.
        </p>
      </section>
    </div>
  );
}