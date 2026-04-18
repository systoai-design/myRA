import { Link } from "react-router-dom";

const ACCENT = "#00D4AA";

type Col = { title: string; links: { label: string; href?: string }[] };

const columns: Col[] = [
    {
        title: "Products",
        links: [
            { label: "Investing" },
            { label: "Spending" },
            { label: "Forecasting" },
        ],
    },
    {
        title: "Resources",
        links: [
            { label: "Company" },
            { label: "Careers" },
            { label: "Help Center" },
        ],
    },
    {
        title: "Download",
        links: [
            { label: "App Store" },
            { label: "Play Store" },
        ],
    },
];

const NewFooter = () => {
    return (
        <footer
            style={{
                padding: "64px 24px 32px",
                borderTop: "1px solid var(--myra-glass-border)",
                background: "var(--myra-bg-elevated)",
                color: "var(--myra-text)",
            }}
        >
            <div
                style={{
                    maxWidth: 1100,
                    margin: "0 auto",
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                    gap: 40,
                }}
            >
                <div>
                    <span
                        style={{
                            fontSize: 24,
                            fontFamily: "var(--myra-font-display)",
                            fontWeight: 600,
                            fontStyle: "italic",
                            color: ACCENT,
                        }}
                    >
                        myra
                    </span>
                    <p
                        style={{
                            fontSize: 13,
                            color: "var(--myra-text-secondary)",
                            marginTop: 12,
                            maxWidth: 280,
                            lineHeight: 1.6,
                        }}
                    >
                        Sign up for our newsletter to get actionable insights about your next money moves.
                    </p>
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            // Newsletter hook stays wired to existing behavior elsewhere if needed
                        }}
                        style={{ display: "flex", marginTop: 16, gap: 8, maxWidth: 340 }}
                    >
                        <input
                            type="email"
                            placeholder="Email address"
                            aria-label="Email address"
                            style={{
                                background: "var(--myra-surface)",
                                border: "1px solid var(--myra-glass-border)",
                                borderRadius: 10,
                                padding: "10px 14px",
                                fontSize: 13,
                                color: "var(--myra-text)",
                                outline: "none",
                                flex: 1,
                                fontFamily: "var(--myra-font-body)",
                            }}
                        />
                        <button
                            type="submit"
                            style={{
                                background: "var(--myra-surface)",
                                border: "1px solid var(--myra-glass-border)",
                                borderRadius: 10,
                                padding: "10px 18px",
                                fontSize: 13,
                                color: "var(--myra-text)",
                                cursor: "pointer",
                                fontFamily: "var(--myra-font-body)",
                                fontWeight: 500,
                            }}
                        >
                            Subscribe
                        </button>
                    </form>
                </div>

                {columns.map((col) => (
                    <div key={col.title}>
                        <div
                            style={{
                                fontSize: 11,
                                fontWeight: 600,
                                letterSpacing: "0.1em",
                                textTransform: "uppercase",
                                color: "var(--myra-text-secondary)",
                                marginBottom: 16,
                            }}
                        >
                            {col.title}
                        </div>
                        {col.links.map((l) => (
                            <a
                                key={l.label}
                                href={l.href || "#"}
                                style={{
                                    display: "block",
                                    fontSize: 14,
                                    color: "var(--myra-text-secondary)",
                                    textDecoration: "none",
                                    marginBottom: 10,
                                    cursor: "pointer",
                                    transition: "color 0.2s ease",
                                }}
                                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--myra-text)")}
                                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--myra-text-secondary)")}
                            >
                                {l.label}
                            </a>
                        ))}
                    </div>
                ))}
            </div>

            <div
                style={{
                    maxWidth: 1100,
                    margin: "48px auto 0",
                    paddingTop: 24,
                    borderTop: "1px solid var(--myra-glass-border)",
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 16,
                    justifyContent: "space-between",
                    alignItems: "center",
                }}
            >
                <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
                    <Link to="/legal/privacy" style={{ fontSize: 12, color: "var(--myra-text-secondary)", textDecoration: "none" }}>
                        Privacy
                    </Link>
                    <Link to="/legal/terms" style={{ fontSize: 12, color: "var(--myra-text-secondary)", textDecoration: "none" }}>
                        Terms
                    </Link>
                    <Link to="/legal/disclosures" style={{ fontSize: 12, color: "var(--myra-text-secondary)", textDecoration: "none" }}>
                        Disclosures
                    </Link>
                </div>
                <span style={{ fontSize: 12, color: "var(--myra-text-secondary)" }}>
                    © {new Date().getFullYear()} Retirement Architects. All rights reserved.
                </span>
            </div>
            <p
                style={{
                    maxWidth: 1100,
                    margin: "16px auto 0",
                    fontSize: 10,
                    lineHeight: 1.6,
                    color: "rgba(255,255,255,0.22)",
                }}
            >
                Investment advisory services provided by myra, an SEC-registered investment advisor. Brokerage services provided by partnered custodians. All investing involves risk, including possible loss of principal.
            </p>
        </footer>
    );
};

export default NewFooter;
