# myRA — Claude notes

## Git workflow

**Always push straight to `main`.** No feature branches, no PRs.

When the user says "push updates" or anything similar:
1. Commit to whatever branch the worktree is on
2. Push directly to `origin/main` (use `git push origin HEAD:main`)
3. Vercel auto-deploys `main` to production — that's the deployed site the user watches

Do **not** open pull requests. Do **not** leave changes on a feature branch expecting the user to merge.

## Environment

`.env` and `.env.local` are gitignored and must exist in the worktree for Supabase to init. If the dev server white-screens on load with `supabaseUrl is required`, copy them from the parent repo:

```
cp ../../../.env ../../../.env.local ./
```
