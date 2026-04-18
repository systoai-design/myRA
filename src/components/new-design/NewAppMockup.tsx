import { useState } from "react";
import { useScrollReveal, useSectionScroll } from "./hooks";

const ACCENT = "#00D4AA";

const TABS = ["Net Worth", "Cashflow", "Portfolio"] as const;

const ACCOUNTS = [
    { name: "Cash", amount: "$45,200", icon: "💵" },
    { name: "Investments", amount: "$850,300", icon: "📈" },
    { name: "Real Estate", amount: "$309,000", icon: "🏠" },
];

const NewAppMockup = () => {
    const [sRef, ratio] = useSectionScroll<HTMLElement>();
    const [rRef, visible] = useScrollReveal<HTMLElement>(0.1);
    const [activeTab, setActiveTab] = useState(0);

    const setRef = (el: HTMLElement | null) => {
        sRef.current = el;
        rRef.current = el;
    };

    const rotX = 12 - ratio * 12;
    const rotY = -4 + ratio * 4;
    const scale = 0.85 + ratio * 0.15;

    return (
        <section
            ref={setRef}
            style={{
                padding: "120px 24px 160px",
                position: "relative",
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
                Net Worth Tracking
            </span>

            <h2
                style={{
                    fontFamily: "var(--myra-font-display)",
                    fontSize: "clamp(36px, 5vw, 72px)",
                    fontWeight: 400,
                    textAlign: "center",
                    lineHeight: 1.1,
                    maxWidth: 700,
                    margin: 0,
                    opacity: visible ? 1 : 0,
                    transform: visible ? "translateY(0)" : "translateY(30px)",
                    transition: "all 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.1s",
                }}
            >
                Manage your <span style={{ fontStyle: "italic", color: ACCENT }}>Net Worth</span>
            </h2>

            {/* 3D Dashboard */}
            <div style={{ marginTop: 64, width: "100%", maxWidth: 900, perspective: 1200 }}>
                <div
                    style={{
                        transform: `rotateX(${rotX}deg) rotateY(${rotY}deg) scale(${scale})`,
                        transition: "transform 0.1s linear",
                        transformStyle: "preserve-3d",
                        borderRadius: 20,
                        overflow: "hidden",
                        background: "linear-gradient(145deg, #111116, #0d0d11)",
                        border: "1px solid var(--myra-glass-border)",
                        boxShadow: `0 40px 80px rgba(0,0,0,0.6), 0 0 120px ${ACCENT}14`,
                        padding: "clamp(16px, 3vw, 32px)",
                    }}
                >
                    {/* Browser chrome */}
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 24 }}>
                        <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#ff5f57" }} />
                        <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#febc2e" }} />
                        <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#28c840" }} />
                        <div
                            style={{
                                flex: 1,
                                height: 28,
                                background: "var(--myra-surface)",
                                borderRadius: 8,
                                marginLeft: 12,
                                display: "flex",
                                alignItems: "center",
                                paddingLeft: 12,
                            }}
                        >
                            <span style={{ fontSize: 11, color: "var(--myra-text-secondary)" }}>
                                retirewithmyra.com/dashboard
                            </span>
                        </div>
                    </div>

                    {/* Net worth header */}
                    <div style={{ marginBottom: 32 }}>
                        <div
                            style={{
                                fontSize: 12,
                                color: "var(--myra-text-secondary)",
                                letterSpacing: "0.06em",
                                textTransform: "uppercase",
                                marginBottom: 8,
                            }}
                        >
                            Total Net Worth
                        </div>
                        <div style={{ display: "flex", alignItems: "baseline", flexWrap: "wrap", gap: 16 }}>
                            <span
                                style={{
                                    fontSize: "clamp(32px, 5vw, 48px)",
                                    fontWeight: 700,
                                    fontFamily: "var(--myra-font-body)",
                                    letterSpacing: "-0.02em",
                                    color: "var(--myra-text)",
                                }}
                            >
                                $1,204,500
                            </span>
                            <span
                                style={{
                                    fontSize: 14,
                                    fontWeight: 600,
                                    color: ACCENT,
                                    background: `${ACCENT}26`,
                                    padding: "4px 10px",
                                    borderRadius: 8,
                                }}
                            >
                                +12.5% All Time
                            </span>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div
                        style={{
                            display: "flex",
                            gap: 2,
                            marginBottom: 24,
                            background: "var(--myra-surface)",
                            borderRadius: 10,
                            padding: 3,
                            width: "fit-content",
                        }}
                    >
                        {TABS.map((t, i) => (
                            <button
                                key={t}
                                onClick={() => setActiveTab(i)}
                                style={{
                                    padding: "6px 16px",
                                    borderRadius: 8,
                                    fontSize: 13,
                                    fontWeight: 500,
                                    cursor: "pointer",
                                    border: "none",
                                    fontFamily: "var(--myra-font-body)",
                                    background: i === activeTab ? ACCENT : "transparent",
                                    color: i === activeTab ? "#000" : "var(--myra-text-secondary)",
                                    transition: "background 0.2s, color 0.2s",
                                }}
                            >
                                {t}
                            </button>
                        ))}
                    </div>

                    {/* Chart area */}
                    <div style={{ height: 260, position: "relative", borderRadius: 12, overflow: "hidden" }}>
                        <svg width="100%" height="100%" viewBox="0 0 836 260" preserveAspectRatio="none">
                            <defs>
                                <linearGradient id="myra-chart-grad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor={ACCENT} stopOpacity="0.25" />
                                    <stop offset="100%" stopColor={ACCENT} stopOpacity="0" />
                                </linearGradient>
                            </defs>
                            <path
                                d="M0,220 C80,210 120,200 180,180 C240,160 280,170 340,140 C400,110 440,130 500,100 C560,70 600,90 660,50 C720,20 780,30 836,10"
                                fill="none"
                                stroke={ACCENT}
                                strokeWidth="2.5"
                            />
                            <path
                                d="M0,220 C80,210 120,200 180,180 C240,160 280,170 340,140 C400,110 440,130 500,100 C560,70 600,90 660,50 C720,20 780,30 836,10 L836,260 L0,260 Z"
                                fill="url(#myra-chart-grad)"
                            />
                        </svg>
                        {[0.25, 0.5, 0.75].map((p) => (
                            <div
                                key={p}
                                style={{
                                    position: "absolute",
                                    top: `${p * 100}%`,
                                    left: 0,
                                    right: 0,
                                    height: 1,
                                    background: "rgba(255,255,255,0.04)",
                                }}
                            />
                        ))}
                    </div>

                    {/* Account cards */}
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                            gap: 12,
                            marginTop: 24,
                        }}
                    >
                        {ACCOUNTS.map((a) => (
                            <div
                                key={a.name}
                                style={{
                                    background: "var(--myra-surface)",
                                    borderRadius: 12,
                                    padding: 16,
                                    border: "1px solid var(--myra-glass-border)",
                                }}
                            >
                                <div
                                    style={{
                                        fontSize: 12,
                                        color: "var(--myra-text-secondary)",
                                        marginBottom: 4,
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 6,
                                    }}
                                >
                                    <span style={{ fontSize: 14 }}>{a.icon}</span> {a.name}
                                </div>
                                <div
                                    style={{
                                        fontSize: 22,
                                        fontWeight: 700,
                                        letterSpacing: "-0.02em",
                                        color: "var(--myra-text)",
                                    }}
                                >
                                    {a.amount}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default NewAppMockup;
