import { useScrollReveal } from "./hooks";

const ACCENT = "#00D4AA";

const features = [
    {
        title: "Monitor Spending",
        desc: "See every transaction, automatically categorized.",
        icon: (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="1.5">
                <rect x="3" y="4" width="18" height="16" rx="3" />
                <path d="M3 10h18" />
                <circle cx="7.5" cy="15" r="1.5" />
            </svg>
        ),
    },
    {
        title: "Forecast Growth",
        desc: "AI-powered projections for your retirement timeline.",
        icon: (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="1.5">
                <path d="M3 20l5-8 4 4 9-12" />
                <path d="M17 4h4v4" />
            </svg>
        ),
    },
    {
        title: "Tax Optimization",
        desc: "Automated tax-loss harvesting to keep more of what you earn.",
        icon: (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="1.5">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 100 7h5a3.5 3.5 0 110 7H6" />
            </svg>
        ),
    },
    {
        title: "Smart Rebalancing",
        desc: "Your portfolio stays optimized, automatically.",
        icon: (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="1.5">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 3a9 9 0 015.65 15.95" />
                <path d="M12 3v9l6.36 3.64" />
            </svg>
        ),
    },
];

const NewFeatures = () => {
    const [ref, visible] = useScrollReveal<HTMLElement>(0.1);

    return (
        <section
            ref={ref}
            style={{
                padding: "120px 24px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
            }}
        >
            <span
                style={{
                    fontSize: 12,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: ACCENT,
                    fontWeight: 600,
                    marginBottom: 16,
                    opacity: visible ? 1 : 0,
                    transition: "opacity 0.8s ease",
                }}
            >
                Simplify Your Future
            </span>
            <h2
                style={{
                    fontSize: "clamp(36px, 5vw, 72px)",
                    textAlign: "center",
                    lineHeight: 1.1,
                    maxWidth: 700,
                    margin: 0,
                    opacity: visible ? 1 : 0,
                    transform: visible ? "translateY(0)" : "translateY(30px)",
                    transition: "all 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.1s",
                }}
            >
                <span style={{ fontFamily: "var(--myra-font-display)", fontWeight: 700 }}>Everything</span>{" "}
                <span style={{ fontFamily: "var(--myra-font-body)", fontWeight: 400 }}>in one place</span>
            </h2>

            <div
                style={{
                    marginTop: 64,
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                    gap: 16,
                    maxWidth: 800,
                    width: "100%",
                }}
            >
                {features.map((f, i) => (
                    <div
                        key={f.title}
                        style={{
                            background: "linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))",
                            border: "1px solid var(--myra-glass-border)",
                            borderRadius: 20,
                            padding: 32,
                            backdropFilter: "blur(20px)",
                            WebkitBackdropFilter: "blur(20px)",
                            opacity: visible ? 1 : 0,
                            transform: visible ? "translateY(0)" : "translateY(30px)",
                            transition: `opacity 0.8s cubic-bezier(0.16,1,0.3,1) ${0.2 + i * 0.1}s, transform 0.8s cubic-bezier(0.16,1,0.3,1) ${0.2 + i * 0.1}s, border-color 0.3s ease, box-shadow 0.3s ease`,
                            cursor: "default",
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = `${ACCENT}4d`;
                            e.currentTarget.style.transform = "translateY(-4px)";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = "var(--myra-glass-border)";
                            e.currentTarget.style.transform = "translateY(0)";
                        }}
                    >
                        <div style={{ marginBottom: 16 }}>{f.icon}</div>
                        <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8, color: "var(--myra-text)" }}>
                            {f.title}
                        </div>
                        <div style={{ fontSize: 14, lineHeight: 1.6, color: "var(--myra-text-secondary)" }}>
                            {f.desc}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default NewFeatures;
