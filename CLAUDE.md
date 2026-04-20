# myRA — Claude notes

## Repo layout

There are TWO working trees that matter:

- **Parent repo** (`C:/Users/Kyle/OneDrive/Desktop/Antigravity/Retirement Architects/`) — this is where **the user's local `npm run dev` server runs from**. Its working tree must reflect `main` for localhost to show the latest code.
- **Claude worktree** (`.claude/worktrees/friendly-benz-e9457a/`) — this is where Claude edits. It's a git worktree checked out on a feature branch but we push commits straight to `origin/main`.

## Git workflow

**Always push straight to `main`.** No feature branches, no PRs.

When the user says "push updates" or similar, the sequence is:

1. Commit in the Claude worktree to whatever local branch it's on
2. Push directly to `origin/main`:
   ```
   git push origin HEAD:main
   ```
3. **Fast-forward the parent repo** so localhost sees the changes:
   ```
   cd "C:/Users/Kyle/OneDrive/Desktop/Antigravity/Retirement Architects"
   git fetch origin && git pull --ff-only
   ```
   Skipping this step = user reports "I don't see the updates on localhost" and gets frustrated. Do it every time.
4. Vercel auto-deploys `main` to production — that's the deployed site (`www.retirewithmyra.com`).

Do **not** open pull requests. Do **not** leave changes on a feature branch expecting the user to merge.

## Environment

`.env` and `.env.local` are gitignored and must exist in the worktree for Supabase to init. If the dev server white-screens on load with `supabaseUrl is required`, copy them from the parent repo:

```
cp ../../../.env ../../../.env.local ./
```

## Deployment notes

- Vercel project is `myra-retirement` under the `retirement-architects` team.
- Production domain is `www.retirewithmyra.com`. The apex `retirewithmyra.com` DNS currently points to a non-Vercel parking page — tell the user to add an A record `@ → 76.76.21.21` or an ALIAS to `cname.vercel-dns.com` at their registrar if they want the apex to work.
- Vite env vars MUST be prefixed `VITE_` to be available in the client bundle. `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` are already set in production.
