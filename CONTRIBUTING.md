# Contributing

This repo uses a **fork-based workflow**: everyone forks the repo, works on their own
copy, and opens a Pull Request back to this repo when their feature is ready. Nobody
pushes directly to `main` here.

## One-time setup (per person)

1. **Fork** this repo on GitHub (top-right "Fork" button).
2. **Clone your fork**, not this repo:
   ```bash
   git clone https://github.com/<your-username>/cesa-sdw-frontend.git
   cd cesa-sdw-frontend
   ```
3. **Add this repo as `upstream`** so you can pull the latest changes later:
   ```bash
   git remote add upstream https://github.com/<owner-username>/cesa-sdw-frontend.git
   git remote -v   # confirm you now see both 'origin' (your fork) and 'upstream' (this repo)
   ```
4. Install dependencies and copy the env file:
   ```bash
   npm install
   cp .env.example .env
   ```

## Every time you start new work

```bash
git checkout main
git pull upstream main        # get the latest merged changes
git push origin main            # keep your fork's main in sync too
git checkout -b feature/<your-module>     # e.g. feature/achievements-review-queue
```

Work only inside your assigned folder: `src/features/<your-module>/`. If you need to
add a route, add it in `src/routes/router.tsx` — keep that edit small and focused so it
doesn't conflict with someone else's PR.

## Committing and opening a PR

```bash
git add .
git commit -m "achievements: add review queue page"
git push origin feature/<your-module>
```

Then open a Pull Request on GitHub from `<your-username>:feature/<your-module>` into
`<owner-username>:main`. The repo owner reviews and merges.

After it's merged, sync again before starting your next branch:
```bash
git checkout main
git pull upstream main
```

## Ground rules

- **One feature branch per PR.** Don't bundle unrelated changes.
- **Don't edit `src/lib/`, `src/store/`, `src/components/`, or `src/types/`** without
  flagging it to the team first — these are shared by every module and changes there
  affect everyone's branch.
- **Run `npm run lint` and `npm run build` before opening a PR.** Both must pass clean.
- **Keep commits scoped to your module folder** — this is what keeps merge conflicts
  rare even with multiple people working in parallel.
- **Don't commit `.env`, `node_modules/`, or `dist/`** — they're already git-ignored;
  double-check `git status` before committing if you're not sure.
