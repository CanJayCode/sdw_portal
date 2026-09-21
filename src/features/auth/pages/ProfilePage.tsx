import { useAuthStore } from '@/store/auth';
import { Card } from '@/components/ui/Feedback';
import { ClubLogo } from '@/components/ui/ClubLogo';
import { Link, useNavigate } from 'react-router-dom';

export function ProfilePage() {
  const { user, auth, logout } = useAuthStore();
  const navigate = useNavigate();

  if (!user || !auth) return null;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold">My Profile</h1>

      <Card>
        <h2 className="mb-4 text-lg font-semibold">Student information</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <ProfileField label="Name" value={user.name} />
          <ProfileField label="Email" value={user.email} />
          <ProfileField label="PRN" value={user.prn} />
          <ProfileField label="Program / Department" value={user.branch} />
          <ProfileField label="Year" value={user.year} />
          {user.avatar && <ProfileField label="Profile image" value="Available" />}
        </div>
        <p className="mt-4 text-xs text-gray-500">Profile editing, semester, and about fields are not exposed by the current profile API.</p>
      </Card>

      <Card>
        <h2 className="mb-3 text-lg font-semibold">Club affiliations</h2>
        {auth.memberships.length === 0 && <p className="text-sm text-gray-500">No club memberships yet.</p>}
        <div className="space-y-3">
          {auth.memberships.map((m) => (
            <div key={m.clubId} className="flex items-center gap-3 rounded-md border p-3">
              <ClubLogo club={{ code: m.clubCode, name: m.clubName }} />
              <div>
                <p className="font-medium">{m.clubName}</p>
                <p className="text-sm text-gray-500">{m.roles.map((r) => r.name).join(', ') || 'Member'}</p>
                <p className="text-xs text-gray-500">{m.isCoordinator ? 'Coordinator' : 'Active member'}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <h2 className="mb-3 text-lg font-semibold">Account & preferences</h2>
        <div className="grid gap-2 sm:grid-cols-2">
          <Link to="/notifications" className="rounded-lg border px-4 py-3 text-sm hover:border-brand-400">Notification preferences</Link>
          <p className="rounded-lg border px-4 py-3 text-sm text-gray-500">Privacy & data controls are not exposed by the current API.</p>
          <p className="rounded-lg border px-4 py-3 text-sm text-gray-500">Help & CESA support contact is not exposed by the current API.</p>
          <button type="button" onClick={() => { logout(); navigate('/login'); }} className="rounded-lg border px-4 py-3 text-left text-sm hover:border-brand-400">Log out</button>
        </div>
      </Card>

      <Card>
        <h2 className="mb-3 text-lg font-semibold">Contributions & projects</h2>
        <p className="text-sm text-gray-500">Project and contribution records are not provided by the current backend contract.</p>
      </Card>
    </div>
  );
}

function ProfileField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}
