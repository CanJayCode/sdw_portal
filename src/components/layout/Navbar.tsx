import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/auth';
import { hasPermissionAnywhere } from '@/lib/permissions';

const PUBLIC_NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/clubs', label: 'Clubs' },
  { to: '/events', label: 'Events' },
  { to: '/leaderboard', label: 'Leaderboard' },
];

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const auth = useAuthStore((s) => s.auth);
  const navigate = useNavigate();

  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem('theme') === 'dark'
  );

  useEffect(() => {
    const root = document.documentElement;

    if (darkMode) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = isAuthenticated
    ? [...PUBLIC_NAV_LINKS, { to: '/achievements', label: 'Achievements' }]
    : PUBLIC_NAV_LINKS;

  return (
    <nav className="border-b border-gray-200 bg-white transition-colors dark:border-gray-800 dark:bg-gray-900">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link
          to="/"
          className="text-lg font-bold text-brand-600"
        >
          CESA-SDW Portal
        </Link>

        <div className="hidden gap-6 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="text-sm text-gray-700 hover:text-brand-600 dark:text-gray-300 dark:hover:text-brand-400"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setDarkMode((value) => !value)}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
          >
            {darkMode ? '☀️ Light' : '🌙 Dark'}
          </button>

          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400">
                Dashboard
              </Link>
              {(hasPermissionAnywhere(auth, 'CREATE_EVENT') ||
                hasPermissionAnywhere(auth, 'EDIT_EVENT') ||
                hasPermissionAnywhere(auth, 'DELETE_EVENT_CESA')) && (
                <Link to="/admin" className="text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400">
                  Admin
                </Link>
              )}
              <Link
                to="/profile"
                className="text-sm font-medium text-gray-800 dark:text-gray-200"
              >
                {user?.name}
              </Link>

              <button
                onClick={handleLogout}
                className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
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