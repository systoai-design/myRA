/**
 * Rejects strings that look like emails or are absurdly long — both of which
 * have historically ended up in user_metadata.first_name due to bad signup
 * flows, producing "Hi systo.ai@gmail.comJetski AI" style greetings.
 */
export function cleanName(s?: string | null): string | null {
    if (!s) return null;
    const t = s.trim();
    if (!t) return null;
    if (t.includes("@")) return null;
    if (t.length > 40) return null;
    return t;
}

/**
 * Best-effort display name from a Supabase user. Falls through:
 *   user_metadata.first_name  →  legal_name (first word)  →  email local-part  →  fallback
 *
 * Pass `legalName` when you already have it loaded from user_memory so
 * corrupted metadata doesn't prevent a friendly greeting for existing users.
 */
export function displayName(
    user: { email?: string | null; user_metadata?: { first_name?: string | null } } | null | undefined,
    fallback = "there",
    legalName?: string | null,
): string {
    if (!user) return fallback;
    const fromMeta = cleanName(user.user_metadata?.first_name);
    if (fromMeta) return fromMeta;
    if (legalName) {
        const firstWord = cleanName(legalName.trim().split(/\s+/)[0]);
        if (firstWord) return firstWord;
    }
    const local = user.email ? user.email.split("@")[0] : null;
    const fromEmail = cleanName(local);
    if (fromEmail) return fromEmail;
    return fallback;
}
