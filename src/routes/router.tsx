import { createBrowserRouter } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { HomePage } from '@/pages/HomePage';
import { NotFoundPage, UnauthorizedPage } from '@/pages/StatusPages';

import { LoginPage } from '@/features/auth/pages/LoginPage';
import { RegisterPage } from '@/features/auth/pages/RegisterPage';
import { ProfilePage } from '@/features/auth/pages/ProfilePage';

import { ClubListPage } from '@/features/clubs/pages/ClubListPage';
import { ClubDetailPage } from '@/features/clubs/pages/ClubDetailPage';

import { EventListPage } from '@/features/events/pages/EventListPage';
import { EventDetailPage } from '@/features/events/pages/EventDetailPage';

import { AchievementsPage } from '@/features/achievements/pages/AchievementsPage';
import { LeaderboardPage } from '@/features/leaderboard/pages/LeaderboardPage';
import { MembersPage } from '@/features/members/pages/MembersPage';
import { NotificationsPage } from '@/features/notifications/pages/NotificationsPage';
import { AuditLogsPage } from '@/features/audit-logs/pages/AuditLogsPage';

// -----------------------------------------------------------------------
// NOTE FOR THE TEAM:
// This is the ONLY file where new pages get registered as routes.
// When you build your module's pages, add them here inside a small PR
// hunk — this keeps merge conflicts to a few lines instead of whole files.
// -----------------------------------------------------------------------

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
      { path: 'unauthorized', element: <UnauthorizedPage /> },

      // Public / optional-auth routes
      { path: 'clubs', element: <ClubListPage /> },
      { path: 'clubs/:clubId', element: <ClubDetailPage /> },
      { path: 'events', element: <EventListPage /> },
      { path: 'events/:eventId', element: <EventDetailPage /> },
      { path: 'leaderboard', element: <LeaderboardPage /> },

      // Authenticated-only routes
      {
        element: <ProtectedRoute />,
        children: [
          { path: 'profile', element: <ProfilePage /> },
          { path: 'achievements', element: <AchievementsPage /> },
          { path: 'members', element: <MembersPage /> },
          { path: 'notifications', element: <NotificationsPage /> },
        ],
      },

      // CESA-admin-only routes (example of a permission-gated route)
      {
        element: <ProtectedRoute requireCesaAdmin />,
        children: [{ path: 'audit-logs', element: <AuditLogsPage /> }],
      },

      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);
