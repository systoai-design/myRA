import { Navigate } from "react-router-dom";

/**
 * Portfolio merged into Dashboard (April 2026).
 * Anyone hitting /app/portfolio — from a bookmark or link — is
 * bounced to the unified Dashboard. The old Plaid content lives
 * at /app/integrations now.
 */
export default function PortfolioPage() {
    return <Navigate to="/app" replace />;
}
