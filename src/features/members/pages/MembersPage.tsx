import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { searchMembers } from '../api';
import { Card, ErrorMessage, Spinner } from '@/components/ui/Feedback';

// TODO (module owner): add member / modify roles / remove member forms,
// each gated with lib/permissions (EDIT_CLUB_MEMBERS / REMOVE_CLUB_MEMBERS).
// See docs/api.md section 10.

export function MembersPage() {
  const [name, setName] = useState('');

  const { data, isLoading, isError } = useQuery({
    queryKey: ['members', 'search', name],
    queryFn: () => searchMembers({ name: name || undefined, limit: 20 }),
  });

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Members</h1>

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
            <p className="font-medium">{m.name}</p>
            <p className="text-sm text-gray-500">
              {m.prn} · {m.email}
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
}
