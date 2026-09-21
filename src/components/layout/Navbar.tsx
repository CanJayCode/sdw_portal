import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/auth';
import { hasPermissionAnywhere } from '@/lib/permissions';

const PUBLIC_NAV_LINKS = [
  { to: '/', label: 'Home', icon: '🏠' },
  { to: '/clubs', label: 'Clubs', icon: '🏢' },
  { to: '/events', label: 'Events', icon: '📅' },
  { to: '/leaderboard', label: 'Leaderboard', icon: '🏆' },
];

const MOBILE_NAV_LINKS = [
  ...PUBLIC_NAV_LINKS,
  { to: '/achievements', label: 'Achievements', icon: '⭐' },
  { to: '/notifications', label: 'Alerts', icon: '🔔' },
  { to: '/profile', label: 'Profile', icon: '👤' },
];

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const auth = useAuthStore((s) => s.auth);
  const location = useLocation();
  const navigate = useNavigate();

  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem('theme') !== 'light'
  );

  const [menuOpen, setMenuOpen] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);

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

  useEffect(() => {
    if (!menuOpen) {
      setDrawerVisible(false);
      return;
    }

    const animationFrame = window.requestAnimationFrame(() => {
      setDrawerVisible(true);
    });

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };

    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', closeOnEscape);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      setDrawerVisible(false);
      document.body.style.overflow = '';
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [menuOpen]);

  const handleLogout = () => {
    setMenuOpen(false);
    logout();
    navigate('/login');
  };

  const navLinks = isAuthenticated ? MOBILE_NAV_LINKS : PUBLIC_NAV_LINKS;

  const canAccessAdmin =
    hasPermissionAnywhere(auth, 'CREATE_EVENT') ||
    hasPermissionAnywhere(auth, 'EDIT_EVENT') ||
    hasPermissionAnywhere(auth, 'DELETE_EVENT_CESA');

  const isActiveLink = (path: string) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  return (
    <>
      <nav className="relative z-50 border-b border-gray-200 bg-white/85 shadow-sm backdrop-blur-xl transition-colors dark:border-gray-800 dark:bg-gray-900/80 md:sticky md:top-0 md:mx-3 md:mt-3 md:rounded-2xl md:border md:shadow-lg">
        <div className="mx-auto flex min-h-[64px] w-full max-w-6xl items-center justify-between gap-2 overflow-hidden px-4 py-3 sm:gap-3 md:px-5 lg:px-6">

          {/* Logo */}
          <Link
            to="/"
            onClick={() => setMenuOpen(false)}
            className="min-w-0 truncate text-base font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-lg"
          >
            CESA-SDW Portal
          </Link>

          {/* Desktop navigation */}
          <div className="hidden min-w-0 items-center gap-1 md:flex lg:gap-3">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                aria-current={isActiveLink(link.to) ? 'page' : undefined}
                className={`whitespace-nowrap rounded-md px-2 py-2 text-sm transition-colors lg:px-3 ${
                  isActiveLink(link.to)
                    ? 'bg-brand-50 font-medium text-brand-700 dark:bg-gray-800 dark:text-brand-300'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-brand-600 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-brand-400'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex shrink-0 items-center gap-2">

            {/* Theme */}
          <button
              type="button"
              onClick={() => setDarkMode((value) => !value)}
              aria-label="Toggle theme"
              className="rounded-md border border-gray-300 px-2.5 py-1.5 text-sm text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800 sm:px-3"
            >
              {darkMode ? '☀️' : '🌙'}
              <span className="hidden lg:inline">
                {darkMode ? ' Light' : ' Dark'}
              </span>
            </button>

            {/* Desktop auth controls */}
            <div className="hidden items-center gap-2 md:flex lg:gap-3">
              {isAuthenticated ? (
                <>
                  <Link
                    to="/dashboard"
                    className="whitespace-nowrap text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400"
                  >
                    Dashboard
                  </Link>

                  {canAccessAdmin && (
                    <Link
                      to="/admin"
                      className="whitespace-nowrap text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400"
                    >
                      Admin
                    </Link>
                  )}

                  <Link
                    to="/profile"
                    className="max-w-[72px] truncate text-sm font-medium text-gray-800 dark:text-gray-200 lg:max-w-[120px]"
                  >
                    {user?.name}
                  </Link>

                  <button
                    type="button"
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

            {/* Mobile menu button */}
            <button
              type="button"
              onClick={() => setMenuOpen((value) => !value)}
              aria-label="Toggle navigation menu"
              aria-expanded={menuOpen}
              className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-gray-300 text-xl text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800 md:hidden"
            >
              {menuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile drawer */}
      {menuOpen && (
        <>
          {/* Background overlay */}
          <button
            type="button"
            aria-label="Close navigation"
            onClick={() => setMenuOpen(false)}
            className={`fixed inset-0 z-40 bg-black/40 transition-opacity duration-200 md:hidden ${
              drawerVisible ? 'opacity-100' : 'opacity-0'
            }`}
          />

          {/* Left panel */}
          <aside className={`fixed left-0 top-0 z-50 flex h-full w-[270px] max-w-[80vw] flex-col rounded-r-2xl border-r border-gray-200 bg-white/95 shadow-xl backdrop-blur-xl transition-transform duration-200 ease-out dark:border-gray-800 dark:bg-gray-900/95 md:hidden ${
            drawerVisible ? 'translate-x-0' : '-translate-x-full'
          }`}>

            {/* Panel header */}
            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4 dark:border-gray-800">
              <span className="font-bold text-brand-600">
                CESA-SDW Portal
              </span>

              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                className="text-xl text-gray-600 dark:text-gray-300"
                aria-label="Close menu"
              >
                ✕
              </button>
            </div>

            {/* Navigation */}
            <div className="flex flex-1 flex-col gap-1 overflow-y-auto p-4">
              {MOBILE_NAV_LINKS.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-brand-600 dark:text-gray-200 dark:hover:bg-gray-800 dark:hover:text-brand-400"
                >
                  <span className="text-lg">{link.icon}</span>
                  {link.label}
                </Link>
              ))}

              <div className="my-3 border-t border-gray-200 dark:border-gray-800" />

              {isAuthenticated ? (
                <>
                  <Link
                    to="/dashboard"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
                  >
                    📊 Dashboard
                  </Link>

                  {canAccessAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
                    >
                      ⚙️ Admin
                    </Link>
                  )}

                  <Link
                    to="/profile"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
                  >
                    👤 Profile
                  </Link>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="mt-2 rounded-lg border border-gray-300 px-4 py-3 text-left text-sm font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
                  >
                    🚪 Logout
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMenuOpen(false)}
                  className="mt-2 rounded-lg bg-brand-600 px-4 py-3 text-center text-sm font-medium text-white hover:bg-brand-700"
                >
                  Login
                </Link>
              )}
            </div>
          </aside>
        </>
      )}
    </>
  );
}