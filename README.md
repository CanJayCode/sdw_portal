# CESA-SDW Portal — Frontend

Frontend for the CESA-SDW club management portal. Built with React + TypeScript + Vite,
talking to the backend documented in [`docs/api.md`](./docs/api.md).

## Stack

- **Vite + React + TypeScript**
- **React Router v6** — routing, `ProtectedRoute` for auth/permission gating
- **TanStack Query** — server state, caching (`@tanstack/react-query`)
- **Zustand** — client state, auth session (`src/store/auth.ts`)
- **Axios** — API client with automatic access-token refresh (`src/lib/api.ts`)
- **React Hook Form + Zod** — form state and validation
- **Tailwind CSS** — styling

## Getting started

```bash
git clone <your-fork-url>
cd cesa-sdw-frontend
npm install
cp .env.example .env      # edit VITE_API_BASE_URL if your backend runs elsewhere
npm run dev                # http://localhost:5173
```

Other scripts:

```bash
npm run build      # typecheck + production build
npm run lint        # ESLint
npm run format      # Prettier
```

## Project structure

```
src/
  lib/            # api client, permission helpers, query client — SHARED, ask before editing
  store/          # zustand stores (auth session)
  types/          # shared TypeScript types matching docs/api.md
  components/     # shared layout + UI primitives — SHARED, ask before editing
  routes/         # router.tsx — the ONLY place routes get registered
  pages/          # top-level pages not tied to one feature (home, 404, unauthorized)
  features/
    auth/            # login, register, profile — DONE, reference implementation
    clubs/           # club list/detail — DONE, reference implementation
    events/          # event browse/detail/register — DONE, reference implementation
    leaderboard/     # leaderboard + semesters — DONE, reference implementation
    achievements/    # submission + review workflow — STARTER, needs work
    members/         # member search/management — STARTER, needs work
    notifications/   # notification list — STARTER, needs work
    audit-logs/      # CESA admin audit trail — STARTER, needs work
```

Every feature folder follows the same shape:

```
features/<name>/
  api.ts            # typed functions wrapping the relevant endpoints
  pages/            # page components, imported into src/routes/router.tsx
```

`auth`, `clubs`, `events`, and `leaderboard` are fully working — use them as the pattern
to copy when building out your own module (how queries are structured, how mutations
invalidate cache, how permission checks gate UI, how forms are validated).

## Module assignments

| Module | Status | Endpoints (see docs/api.md) |
|---|---|---|
| Achievements | Starter — "My Achievements" list only | Section 7 — submission form, review queue, approve/reject/override actions still needed |
| Members | Starter — search only | Section 10 — add/modify/remove member forms still needed |
| Notifications | Mostly done — list + mark read/all read | Section 11 — notification preferences UI still needed |
| Audit Logs | Starter — read-only list | Section 12 — filter controls (action/targetResource/clubId) still needed |

Whoever owns a module should only touch files inside `src/features/<module>/`, plus
adding their own routes to `src/routes/router.tsx` (small, low-conflict edits).

## Auth & permissions, in short

- On login/register, the API returns `auth: { isCesaAdmin, cesaRoles, memberships }` —
  this is stored in `useAuthStore` and is the source of truth for what a user can do.
- Use the helpers in `src/lib/permissions.ts` (`canPerformInClub`, `isCesaAdmin`,
  `hasRoleInClub`, etc.) to gate buttons/routes — don't hand-roll permission checks.
- Wrap authenticated-only routes with `<ProtectedRoute />` in `src/routes/router.tsx`
  (see the existing examples for permission-gated and CESA-admin-only routes).

## Contributing

See [`CONTRIBUTING.md`](./CONTRIBUTING.md) for the fork-based git workflow everyone
should follow.
