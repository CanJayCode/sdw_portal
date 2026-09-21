# CESA-SDW Portal — Project Documentation (`dev/PROJECT.md`)

This document provides a comprehensive breakdown of the CESA-SDW (Computer Engineering Student Association - Student Development Wing) frontend codebase, its architecture, directory organization, and the purpose and functionalities of every file.

---

## 1. High-Level Overview

The **CESA-SDW Portal** is a production-grade web application built with **React 18**, **TypeScript**, and **Vite**. It enables students, club members, club coordinators, documentation committee members, and CESA administrators to manage campus organizations, schedule and attend events, submit and review student achievements, track leaderboard points, and inspect organizational audit logs.

### Core Tech Stack
- **Framework & Build**: Vite, React 18, TypeScript (strict mode)
- **Routing**: React Router v6 (`createBrowserRouter`, nested routes, route-level permission guards)
- **Server State & Caching**: TanStack React Query v5 (`@tanstack/react-query`)
- **Client State**: Zustand (`zustand/middleware` with local storage persistence for session management)
- **HTTP Client**: Axios with automated request authentication and 401 refresh token interceptor
- **Form Management & Validation**: React Hook Form with Zod schemas (`@hookform/resolvers/zod`)
- **UI & Styling**: Tailwind CSS, PostCSS, Autoprefixer, Inter typography via `@fontsource/inter`

---

## 2. Codebase Structure Tree

