# CESA-SDW Portal — System Context & Agent Guide (`dev/CONTEXT.md`)

This guide provides technical context, domain knowledge, design patterns, and operational rules for AI agents and developers working on the CESA-SDW Portal frontend codebase.

---

## 1. System Architecture & Context

### 1.1 Mission & Scope
The CESA-SDW Portal is the centralized web application for the Computer Engineering Student Association (CESA) and its Student Development Wing (SDW). It aggregates student organizations, events, gamified points, student achievements, and administrative workflows into a unified interface.

### 1.2 Core Architectural Principles
1. **Feature-Driven Directory Structure**: Code is partitioned into `src/features/<module>/` containing feature-scoped APIs and pages. Shared code resides exclusively in `src/components/`, `src/lib/`, `src/store/`, and `src/types/`.
2. **Single Route Registry**: All routes and route guards are registered strictly in [`src/routes/router.tsx`](file:///home/rudy/Projects/sdw_portal/src/routes/router.tsx).
3. **Decoupled Server vs Client State**:
   - **Server State**: Managed via TanStack React Query v5. Queries handle caching, pagination, and polling; mutations handle optimistic updates and query invalidations.
   - **Client State**: Minimal client state managed via Zustand. The primary store is `useAuthStore` in [`src/store/auth.ts`](file:///home/rudy/Projects/sdw_portal/src/store/auth.ts), persisted to `localStorage`.
4. **Resilient Token Management**: Dual-token JWT model. Short-lived access tokens (15 minutes) are sent in headers; long-lived refresh tokens (7 days) are exchanged silently on 401 responses using Axios interceptors with request queuing.

---

## 2. Authentication, Guest Mode & Route Gating Architecture

### 2.1 Portal Entry Flow
- **Unauthenticated Root Access**: When a user opens the root URL (`/`), the application evaluates `useAuthStore.getState().isAuthenticated`.
  - If `false`: Redirects immediately to `/login` via `<RootRoute />` in `router.tsx`.
  - If `true`: Renders `<HomePage />`.
- **Navbar Visibility**:
  - Managed in [`src/components/layout/AppLayout.tsx`](file:///home/rudy/Projects/sdw_portal/src/components/layout/AppLayout.tsx).
  - Condition: `{isAuthenticated && <Navbar />}`.
  - **The Navbar is completely hidden on `/login`, `/register`, and `/forgot-password`.** It becomes visible only after a user successfully logs in or enters Guest Mode.

### 2.2 Guest Mode
Guest Mode allows prospective students, visitors, or non-logged-in users to explore the portal without credentials:
- **Trigger**: "Continue as Guest" button on [`src/features/auth/pages/LoginPage.tsx`](file:///home/rudy/Projects/sdw_portal/src/features/auth/pages/LoginPage.tsx).
- **Store Action**: `setGuestSession()` sets:
  ```ts
  {
    isAuthenticated: true,
    isGuest: true,
    user: {
      id: 'guest',
      prn: 'GUEST',
      email: 'guest@student.portal',
      name: 'Guest User',
      branch: 'General',
      year: 'FE',
      avatar: '',
    },
    auth: { isCesaAdmin: false, cesaRoles: [], memberships: [] },
    accessToken: null,
    refreshToken: null,
  }
  ```
- **Allowed for Guest**:
  - View Home (`/`), Clubs directory (`/clubs`, `/clubs/:id`), Events directory (`/events`, `/events/:id`), and Leaderboard (`/leaderboard`).
  - Submit external achievements via the Guest tab in `/achievements` (claims are linked upon eventual registration via PRN/email).
- **Disallowed for Guest**:
  - Gated by `<ProtectedRoute disallowGuest />`: Profile (`/profile`), Notifications (`/notifications`), and Members management (`/members`).
  - Gated by RBAC permissions: Event management (`/admin`), and Audit Logs (`/audit-logs`).

### 2.3 Forgot Password Workflow
- **Trigger**: "Forgot password?" link on the login form navigates to [`/forgot-password`](file:///home/rudy/Projects/sdw_portal/src/features/auth/pages/ForgotPasswordPage.tsx).
- **Functionality**:
  - Accepts PRN or Institutional Email.
  - Communicates with `forgotPassword({ prnOrEmail })` in [`src/features/auth/api.ts`](file:///home/rudy/Projects/sdw_portal/src/features/auth/api.ts).
  - Displays institutional confirmation details (15-minute token validity, institutional mailbox guidance, CESA support contact).

### 2.4 Route Protection Matrix
The following table defines the route guard rules enforced in [`src/routes/router.tsx`](file:///home/rudy/Projects/sdw_portal/src/routes/router.tsx):

| Route | Component | Access Guard |
| :--- | :--- | :--- |
| `/login` | `LoginPage` | Public (Unauthenticated) |
| `/register` | `RegisterPage` | Public (Unauthenticated) |
| `/forgot-password` | `ForgotPasswordPage` | Public (Unauthenticated) |
| `/unauthorized` | `UnauthorizedPage` | Public |
| `/` | `HomePage` | Requires Auth / Guest (redirects unauthenticated to `/login`) |
| `/clubs`, `/clubs/:clubId` | `ClubListPage`, `ClubDetailPage` | Requires Auth / Guest (`<ProtectedRoute />`) |
| `/events`, `/events/:eventId` | `EventListPage`, `EventDetailPage` | Requires Auth / Guest (`<ProtectedRoute />`) |
| `/leaderboard` | `LeaderboardPage` | Requires Auth / Guest (`<ProtectedRoute />`) |
| `/dashboard` | `DashboardPage` | Requires Auth / Guest (`<ProtectedRoute />`) |
| `/achievements` | `AchievementsPage` | Requires Auth / Guest (`<ProtectedRoute />`) |
| `/admin` | `AdminPortalPage` | Requires Auth (`CREATE_EVENT` / `EDIT_EVENT` permissions) |
| `/profile` | `ProfilePage` | Requires Registered Student (`<ProtectedRoute disallowGuest />`) |
| `/members` | `MembersPage` | Requires Registered Student (`<ProtectedRoute disallowGuest />`) |
| `/notifications` | `NotificationsPage` | Requires Registered Student (`<ProtectedRoute disallowGuest />`) |
| `/audit-logs` | `AuditLogsPage` | Requires CESA Admin (`<ProtectedRoute requireCesaAdmin />`) |

---

## 3. RBAC & Permissions Architecture

RBAC source of truth is `useAuthStore.getState().auth`. Do **not** invent inline permission checks; always use the pure helper functions from [`src/lib/permissions.ts`](file:///home/rudy/Projects/sdw_portal/src/lib/permissions.ts):

### Permission Helpers Reference
```ts
import { 
  isCesaAdmin, 
  canPerformInClub, 
  hasPermissionAnywhere, 
  hasRoleInClub, 
  isDocMember, 
  isSecretary 
} from '@/lib/permissions';
```

- **`isCesaAdmin(auth)`**: Checks if `auth.isCesaAdmin === true`. CESA admins inherit all permissions across all clubs.
- **`canPerformInClub(auth, clubId, permission)`**: Returns `true` if the user is CESA admin OR holds `permission` inside the specific `clubId`.
- **`hasPermissionAnywhere(auth, permission)`**: Returns `true` if user holds `permission` in at least one club membership. Used to show/hide top-level triggers like `/admin`.
- **`hasRoleInClub(auth, clubCode, roleName)`**: Checks if user has a named role (e.g., `Secretary`, `Documentation Member`) in a club code (e.g., `ACM`).
- **`isDocMember(auth)`**: Checks if user is an ACM Documentation Member (`hasRoleInClub(auth, 'ACM', 'Documentation Member')`).
- **`isSecretary(auth)`**: Checks for ACM `Secretary` or `Co-Secretary`.

---

## 4. Key Workflows & Domain State Machines

### 4.1 Achievement Review State Machine
Achievements follow a strict 4-step workflow:
```
[1. Submit] (Student or Guest)
     │
     ▼
[SUBMITTED] ──(Step 3: Doc Review)──► [APPROVED_BY_DOCUMENTATION]
     │                                           │
     ├──► [EVIDENCE_REQUESTED]                   ├──► (Step 4: Secretary Approve) ──► [AUTHENTICATED]
     │         │                                 │
     │    (Resubmit)                             └──► (Step 4b: Secretary Reject) ──► [REJECTED_BY_SECRETARY]
     │         │                                           ▲
     │         ▼                                           │
     └──► [PENDING_DOCUMENTATION_REVIEW]                   │
               │                                           │
               └──► [REJECTED_BY_DOCUMENTATION]            │
                                                           │
[Override: Secretary Override Action] ─────────────────────┴─► [AUTHENTICATED] / [REJECTED]
```

### 4.2 Event Lifecycle
```
[DRAFT] ──► [PENDING_APPROVAL] ──(Club Coordinator / CESA Admin)──► [PUBLISHED]
                                                                        │
                                                                        ├──► [DELISTED]
                                                                        │
                                                                        └──► [COMPLETED]
```

---

## 5. Coding Guidelines & Rules of Engagement for AI Agents

When implementing new features or making edits, adhere to the following rules:

### 5.1 Shared Infrastructure Integrity
- **Do NOT edit without explicit instruction**:
  - [`src/lib/api.ts`](file:///home/rudy/Projects/sdw_portal/src/lib/api.ts): Contains critical Axios interceptors and refresh queuing.
  - [`src/types/api.ts`](file:///home/rudy/Projects/sdw_portal/src/types/api.ts): Mirrors `docs/api.md`. Add custom feature types into `src/features/<feature>/types.ts` instead.
  - [`src/lib/permissions.ts`](file:///home/rudy/Projects/sdw_portal/src/lib/permissions.ts): Central permission checks.

### 5.2 Routing Updates
- New routes **must only** be registered in [`src/routes/router.tsx`](file:///home/rudy/Projects/sdw_portal/src/routes/router.tsx). Keep route hunks compact.

### 5.3 TanStack React Query Conventions
- **Query Keys**: Structured as hierarchical arrays:
  ```ts
  ['events']
  ['events', eventId]
  ['clubs', clubId, 'events', { page, limit }]
  ['achievements', 'my', { status, page }]
  ```
- **Cache Invalidation**: On mutations, invalidate related queries using `queryClient.invalidateQueries({ queryKey: [...] })`.

### 5.4 Form Validation & Error Handling
- Use **React Hook Form** + **Zod** schema resolver.
- Inspect errors using `axios.isAxiosError(error)`. Extract formatted server errors:
  ```ts
  const message = error.response?.data?.message || 'Action failed';
  ```
- Always render loading spinners (`<Spinner />`) and error messages (`<ErrorMessage message={...} />`) from [`src/components/ui/Feedback.tsx`](file:///home/rudy/Projects/sdw_portal/src/components/ui/Feedback.tsx).

### 5.5 Dark Mode & Styling
- Dark mode is implemented via the `.dark` class on `document.documentElement`.
- Use Tailwind dark mode classes (e.g. `dark:bg-gray-900 dark:text-gray-100`).
- Rely on preset tokens: `.ui-card`, `.ui-button-primary`, `.ui-button-secondary`, `brand-600`, `ink-700`.
