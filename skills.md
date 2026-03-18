# Project Skills: Retirement Architects
**Standards for AI-Powered Development**

## 1. UI & Component Standards
*   **Shadow-Free Design**: Prefer glassmorphism (`backdrop-blur`) and borders (`border-white/10`) over heavy drop shadows.
*   **Shadcn/UI First**: Always check existing `src/components/ui` before creating new primitive components.
*   **Iconography**: Use `lucide-react` exclusively. Maintain consistent sizing (`w-4 h-4` for inline, `w-5 h-5` for standard buttons).

## 2. Interaction & Feedback
*   **Sonner/Toasts**: Every async action (Save, Delete, Invite) must trigger a `toast` notification.
*   **Loading States**: Use the project's `syncStatus` or local `loading` booleans to disable buttons and show spinners/skeletons.
*   **Manual Fallbacks**: For critical features (like invites), always provide a "Manual Copy" or "Rescue" link as a backup if the primary service (SMTP) fails.

## 3. Data & Supabase Patterns
*   **Role-Based Access**: Use the `user_roles` table for all permission checks. Never rely solely on Auth metadata.
*   **Edge Functions**: Move complex, multi-table operations or sensitive logic (like Service Role bypasses) into dedicated Edge Functions in `supabase/functions/`.
*   **Safe Migrations**: Write idempotent SQL. Use `DO` blocks and `IF NOT EXISTS` for all schema changes to ensure CI/CD stability.

## 4. Development Workflow
*   **Atomic Commits**: Group related changes (e.g., UI + Edge Function + Migration) into a single descriptive commit.
*   **Walkthroughs**: After completing a feature, update `walkthrough.md` with visual proof (screenshots/recordings) of the working code.