```
sdw_portal/
├── dev/                                    # Developer, agent docs, and reference lists
│   ├── CONTEXT.md                          # Agent-friendly system context, execution rules, and domain guide
│   ├── PROJECT.md                          # Codebase structure, file catalog, and functionality index
│   └── PRN_list.csv                        # Combined student PRN list from SY_A-D and TY_rollcall PDFs
├── docs/                                   # Backend integration specifications
│   └── api.md                              # Complete REST API specification (v2.1)
├── public/                                 # Static assets served as-is
├── src/                                    # Main application source
│   ├── components/                         # Shared UI primitives and layout structures
│   │   ├── layout/
│   │   │   ├── AppLayout.tsx               # Master shell (conditionally displays Navbar, wraps Outlet)
│   │   │   └── Navbar.tsx                  # Top navigation bar with desktop/mobile links, guest mode, theme toggle
│   │   ├── ui/
│   │   │   ├── ClubLogo.tsx                # Dynamic club logo with fallback initials badge
│   │   │   └── Feedback.tsx                # Shared UI primitives: Spinner, ErrorMessage, Card, StatusBadge
│   │   └── ProtectedRoute.tsx              # Auth, guest-gating, club-scoped, and CESA-admin route guards
│   ├── features/                           # Domain modules (feature-first architecture)
│   │   ├── achievements/                   # Student achievement lifecycle and review queue
│   │   │   ├── components/
│   │   │   │   ├── AchievementCard.tsx     # Student achievement summary card
│   │   │   │   ├── AchievementForm.tsx     # Student and guest submission form with multi-evidence inputs
│   │   │   │   ├── AchievementStatus.tsx   # Visual status badge with tooltips/subtext
│   │   │   │   ├── ReviewCard.tsx          # Card view for documentation reviewers and secretaries
│   │   │   │   └── ReviewModal.tsx         # Multi-step review action modal (Approve, Reject, Request Evidence, Override)
│   │   │   ├── pages/
│   │   │   │   ├── AchievementDetailPage.tsx # Detailed view of submission, history, and evidence links
│   │   │   │   ├── AchievementReviewPage.tsx # Review queue workspace for ACM doc team and secretaries
│   │   │   │   ├── AchievementsPage.tsx    # Tabbed workspace (My Achievements, Submit, Guest, Review)
│   │   │   │   └── SubmitAchievementPage.tsx # Standalone submission page wrapper
│   │   │   ├── api.ts                      # Achievement HTTP endpoints (types, submit, review, evidence)
│   │   │   └── types.ts                    # Achievement domain models, schemas, and review types
│   │   ├── audit-logs/                     # CESA administrator audit trail
│   │   │   ├── pages/
│   │   │   │   └── AuditLogsPage.tsx       # Paginated, filterable audit event log table
│   │   │   └── api.ts                      # Audit log fetch endpoints and parameter types
│   │   ├── auth/                           # Authentication, registration, and user profiles
│   │   │   ├── pages/
│   │   │   │   ├── ForgotPasswordPage.tsx  # Institutional password reset request screen
│   │   │   │   ├── LoginPage.tsx           # PRN/Email login, Guest Mode entry, and password reset trigger
│   │   │   │   ├── ProfilePage.tsx         # Student profile details, club affiliations, and account links
│   │   │   │   └── RegisterPage.tsx        # Student registration form (PRN, branch, year, password)
│   │   │   └── api.ts                      # Auth API calls (login, register, logout, me, forgotPassword)
│   │   ├── clubs/                          # Campus student clubs
│   │   │   ├── pages/
│   │   │   │   ├── ClubDetailPage.tsx      # Club profile, statistics, coordinator info, and hosted events
│   │   │   │   └── ClubListPage.tsx        # Grid directory of all registered campus clubs
│   │   │   └── api.ts                      # Club list, club detail, and club roles endpoints
│   │   ├── events/                         # Events, workshops, and registrations
│   │   │   ├── pages/
│   │   │   │   ├── EventDetailPage.tsx     # Event schedule, venue, registration/ticket button, and check-in
│   │   │   │   └── EventListPage.tsx       # Filterable catalog of upcoming and past events
│   │   │   └── api.ts                      # Event queries, mutations, registration, approve, and delist APIs
│   │   ├── leaderboard/                    # Gamification and student points leaderboard
│   │   │   ├── pages/
│   │   │   │   └── LeaderboardPage.tsx     # Semester rankings, top-ranked students, and points breakdown
│   │   │   └── api.ts                      # Leaderboard points and semester query functions
│   │   ├── members/                        # Club membership management
│   │   │   ├── pages/
│   │   │   │   └── MembersPage.tsx         # Searchable directory of student members and club affiliations
│   │   │   └── api.ts                      # Member query, role assignment, and removal endpoints
│   │   └── notifications/                  # In-app alerts and notifications
│   │       ├── pages/
│   │       │   └── NotificationsPage.tsx   # Notification center (unread filters, mark read, mark all read)
│   │       └── api.ts                      # Notification listing, read status mutations, and preferences
│   ├── lib/                                # Shared foundational utilities and singletons
│   │   ├── api.ts                          # Configured Axios instance with bearer token and 401 refresh interceptors
│   │   ├── permissions.ts                  # Centralized RBAC permission verification functions
│   │   └── queryClient.ts                  # TanStack React Query Client singleton and default cache settings
│   ├── pages/                              # Top-level application views
│   │   ├── AdminPortalPage.tsx             # Club coordinator event administration, approval, and delisting
│   │   ├── DashboardPage.tsx               # Student dashboard (quick links, joined clubs, upcoming events)
│   │   ├── HomePage.tsx                    # Landing hero page welcoming authenticated students and guests
│   │   └── StatusPages.tsx                 # 404 Not Found and 403 Forbidden status screens
│   ├── routes/                             # Application routing
│   │   └── router.tsx                      # Master React Router configuration and route protection setup
│   ├── store/                              # Global Zustand client state stores
│   │   └── auth.ts                         # useAuthStore (user, tokens, session, guest mode, permissions)
│   ├── types/                              # Shared TypeScript types and contracts
│   │   └── api.ts                          # Backend payload types, models, enums, and API responses
│   ├── App.tsx                             # Application provider root (QueryClientProvider + RouterProvider)
│   ├── index.css                           # Tailwind directives, custom layer utilities, and typography
│   ├── main.tsx                            # React DOM entry point
│   └── vite-env.d.ts                       # Vite environment type declarations
├── CONTRIBUTING.md                         # Git workflow and module contribution guidelines
├── index.html                              # Single-page application HTML entry
├── package.json                            # Project dependencies, scripts, and engine specifications
├── postcss.config.js                       # PostCSS configuration for Tailwind CSS and Autoprefixer
├── README.md                               # Project quickstart and team overview
├── tailwind.config.js                      # Tailwind theme extensions (brand colors, ink palette, radius)
└── tsconfig.json                           # TypeScript compiler configuration and path aliases
```

