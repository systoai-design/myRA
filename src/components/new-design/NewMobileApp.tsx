import { useScrollReveal, useSectionScroll } from "./hooks";

const ACCENT = "#00D4AA";

const FEATURES = [
    "Smart portfolio rebalancing",
    "Real-time spending alerts",
    "AI-powered tax optimization",
];

const NewMobileApp = () => {
    const [sRef, ratio] = useSectionScroll<HTMLElement>();
    const [rRef, visible] = useScrollReveal<HTMLElement>(0.1);

    const setRef = (el: HTMLElement | null) => {
        sRef.current = el;
        rRef.current = el;
    };

    const phoneRotY = -15 + ratio * 15;
    const phoneRotX = 5 - ratio * 5;

    return (
        <section
            ref={setRef}
            style={{
                padding: "120px 24px 160px",
                position: "relative",
                display: "flex",
                justifyContent: "center",
            }}
        >
            {/* Glow */}
            <div
                aria-hidden
                style={{
                    position: "absolute",
                    top: "50%",
                    left: "60%",
                    transform: "translate(-50%, -50%)",
                    width: 500,
                    height: 500,
                    borderRadius: "50%",
                    background: `radial-gradient(circle, ${ACCENT}1f 0%, transparent 60%)`,
                    filter: "blur(60px)",
                    pointerEvents: "none",
                }}
            />

            <div
                style={{
                    maxWidth: 1100,
                    width: "100%",
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
                    gap: 60,
                    alignItems: "center",
                }}
            >
                {/* Text */}
                <div
                    style={{
                        opacity: visible ? 1 : 0,
                        transform: visible ? "translateX(0)" : "translateX(-40px)",
                        transition: "all 1s cubic-bezier(0.16, 1, 0.3, 1)",
                    }}
                >
                    <div
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 6,
                            padding: "5px 12px",
                            borderRadius: 8,
                            fontSize: 12,
                            fontWeight: 500,
                            background: "var(--myra-glass)",
                            border: "1px solid var(--myra-glass-border)",
                            color: "var(--myra-text-secondary)",
                            marginBottom: 24,
                        }}
                    >
                        📱 iOS App Coming Soon
                    </div>
                    <h2
                        style={{
                            fontSize: "clamp(32px, 4vw, 56px)",
                            lineHeight: 1.1,
                            marginBottom: 20,
                            color: "var(--myra-text)",
                        }}
                    >
                        <span style={{ fontFamily: "var(--myra-font-display)", fontStyle: "italic", fontWeight: 700, color: ACCENT }}>Your</span>
                        <span style={{ fontFamily: "var(--myra-font-body)", fontWeight: 400 }}> entire financial life, in your pocket.</span>
                    </h2>
                    <p
                        style={{
                            fontSize: "clamp(16px, 1.4vw, 19px)",
                            lineHeight: 1.6,
                            fontWeight: 700,
                            color: "var(--myra-text)",
                            maxWidth: 440,
                        }}
                    >
                        Track your net worth, execute AI tax-loss harvesting, and chat with myra directly from your iPhone.
                    </p>

                    <div style={{ marginTop: 32, display: "flex", flexDirection: "column", gap: 12 }}>
                        {FEATURES.map((f) => (
                            <div key={f} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                <span
                                    style={{
                                        width: 20,
                                        height: 20,
                                        borderRadius: 6,
                                        background: `${ACCENT}33`,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        flexShrink: 0,
                                    }}
                                >
                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="3" strokeLinecap="round">
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                </span>
                                <span style={{ fontSize: 14, color: "var(--myra-text-secondary)" }}>{f}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 3D Phone */}
                <div style={{ perspective: 1000, display: "flex", justifyContent: "center" }}>
                    <div
                        style={{
                            width: 280,
                            height: 560,
                            borderRadius: 40,
                            background: "linear-gradient(145deg, #1a1a1f, #0a0a0e)",
                            border: "2px solid rgba(255,255,255,0.1)",
                            boxShadow: `0 60px 120px rgba(0,0,0,0.8), 0 0 80px ${ACCENT}1a, inset 0 1px 0 rgba(255,255,255,0.06)`,
                            transform: `rotateY(${phoneRotY}deg) rotateX(${phoneRotX}deg)`,
                            transition: "transform 0.1s linear",
                            padding: 12,
                            position: "relative",
                            overflow: "hidden",
                        }}
                    >
                        {/* Notch */}
                        <div
                            aria-hidden
                            style={{
                                width: 100,
                                height: 28,
                                background: "#000",
                                borderRadius: 14,
                                margin: "0 auto 16px",
                                position: "relative",
                                zIndex: 2,
                            }}
                        />

                        {/* Screen */}
                        <div
                            style={{
                                background: "#0a0a0e",
                                borderRadius: 28,
                                height: "calc(100% - 44px)",
                                padding: 20,
                                display: "flex",
                                flexDirection: "column",
                            }}
                        >
                            <div style={{ fontSize: 11, color: "var(--myra-text-secondary)", marginBottom: 4 }}>
                                Monthly Cashflow
                            </div>

                            {/* Ring chart */}
                            <div style={{ display: "flex", justifyContent: "center", margin: "24px 0" }}>
                                <div style={{ width: 120, height: 120, position: "relative" }}>
                                    <svg width="120" height="120" viewBox="0 0 120 120">
                                        <circle cx="60" cy="60" r="50" fill="none" stroke="var(--myra-surface-2)" strokeWidth="8" />
                                        <circle
                                            cx="60"
                                            cy="60"
                                            r="50"
                                            fill="none"
                                            stroke={ACCENT}
                                            strokeWidth="8"
                                            strokeDasharray="220 94"
                                            strokeLinecap="round"
                                            transform="rotate(-90 60 60)"
                                        />
                                    </svg>
                                    <div
                                        style={{
                                            position: "absolute",
                                            inset: 0,
                                            display: "flex",
                                            flexDirection: "column",
                                            alignItems: "center",
                                            justifyContent: "center",
                                        }}
                                    >
                                        <span style={{ fontSize: 10, color: "var(--myra-text-secondary)" }}>+</span>
                                        <span style={{ fontSize: 18, fontWeight: 700, color: ACCENT }}>$4.2k</span>
                                    </div>
                                </div>
                            </div>

                            <div style={{ flex: 1 }} />

                            {[
                                { label: "Income", amount: "$12,400" },
                                { label: "Expenses", amount: "$8,200" },
                            ].map((item) => (
                                <div
                                    key={item.label}
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        padding: "12px 0",
                                        borderTop: "1px solid var(--myra-glass-border)",
                                    }}
                                >
                                    <span style={{ fontSize: 13, color: "var(--myra-text-secondary)" }}>{item.label}</span>
                                    <span style={{ fontSize: 14, fontWeight: 600, color: "var(--myra-text)" }}>
                                        {item.amount}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default NewMobileApp;
