import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/auth';

const NAV_LINKS = [
  { to: '/clubs', label: 'Clubs' },
  { to: '/events', label: 'Events' },
  { to: '/achievements', label: 'Achievements' },
  { to: '/leaderboard', label: 'Leaderboard' },
];

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="border-b bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="text-lg font-bold text-brand-600">
          CESA-SDW Portal
        </Link>

        <div className="hidden gap-6 md:flex">
          {NAV_LINKS.map((link) => (
            <Link key={link.to} to={link.to} className="text-sm text-gray-700 hover:text-brand-600">
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <Link to="/profile" className="text-sm font-medium text-gray-800">
                {user?.name}
              </Link>
              <button
                onClick={handleLogout}
                className="rounded-md border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="rounded-md bg-brand-600 px-3 py-1.5 text-sm text-white hover:bg-brand-700"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