---

## 3. Detailed Purpose of Each File & Functionalities

### 3.1 Root Configuration & Metadata Files

| File | Purpose & Functionality |
| :--- | :--- |
| [`package.json`](file:///home/rudy/Projects/sdw_portal/package.json) | Defines project metadata, npm dependencies (`react`, `react-router-dom`, `@tanstack/react-query`, `zustand`, `axios`, `zod`, `react-hook-form`, `tailwindcss`), and development scripts (`dev`, `build`, `lint`, `format`, `preview`). |
| [`vite.config.ts`](file:///home/rudy/Projects/sdw_portal/vite.config.ts) | Vite build tool configuration. Configures `@vitejs/plugin-react` and registers path alias `@` mapping to `/src`. |
| [`tsconfig.json`](file:///home/rudy/Projects/sdw_portal/tsconfig.json) | TypeScript configuration. Sets strict type checking, ES2020 target, bundler resolution, JSX preserve/react-jsx, and the `@/*` path mapping to `src/*`. |
| [`tailwind.config.js`](file:///home/rudy/Projects/sdw_portal/tailwind.config.js) | Customizes Tailwind CSS design tokens. Defines the custom `brand` (primary blues) and `ink` (neutral slate darks) color scales, font families (`Inter`), and dark-mode class strategy. |
| [`postcss.config.js`](file:///home/rudy/Projects/sdw_portal/postcss.config.js) | Configures PostCSS plugins (`tailwindcss` and `autoprefixer`) to process CSS files during build and dev. |
| [`index.html`](file:///home/rudy/Projects/sdw_portal/index.html) | Root HTML document. Contains the `<div id="root"></div>` mount node, responsive viewport meta tags, and loads `/src/main.tsx`. |
| [`README.md`](file:///home/rudy/Projects/sdw_portal/README.md) | High-level developer documentation outlining stack decisions, environment setup, module ownership guidelines, and RBAC rules. |
| [`CONTRIBUTING.md`](file:///home/rudy/Projects/sdw_portal/CONTRIBUTING.md) | Team contribution standards covering Git branching conventions, pull request workflows, and coding etiquette. |

---

### 3.2 Application Bootstrap & Core Layout

| File | Purpose & Functionality |
| :--- | :--- |
| [`src/main.tsx`](file:///home/rudy/Projects/sdw_portal/src/main.tsx) | Application entry point. Imports font weights (Inter 400, 500, 600, 700), global styles (`index.css`), and mounts `<App />` to the DOM within `React.StrictMode`. |
| [`src/App.tsx`](file:///home/rudy/Projects/sdw_portal/src/App.tsx) | Top-level provider component. Wraps the app with `QueryClientProvider` and `RouterProvider` to supply TanStack Query and React Router context. |
| [`src/index.css`](file:///home/rudy/Projects/sdw_portal/src/index.css) | Core stylesheet. Declares Tailwind directives (`@tailwind base; components; utilities;`), custom utility classes (`.ui-card`, `.ui-button-primary`, `.ui-button-secondary`), and dark mode surface backgrounds. |
| [`src/vite-env.d.ts`](file:///home/rudy/Projects/sdw_portal/src/vite-env.d.ts) | TypeScript ambient type declarations for Vite environment variables (`import.meta.env.VITE_API_BASE_URL`). |
| [`src/routes/router.tsx`](file:///home/rudy/Projects/sdw_portal/src/routes/router.tsx) | Master route registry. Defines all page paths, nested layouts, unauthenticated landing guards, protected routes, and permission gates. |

---

### 3.3 Layout Components & Route Guards

| File | Purpose & Functionality |
| :--- | :--- |
| [`src/components/layout/AppLayout.tsx`](file:///home/rudy/Projects/sdw_portal/src/components/layout/AppLayout.tsx) | Shell layout component. Evaluates `useAuthStore().isAuthenticated`. Only renders `<Navbar />` if the user is logged in or in Guest Mode. Renders the main `<Outlet />` inside a responsive max-width container. |
| [`src/components/layout/Navbar.tsx`](file:///home/rudy/Projects/sdw_portal/src/components/layout/Navbar.tsx) | Responsive navigation bar. Features brand logo, desktop navigation links, dark/light theme switch, user profile link, admin portal trigger (for users with permissions), guest badge, and mobile drawer. |
| [`src/components/ProtectedRoute.tsx`](file:///home/rudy/Projects/sdw_portal/src/components/ProtectedRoute.tsx) | Route guard component. Protects child routes based on session state (`isAuthenticated`), guest restrictions (`disallowGuest`), CESA-wide admin permissions (`requireCesaAdmin`), and club-scoped permissions (`canPerformInClub`). |

---

### 3.4 Shared UI Primitives

| File | Purpose & Functionality |
| :--- | :--- |
| [`src/components/ui/Feedback.tsx`](file:///home/rudy/Projects/sdw_portal/src/components/ui/Feedback.tsx) | Common UI primitives: `Spinner` (loading indicator), `ErrorMessage` (formatted alert box), `Card` (standardized container surface), and `StatusBadge` (color-coded badge mapping statuses like PUBLISHED, DRAFT, AUTHENTICATED). |
| [`src/components/ui/ClubLogo.tsx`](file:///home/rudy/Projects/sdw_portal/src/components/ui/ClubLogo.tsx) | Reusable club badge component. Displays the club's image `logoUrl` or calculates and styles an initials fallback avatar based on the club code or name. |

---

### 3.5 Global State & Shared Infrastructure

| File | Purpose & Functionality |
| :--- | :--- |
| [`src/store/auth.ts`](file:///home/rudy/Projects/sdw_portal/src/store/auth.ts) | Global Zustand store (`useAuthStore`). Persists session state to `localStorage` under `cesa-sdw-auth`. Manages `user`, `auth` (RBAC info), `accessToken`, `refreshToken`, `isAuthenticated`, and `isGuest`. Provides `setSession`, `setGuestSession`, `setTokens`, and `logout`. |
| [`src/lib/api.ts`](file:///home/rudy/Projects/sdw_portal/src/lib/api.ts) | Shared Axios client. Automatically adds `Authorization: Bearer <token>` to outbound requests. Handles `401 Unauthorized` responses via an async refresh token queue (`POST /auth/refresh`), retrying requests seamlessly or logging out on refresh failure. |
| [`src/lib/permissions.ts`](file:///home/rudy/Projects/sdw_portal/src/lib/permissions.ts) | Pure helper functions for RBAC authorization: `isCesaAdmin`, `canPerformInClub`, `hasPermissionAnywhere`, `hasRoleInClub`, `isDocMember`, and `isSecretary`. |
| [`src/lib/queryClient.ts`](file:///home/rudy/Projects/sdw_portal/src/lib/queryClient.ts) | Singleton instance of TanStack `QueryClient`. Sets default options such as `staleTime: 60_000`, `retry: 1`, and `refetchOnWindowFocus: false`. |
| [`src/types/api.ts`](file:///home/rudy/Projects/sdw_portal/src/types/api.ts) | Global TypeScript definitions matching `docs/api.md`: `ApiResponse<T>`, `ApiErrorResponse`, `User`, `AuthInfo`, `ClubMembership`, `ClubRole`, `Club`, `EventSummary`, enums (`ClubCode`, `AchievementStatus`, `EventStatus`, `EventMode`, `Year`). |

---

### 3.6 Top-Level Application Pages

| File | Purpose & Functionality |
| :--- | :--- |
| [`src/pages/HomePage.tsx`](file:///home/rudy/Projects/sdw_portal/src/pages/HomePage.tsx) | Landing page welcoming students and guest visitors. Highlights portal capabilities and provides quick action links to Browse Events and View Leaderboard. |
| [`src/pages/DashboardPage.tsx`](file:///home/rudy/Projects/sdw_portal/src/pages/DashboardPage.tsx) | Student home screen. Displays personalized greeting, quick navigation to activities and achievements, cards for joined clubs, and a live grid of upcoming activities. |
| [`src/pages/AdminPortalPage.tsx`](file:///home/rudy/Projects/sdw_portal/src/pages/AdminPortalPage.tsx) | Dedicated administration view for club coordinators and CESA admins. Allows creating events for managed clubs, reviewing pending events, approving, and delisting activities. |
| [`src/pages/StatusPages.tsx`](file:///home/rudy/Projects/sdw_portal/src/pages/StatusPages.tsx) | Error boundary and status screens: `NotFoundPage` (404) and `UnauthorizedPage` (403 Forbidden). |

---

### 3.7 Feature: Authentication (`src/features/auth`)

| File | Purpose & Functionality |
| :--- | :--- |
| [`src/features/auth/api.ts`](file:///home/rudy/Projects/sdw_portal/src/features/auth/api.ts) | HTTP integration for authentication endpoints: `login`, `registerStudent`, `logout`, `getMe`, and `forgotPassword`. |
| [`src/features/auth/pages/LoginPage.tsx`](file:///home/rudy/Projects/sdw_portal/src/features/auth/pages/LoginPage.tsx) | Login view. Validates PRN or Email and Password using React Hook Form + Zod. Provides one-click **"Continue as Guest"** mode, **"Forgot password?"** link, red `"wrong password entered"` error display with input highlighting, automatic field reset, and redirect handling. |
| [`src/features/auth/pages/RegisterPage.tsx`](file:///home/rudy/Projects/sdw_portal/src/features/auth/pages/RegisterPage.tsx) | Student registration view. Collects full name, PRN, institutional email, branch, academic year (FE/SE/TE/BE), and password. Automatically creates session upon success. |
| [`src/features/auth/pages/ForgotPasswordPage.tsx`](file:///home/rudy/Projects/sdw_portal/src/features/auth/pages/ForgotPasswordPage.tsx) | Institutional password reset view. Takes student PRN or institutional email, communicates with backend, and displays clear instructions, validity limits, and college support contacts. |
| [`src/features/auth/pages/ProfilePage.tsx`](file:///home/rudy/Projects/sdw_portal/src/features/auth/pages/ProfilePage.tsx) | User profile screen. Shows student academic record, club affiliations, roles (coordinator/member), account actions, and logout button. |

---

### 3.8 Feature: Clubs (`src/features/clubs`)

| File | Purpose & Functionality |
| :--- | :--- |
| [`src/features/clubs/api.ts`](file:///home/rudy/Projects/sdw_portal/src/features/clubs/api.ts) | API wrappers for `getClubs` (`GET /clubs`), `getClubById` (`GET /clubs/:id`), and `getClubRoles` (`GET /clubs/:id/roles`). |
| [`src/features/clubs/pages/ClubListPage.tsx`](file:///home/rudy/Projects/sdw_portal/src/features/clubs/pages/ClubListPage.tsx) | Directory view displaying all campus organizations (ACM, OWASP, GDGC, LFDT, ACM-W) with description and coordinator badges. |
| [`src/features/clubs/pages/ClubDetailPage.tsx`](file:///home/rudy/Projects/sdw_portal/src/features/clubs/pages/ClubDetailPage.tsx) | Single club view showcasing statistics (active members count, upcoming events), club description, coordinator details, and club activities. |

---

### 3.9 Feature: Events (`src/features/events`)

| File | Purpose & Functionality |
| :--- | :--- |
| [`src/features/events/api.ts`](file:///home/rudy/Projects/sdw_portal/src/features/events/api.ts) | Event endpoints: `getEvents`, `getClubEvents`, `getEventById`, `createEvent`, `approveEvent`, `registerForEvent`, `cancelRegistration`, `checkIn`, `delistEvent`, `undelistEvent`. |
| [`src/features/events/pages/EventListPage.tsx`](file:///home/rudy/Projects/sdw_portal/src/features/events/pages/EventListPage.tsx) | Interactive catalog for discovering campus activities with search, filter tabs (upcoming, past), club badges, and registration capacity counters. |
| [`src/features/events/pages/EventDetailPage.tsx`](file:///home/rudy/Projects/sdw_portal/src/features/events/pages/EventDetailPage.tsx) | Detailed event view showing banner, venue, start/end dates, deadline, registration ticket details, and action buttons to Register or Cancel Ticket. |

---

### 3.10 Feature: Achievements (`src/features/achievements`)

| File | Purpose & Functionality |
| :--- | :--- |
| [`src/features/achievements/api.ts`](file:///home/rudy/Projects/sdw_portal/src/features/achievements/api.ts) | Full achievement lifecycle endpoints: `getAchievementTypes`, `submitAchievement`, `submitGuestAchievement`, `getMyAchievements`, `getReviewQueue`, `getAchievementById`, `reviewAchievement`, `resubmitEvidence`, `approveAchievement`, `rejectAchievement`, `overrideAchievement`. |
| [`src/features/achievements/types.ts`](file:///home/rudy/Projects/sdw_portal/src/features/achievements/types.ts) | TypeScript interfaces for achievement categories, payloads, review actions, and workflow status enumerations. |
| [`src/features/achievements/pages/AchievementsPage.tsx`](file:///home/rudy/Projects/sdw_portal/src/features/achievements/pages/AchievementsPage.tsx) | Central achievement hub containing tabs for "My Achievements", "Submit Achievement", "Guest Submission", and "Review Queue". |
| [`src/features/achievements/pages/AchievementDetailPage.tsx`](file:///home/rudy/Projects/sdw_portal/src/features/achievements/pages/AchievementDetailPage.tsx) | In-depth inspector for an achievement: status timeline, review logs, evidence URLs, submitter details (student or guest), and point values. |
| [`src/features/achievements/pages/AchievementReviewPage.tsx`](file:///home/rudy/Projects/sdw_portal/src/features/achievements/pages/AchievementReviewPage.tsx) | Dedicated review workspace for ACM Documentation Members and Secretaries to approve, reject, or request evidence for submissions. |
| [`src/features/achievements/pages/SubmitAchievementPage.tsx`](file:///home/rudy/Projects/sdw_portal/src/features/achievements/pages/SubmitAchievementPage.tsx) | Direct page wrapper rendering `AchievementForm` for authenticated students and guest applicants. |
| [`src/features/achievements/components/AchievementCard.tsx`](file:///home/rudy/Projects/sdw_portal/src/features/achievements/components/AchievementCard.tsx) | Student card component rendering achievement title, category, status pill, points, and inspect action. |
| [`src/features/achievements/components/AchievementForm.tsx`](file:///home/rudy/Projects/sdw_portal/src/features/achievements/components/AchievementForm.tsx) | Dynamic submission form supporting both authenticated student submissions and guest external submissions with multiple proof/evidence URLs. |
| [`src/features/achievements/components/AchievementStatus.tsx`](file:///home/rudy/Projects/sdw_portal/src/features/achievements/components/AchievementStatus.tsx) | Formatted badge component providing human-readable status labels and contextual review tooltips. |
| [`src/features/achievements/components/ReviewCard.tsx`](file:///home/rudy/Projects/sdw_portal/src/features/achievements/components/ReviewCard.tsx) | Queue item card for reviewers displaying submission metadata, evidence links, and workflow action buttons. |
| [`src/features/achievements/components/ReviewModal.tsx`](file:///home/rudy/Projects/sdw_portal/src/features/achievements/components/ReviewModal.tsx) | Interactive modal dialogue for Documentation Review (accept/reject/request evidence), Secretary Approval, Secretary Rejection, and Secretary Point Overrides. |

---

### 3.11 Feature: Leaderboard (`src/features/leaderboard`)

| File | Purpose & Functionality |
| :--- | :--- |
| [`src/features/leaderboard/api.ts`](file:///home/rudy/Projects/sdw_portal/src/features/leaderboard/api.ts) | Queries for `getLeaderboard`, `getUserLeaderboardProfile`, `getLeaderboardHistory`, and `getCurrentSemester`. |
| [`src/features/leaderboard/pages/LeaderboardPage.tsx`](file:///home/rudy/Projects/sdw_portal/src/features/leaderboard/pages/LeaderboardPage.tsx) | Ranked leaderboard table showing student rankings, points, achievement count, branch, and highlight styling for the active student. |

---

### 3.12 Feature: Members (`src/features/members`)

| File | Purpose & Functionality |
| :--- | :--- |
| [`src/features/members/api.ts`](file:///home/rudy/Projects/sdw_portal/src/features/members/api.ts) | API calls for `searchMembers`, `addMember`, `modifyMemberRoles`, `removeMember`, and `selfLeaveClub`. |
| [`src/features/members/pages/MembersPage.tsx`](file:///home/rudy/Projects/sdw_portal/src/features/members/pages/MembersPage.tsx) | Member directory search view for finding registered students across academic branches and clubs. |

---

### 3.13 Feature: Notifications (`src/features/notifications`)

| File | Purpose & Functionality |
| :--- | :--- |
| [`src/features/notifications/api.ts`](file:///home/rudy/Projects/sdw_portal/src/features/notifications/api.ts) | Endpoints for `listNotifications`, `markAsRead`, `markAllAsRead`, `getNotificationPreferences`, and `updateNotificationPreferences`. |
| [`src/features/notifications/pages/NotificationsPage.tsx`](file:///home/rudy/Projects/sdw_portal/src/features/notifications/pages/NotificationsPage.tsx) | Notification list view supporting unread toggles, individual read markings, and bulk mark-all-as-read actions. |

---

### 3.14 Feature: Audit Logs (`src/features/audit-logs`)

| File | Purpose & Functionality |
| :--- | :--- |
| [`src/features/audit-logs/api.ts`](file:///home/rudy/Projects/sdw_portal/src/features/audit-logs/api.ts) | Endpoints for `getAuditLogs` with filter parameters for action types, target resources, and club IDs. |
| [`src/features/audit-logs/pages/AuditLogsPage.tsx`](file:///home/rudy/Projects/sdw_portal/src/features/audit-logs/pages/AuditLogsPage.tsx) | Administrative audit log table displaying timestamps, actor names/PRNs, action descriptions, target entities, and reasons. |

---

## 4. Module Implementation Status Matrix

| Module | Status | Primary Endpoints | Key Implemented Features |
| :--- | :--- | :--- | :--- |
| **Auth & Profile** | Completed | `/auth/login`, `/auth/register`, `/auth/me`, `/auth/refresh`, `/auth/forgot-password` | PRN/Email login, Guest Mode, Forgot Password with institutional instructions, registration, profile display, automatic token refresh. |
| **Clubs** | Completed | `/clubs`, `/clubs/:id`, `/clubs/:id/roles` | Club list directory, club detail, member counts, coordinator badges. |
| **Events** | Completed | `/events`, `/clubs/:id/events`, `/events/:id`, `/events/:id/register` | Event list, event details, registration tickets, admin creation, approval, and delisting. |
| **Leaderboard** | Completed | `/leaderboard`, `/semesters/current` | Ranked student leaderboard, points, achievement count, semester selector. |
| **Achievements** | Completed | `/achievements`, `/achievements/types`, `/achievements/guest`, `/achievements/my` | Authenticated and guest submissions, review queue, approval, rejection, evidence resubmission, and secretary override. |
| **Members** | Operational Starter | `/members/search`, `/clubs/:id/members` | Search members by name and club. Role assignment and removal forms are scheduled for next phase. |
| **Notifications** | Operational Starter | `/notifications`, `/notifications/read-all` | Listing alerts, unread filtering, marking individual and all as read. Channel preferences UI to follow. |
| **Audit Logs** | Operational Starter | `/audit-logs` | CESA-admin gated audit log view with timestamp and actor details. Advanced filter bar to follow. |
