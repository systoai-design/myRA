import { Navigate } from "react-router-dom";

/**
 * Settings merged into Profile (April 2026). Any link/bookmark to
 * /app/settings now lands on the unified Profile page.
 */
export default function SettingsPage() {
    return <Navigate to="/app/profile" replace />;
}
