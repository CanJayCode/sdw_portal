import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { addMember, removeMember, searchMembers } from '../api';
import { Card, ErrorMessage, Spinner } from '@/components/ui/Feedback';
import { useAuthStore } from '@/store/auth';
import { canPerformInClub } from '@/lib/permissions';

// TODO (module owner): add member / modify roles / remove member forms,
// each gated with lib/permissions (EDIT_CLUB_MEMBERS / REMOVE_CLUB_MEMBERS).
// See docs/api.md section 10.

export function MembersPage() {
  const { auth } = useAuthStore();
  const queryClient = useQueryClient();
  const managedClubs = (auth?.memberships ?? []).filter((membership) =>
    canPerformInClub(auth, membership.clubId, 'EDIT_CLUB_MEMBERS') ||
    canPerformInClub(auth, membership.clubId, 'REMOVE_CLUB_MEMBERS')
  );
  const [name, setName] = useState('');
  const [clubId, setClubId] = useState(managedClubs[0]?.clubId ?? '');

  const canEdit = clubId ? canPerformInClub(auth, clubId, 'EDIT_CLUB_MEMBERS') : false;
  const canRemove = clubId ? canPerformInClub(auth, clubId, 'REMOVE_CLUB_MEMBERS') : false;

  const { data, isLoading, isError } = useQuery({
    queryKey: ['members', 'search', name],
    queryFn: () => searchMembers({ name: name || undefined, clubId: clubId || undefined, limit: 20 }),
    enabled: Boolean(clubId),
  });

  const addMutation = useMutation({
    mutationFn: (userId: string) => addMember(clubId, userId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['members'] }),
  });

  const removeMutation = useMutation({
    mutationFn: (userId: string) => removeMember(clubId, userId, 'Removed by club administrator.'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['members'] }),
  });

  if (managedClubs.length === 0) {
    return (
      <Card>
        <h1 className="text-xl font-bold">Member management</h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
          Only authorized club executives can manage club members.
        </p>
      </Card>
    );
  }

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Members</h1>

      <select
        value={clubId}
        onChange={(e) => setClubId(e.target.value)}
        className="mb-4 w-full max-w-sm rounded-md border bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900"
      >
        {managedClubs.map((club) => <option key={club.clubId} value={club.clubId}>{club.clubName}</option>)}
      </select>

      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Search by name, PRN, or email"
        className="mb-4 w-full max-w-sm rounded-md border px-3 py-2 text-sm"
      />

      {isLoading && <Spinner />}
      {isError && <ErrorMessage message="Failed to search members." />}

      <div className="space-y-2">
        {data?.members.map((m) => (
          <Card key={m.id}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium">{m.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {m.prn} · {m.email}
                </p>
              </div>
              <div className="flex gap-2">
                {canEdit && <button onClick={() => addMutation.mutate(m.id)} className="rounded border border-brand-300 px-2 py-1 text-xs text-brand-700 dark:border-brand-700 dark:text-brand-300">Add</button>}
                {canRemove && <button onClick={() => removeMutation.mutate(m.id)} className="rounded border border-red-300 px-2 py-1 text-xs text-red-700 dark:border-red-800 dark:text-red-300">Remove</button>}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
