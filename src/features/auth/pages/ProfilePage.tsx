import { useAuthStore } from '@/store/auth';
import { Card } from '@/components/ui/Feedback';

export function ProfilePage() {
  const { user, auth } = useAuthStore();

  if (!user || !auth) return null;

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <h1 className="text-2xl font-bold">My Profile</h1>

      <Card>
        <p className="text-sm text-gray-500">Name</p>
        <p className="mb-3 font-medium">{user.name}</p>
        <p className="text-sm text-gray-500">PRN</p>
        <p className="mb-3 font-medium">{user.prn}</p>
        <p className="text-sm text-gray-500">Email</p>
        <p className="mb-3 font-medium">{user.email}</p>
        <p className="text-sm text-gray-500">Branch / Year</p>
        <p className="font-medium">
          {user.branch} — {user.year}
        </p>
      </Card>

      <Card>
        <h2 className="mb-3 font-semibold">Club Memberships</h2>
        {auth.memberships.length === 0 && <p className="text-sm text-gray-500">No club memberships yet.</p>}
        <div className="space-y-3">
          {auth.memberships.map((m) => (
            <div key={m.clubId} className="rounded-md border p-3">
              <p className="font-medium">{m.clubName}</p>
              <p className="text-sm text-gray-500">
                Roles: {m.roles.map((r) => r.name).join(', ') || 'Member'}
              </p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
