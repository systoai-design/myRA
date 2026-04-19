import { useState, useEffect, useRef } from "react";
import { useScrollReveal, useSectionScroll } from "./hooks";

const ACCENT = "#00D4AA";
const BLUE = "#3b82f6";
const EMERALD = "#10b981";
const PURPLE = "#8b5cf6";
const AMBER = "#f59e0b";

const TABS = ["Net Worth", "Cashflow", "Portfolio"] as const;

const ALLOCATION = [
    { name: "Pre-Tax (401k, IRA)", value: 482_000, color: BLUE, pct: 40 },
    { name: "Post-Tax (Brokerage)", value: 361_350, color: EMERALD, pct: 30 },
    { name: "Tax-Free (Roth)", value: 240_900, color: PURPLE, pct: 20 },
    { name: "Other", value: 120_250, color: AMBER, pct: 10 },
];

const QUICK_STATS = [
    { label: "Net Worth", value: "$1.20M", icon: "wallet", color: BLUE },
    { label: "Retire By", value: "Age 62", icon: "target", color: PURPLE },
    { label: "Accounts", value: "7", icon: "bars", color: EMERALD },
    { label: "Profile", value: "92%", icon: "user", color: AMBER, isProgress: true, progress: 92 },
];

const RECENT = [
    { title: "Chat with myra · Roth conversion", time: "2h ago" },
    { title: "Portfolio rebalance suggestion", time: "1d ago" },
    { title: "Tax-loss harvest opportunity", time: "3d ago" },
];

const ROTATING_WORDS = ["Net Worth", "Portfolio", "Cashflow", "Taxes"];

const formatCurrency = (n: number) => `$${n.toLocaleString()}`;

const useCountUp = (target: number, start: boolean, durationMs = 1800) => {
    const [value, setValue] = useState(0);
    useEffect(() => {
        if (!start) return;
        let raf = 0;
        const t0 = performance.now();
        const tick = (now: number) => {
            const t = Math.min(1, (now - t0) / durationMs);
            const eased = 1 - Math.pow(1 - t, 3);
            setValue(Math.round(target * eased));
            if (t < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, [target, start, durationMs]);
    return value;
};

const Icon = ({ type, color }: { type: string; color: string }) => {
    const props = {
        width: 16,
        height: 16,
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: color,
        strokeWidth: 2,
        strokeLinecap: "round" as const,
        strokeLinejoin: "round" as const,
    };
    switch (type) {
        case "wallet":
            return (
                <svg {...props}>
                    <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
                    <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
                    <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
                </svg>
            );
        case "target":
            return (
                <svg {...props}>
                    <circle cx="12" cy="12" r="10" />
                    <circle cx="12" cy="12" r="6" />
                    <circle cx="12" cy="12" r="2" />
                </svg>
            );
        case "bars":
            return (
                <svg {...props}>
                    <line x1="18" y1="20" x2="18" y2="10" />
                    <line x1="12" y1="20" x2="12" y2="4" />
                    <line x1="6" y1="20" x2="6" y2="14" />
                </svg>
            );
        case "user":
            return (
                <svg {...props}>
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                </svg>
            );
        case "sparkles":
            return (
                <svg {...props}>
                    <path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9Z" />
                    <path d="M19 3v4" />
                    <path d="M21 5h-4" />
                </svg>
            );
        case "chat":
            return (
                <svg {...props}>
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
            );
        default:
            return null;
    }
};

const NewAppMockup = () => {
    const [sRef, ratio] = useSectionScroll<HTMLElement>();
    const [rRef, visible] = useScrollReveal<HTMLElement>(0.1);
    const [activeTab, setActiveTab] = useState(0);
    const [animKey, setAnimKey] = useState(0);
    const [wordIndex, setWordIndex] = useState(0);
    const [wordFading, setWordFading] = useState(false);
    const hasAnimated = useRef(false);

    // Rotating word cycle
    useEffect(() => {
        const interval = setInterval(() => {
            setWordFading(true);
            setTimeout(() => {
                setWordIndex((p) => (p + 1) % ROTATING_WORDS.length);
                setWordFading(false);
            }, 280);
        }, 2600);
        return () => clearInterval(interval);
    }, []);

    const setRef = (el: HTMLElement | null) => {
        sRef.current = el;
        rRef.current = el;
    };

    // Trigger count-up once when visible
    useEffect(() => {
        if (visible && !hasAnimated.current) {
            hasAnimated.current = true;
            setAnimKey((k) => k + 1);
        }
    }, [visible]);

    const netWorth = useCountUp(1_204_500, visible);

    const rotX = 12 - ratio * 12;
    const rotY = -4 + ratio * 4;
    const scale = 0.85 + ratio * 0.15;

    // Donut math: circumference = 2πr, we use r=55 → C ≈ 345.58
    const R = 55;
    const CIRC = 2 * Math.PI * R;

    // Pre-compute donut segment offsets
    let cumulative = 0;
    const donutSegments = ALLOCATION.map((a) => {
        const length = (CIRC * a.pct) / 100;
        const segment = { ...a, length, offset: -cumulative };
        cumulative += length;
        return segment;
    });

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
                The Dashboard
            </span>

            <h2
                style={{
                    fontSize: "clamp(32px, 5vw, 68px)",
                    textAlign: "center",
                    lineHeight: 1.1,
                    maxWidth: 1000,
                    margin: 0,
                    padding: "0 24px",
                    whiteSpace: "nowrap",
                    display: "flex",
                    flexWrap: "wrap",
                    justifyContent: "center",
                    alignItems: "baseline",
                    columnGap: "0.25em",
                    opacity: visible ? 1 : 0,
                    transform: visible ? "translateY(0)" : "translateY(30px)",
                    transition: "all 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.1s",
                }}
            >
                <span style={{ fontFamily: "var(--myra-font-display)", fontWeight: 700 }}>Manage</span>
                <span style={{ fontFamily: "var(--myra-font-body)", fontWeight: 400 }}>your</span>
                <span
                    aria-live="polite"
                    style={{
                        fontFamily: "var(--myra-font-display)",
                        fontStyle: "italic",
                        fontWeight: 700,
                        color: PURPLE,
                        display: "inline-block",
                        minWidth: "7ch",
                        textAlign: "left",
                        transform: wordFading ? "translateY(8px)" : "translateY(0)",
                        opacity: wordFading ? 0 : 1,
                        transition: "opacity 0.28s ease, transform 0.28s ease",
                    }}
                >
                    {ROTATING_WORDS[wordIndex]}
                </span>
            </h2>

            {/* 3D Dashboard */}
            <div style={{ marginTop: 64, width: "100%", maxWidth: 1060, perspective: 1600 }}>
                <div
                    style={{
                        transform: `rotateX(${rotX}deg) rotateY(${rotY}deg) scale(${scale})`,
                        transition: "transform 0.1s linear",
                        transformStyle: "preserve-3d",
                        borderRadius: 24,
                        overflow: "hidden",
                        background: "linear-gradient(145deg, #0f0f14, #090909)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        boxShadow: `0 60px 120px rgba(0,0,0,0.7), 0 0 160px ${ACCENT}1a`,
                        padding: "clamp(14px, 2.2vw, 22px)",
                    }}
                >
                    {/* Browser chrome */}
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 18 }}>
                        <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#ff5f57" }} />
                        <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#febc2e" }} />
                        <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#28c840" }} />
                        <div
                            style={{
                                flex: 1,
                                height: 26,
                                background: "rgba(255,255,255,0.05)",
                                borderRadius: 8,
                                marginLeft: 12,
                                display: "flex",
                                alignItems: "center",
                                paddingLeft: 12,
                                gap: 8,
                            }}
                        >
                            <span
                                style={{
                                    width: 6,
                                    height: 6,
                                    borderRadius: "50%",
                                    background: EMERALD,
                                    animation: "myra-pulse-dot 1.8s ease-in-out infinite",
                                }}
                            />
                            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.55)" }}>
                                retirewithmyra.com/app
                            </span>
                        </div>
                    </div>

                    {/* Welcome banner */}
                    <div
                        key={`greet-${animKey}`}
                        style={{
                            background: "linear-gradient(135deg, rgba(59,130,246,0.12), rgba(139,92,246,0.10))",
                            border: "1px solid rgba(139,92,246,0.22)",
                            borderRadius: 16,
                            padding: "14px 18px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: 16,
                            marginBottom: 18,
                            flexWrap: "wrap",
                            opacity: visible ? 1 : 0,
                            animation: visible ? "myra-stagger-up 0.7s cubic-bezier(0.16,1,0.3,1) both" : "none",
                        }}
                    >
                        <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                            <div
                                style={{
                                    width: 36,
                                    height: 36,
                                    borderRadius: 10,
                                    background: "rgba(139,92,246,0.22)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    flexShrink: 0,
                                }}
                            >
                                <Icon type="sparkles" color={PURPLE} />
                            </div>
                            <div style={{ minWidth: 0 }}>
                                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", fontWeight: 500 }}>
                                    Good morning,
                                </div>
                                <div
                                    style={{
                                        fontSize: 18,
                                        fontWeight: 700,
                                        background: `linear-gradient(90deg, ${BLUE}, ${PURPLE})`,
                                        WebkitBackgroundClip: "text",
                                        WebkitTextFillColor: "transparent",
                                        backgroundClip: "text",
                                    }}
                                >
                                    Kyle
                                </div>
                            </div>
                        </div>
                        <div
                            style={{
                                fontSize: 12,
                                color: "rgba(255,255,255,0.6)",
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                            }}
                        >
                            <span style={{ position: "relative", width: 8, height: 8 }}>
                                <span
                                    style={{
                                        position: "absolute",
                                        inset: 0,
                                        borderRadius: "50%",
                                        background: EMERALD,
                                    }}
                                />
                                <span
                                    style={{
                                        position: "absolute",
                                        inset: 0,
                                        borderRadius: "50%",
                                        background: EMERALD,
                                        animation: "myra-pulse-ring 1.8s ease-out infinite",
                                    }}
                                />
                            </span>
                            myra is monitoring your plan · live
                        </div>
                    </div>

                    {/* Quick Stats Grid */}
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(4, 1fr)",
                            gap: 10,
                            marginBottom: 18,
                        }}
                    >
                        {QUICK_STATS.map((s, i) => (
                            <div
                                key={s.label}
                                style={{
                                    background: "rgba(255,255,255,0.03)",
                                    border: "1px solid rgba(255,255,255,0.06)",
                                    borderRadius: 12,
                                    padding: "12px 14px",
                                    opacity: visible ? 1 : 0,
                                    animation: visible
                                        ? `myra-stagger-up 0.6s cubic-bezier(0.16,1,0.3,1) ${0.1 + i * 0.08}s both`
                                        : "none",
                                }}
                            >
                                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                                    <div
                                        style={{
                                            width: 22,
                                            height: 22,
                                            borderRadius: 6,
                                            background: `${s.color}22`,
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                        }}
                                    >
                                        <Icon type={s.icon} color={s.color} />
                                    </div>
                                    <span
                                        style={{
                                            fontSize: 10,
                                            letterSpacing: "0.08em",
                                            textTransform: "uppercase",
                                            color: "rgba(255,255,255,0.55)",
                                            fontWeight: 600,
                                        }}
                                    >
                                        {s.label}
                                    </span>
                                </div>
                                <div
                                    style={{
                                        fontSize: 18,
                                        fontWeight: 700,
                                        color: "#fff",
                                        letterSpacing: "-0.01em",
                                        fontFamily: "var(--myra-font-body)",
                                    }}
                                >
                                    {s.value}
                                </div>
                                {s.isProgress && (
                                    <div
                                        style={{
                                            marginTop: 6,
                                            height: 3,
                                            borderRadius: 2,
                                            background: "rgba(255,255,255,0.06)",
                                            overflow: "hidden",
                                        }}
                                    >
                                        <div
                                            key={`prog-${animKey}`}
                                            style={{
                                                height: "100%",
                                                width: `${s.progress}%`,
                                                background: `linear-gradient(90deg, ${BLUE}, ${EMERALD})`,
                                                transformOrigin: "left",
                                                animation: visible
                                                    ? `myra-bar-grow 1.4s cubic-bezier(0.16,1,0.3,1) 0.5s both`
                                                    : "none",
                                            }}
                                        />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Main grid: Net Worth + Allocation */}
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "1.6fr 1fr",
                            gap: 14,
                            marginBottom: 14,
                        }}
                    >
                        {/* LEFT: Net worth + chart */}
                        <div
                            style={{
                                background: "rgba(255,255,255,0.03)",
                                border: "1px solid rgba(255,255,255,0.07)",
                                borderRadius: 16,
                                padding: 18,
                            }}
                        >
                            <div
                                style={{
                                    fontSize: 10,
                                    letterSpacing: "0.1em",
                                    textTransform: "uppercase",
                                    color: "rgba(255,255,255,0.55)",
                                    fontWeight: 600,
                                    marginBottom: 6,
                                }}
                            >
                                Total Net Worth
                            </div>
                            <div style={{ display: "flex", alignItems: "baseline", gap: 12, flexWrap: "wrap", marginBottom: 12 }}>
                                <span
                                    style={{
                                        fontSize: "clamp(26px, 3.2vw, 38px)",
                                        fontWeight: 700,
                                        color: "#fff",
                                        fontFamily: "var(--myra-font-body)",
                                        letterSpacing: "-0.02em",
                                        fontVariantNumeric: "tabular-nums",
                                    }}
                                >
                                    {formatCurrency(netWorth)}
                                </span>
                                <span
                                    style={{
                                        fontSize: 12,
                                        fontWeight: 600,
                                        color: EMERALD,
                                        background: `${EMERALD}1f`,
                                        padding: "3px 8px",
                                        borderRadius: 6,
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: 4,
                                    }}
                                >
                                    ▲ 12.5% All Time
                                </span>
                            </div>

                            {/* Tabs */}
                            <div
                                style={{
                                    display: "flex",
                                    gap: 2,
                                    marginBottom: 14,
                                    background: "rgba(255,255,255,0.04)",
                                    borderRadius: 8,
                                    padding: 2,
                                    width: "fit-content",
                                    position: "relative",
                                }}
                            >
                                {TABS.map((t, i) => (
                                    <button
                                        key={t}
                                        onClick={() => setActiveTab(i)}
                                        style={{
                                            padding: "5px 12px",
                                            borderRadius: 6,
                                            fontSize: 11,
                                            fontWeight: 500,
                                            cursor: "pointer",
                                            border: "none",
                                            fontFamily: "var(--myra-font-body)",
                                            background: i === activeTab ? ACCENT : "transparent",
                                            color: i === activeTab ? "#000" : "rgba(255,255,255,0.6)",
                                            transition: "background 0.25s ease, color 0.25s ease",
                                        }}
                                    >
                                        {t}
                                    </button>
                                ))}
                            </div>

                            {/* Chart */}
                            <div style={{ height: 170, position: "relative" }}>
                                <svg width="100%" height="100%" viewBox="0 0 700 170" preserveAspectRatio="none">
                                    <defs>
                                        <linearGradient id="myra-chart-grad-2" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor={ACCENT} stopOpacity="0.35" />
                                            <stop offset="100%" stopColor={ACCENT} stopOpacity="0" />
                                        </linearGradient>
                                    </defs>
                                    {[0.25, 0.5, 0.75].map((p) => (
                                        <line
                                            key={p}
                                            x1="0"
                                            y1={p * 170}
                                            x2="700"
                                            y2={p * 170}
                                            stroke="rgba(255,255,255,0.05)"
                                            strokeWidth="1"
                                        />
                                    ))}
                                    {/* Area fill */}
                                    <path
                                        d="M0,145 C70,138 110,128 160,118 C210,108 250,115 300,95 C350,75 395,85 445,65 C495,45 540,55 590,30 C640,5 680,12 700,8 L700,170 L0,170 Z"
                                        fill="url(#myra-chart-grad-2)"
                                        opacity={visible ? 1 : 0}
                                        style={{ transition: "opacity 1s ease 0.8s" }}
                                    />
                                    {/* Animated line */}
                                    <path
                                        key={`line-${animKey}`}
                                        d="M0,145 C70,138 110,128 160,118 C210,108 250,115 300,95 C350,75 395,85 445,65 C495,45 540,55 590,30 C640,5 680,12 700,8"
                                        fill="none"
                                        stroke={ACCENT}
                                        strokeWidth="2.5"
                                        strokeLinecap="round"
                                        strokeDasharray="1200"
                                        style={{
                                            ["--myra-path-length" as string]: "1200",
                                            animation: visible
                                                ? "myra-draw-line 2s cubic-bezier(0.4,0,0.2,1) 0.3s both"
                                                : "none",
                                            strokeDashoffset: visible ? undefined : "1200",
                                        }}
                                    />
                                    {/* End dot */}
                                    <circle
                                        cx="700"
                                        cy="8"
                                        r="4"
                                        fill={ACCENT}
                                        opacity={visible ? 1 : 0}
                                        style={{ transition: "opacity 0.4s ease 2.2s" }}
                                    />
                                </svg>
                            </div>
                        </div>

                        {/* RIGHT: Allocation donut */}
                        <div
                            style={{
                                background: "rgba(255,255,255,0.03)",
                                border: "1px solid rgba(255,255,255,0.07)",
                                borderRadius: 16,
                                padding: 18,
                                display: "flex",
                                flexDirection: "column",
                            }}
                        >
                            <div
                                style={{
                                    fontSize: 10,
                                    letterSpacing: "0.1em",
                                    textTransform: "uppercase",
                                    color: "rgba(255,255,255,0.55)",
                                    fontWeight: 600,
                                    marginBottom: 4,
                                }}
                            >
                                Asset Allocation
                            </div>
                            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", marginBottom: 12 }}>
                                By tax category
                            </div>

                            <div style={{ position: "relative", width: 140, height: 140, margin: "0 auto" }}>
                                <svg
                                    width="140"
                                    height="140"
                                    viewBox="0 0 140 140"
                                    style={{ transform: "rotate(-90deg)" }}
                                >
                                    {/* Track */}
                                    <circle
                                        cx="70"
                                        cy="70"
                                        r={R}
                                        fill="none"
                                        stroke="rgba(255,255,255,0.05)"
                                        strokeWidth="14"
                                    />
                                    {donutSegments.map((seg, i) => (
                                        <circle
                                            key={`${seg.name}-${animKey}`}
                                            cx="70"
                                            cy="70"
                                            r={R}
                                            fill="none"
                                            stroke={seg.color}
                                            strokeWidth="14"
                                            strokeLinecap="butt"
                                            strokeDasharray={`${seg.length} ${CIRC}`}
                                            strokeDashoffset={-cumulativeOffset(donutSegments, i)}
                                            style={{
                                                opacity: visible ? 1 : 0,
                                                transformOrigin: "center",
                                                transition: `opacity 0.3s ease ${0.4 + i * 0.15}s, stroke-dasharray 0.7s cubic-bezier(0.16,1,0.3,1) ${0.4 + i * 0.15}s`,
                                            }}
                                        />
                                    ))}
                                </svg>
                                <div
                                    style={{
                                        position: "absolute",
                                        inset: 0,
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        opacity: visible ? 1 : 0,
                                        transition: "opacity 0.6s ease 1.2s",
                                    }}
                                >
                                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                                        Total
                                    </div>
                                    <div
                                        style={{
                                            fontSize: 16,
                                            fontWeight: 700,
                                            color: "#fff",
                                            letterSpacing: "-0.01em",
                                        }}
                                    >
                                        $1.20M
                                    </div>
                                </div>
                            </div>

                            <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 6 }}>
                                {ALLOCATION.map((a, i) => (
                                    <div
                                        key={a.name}
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 8,
                                            fontSize: 11,
                                            opacity: visible ? 1 : 0,
                                            animation: visible
                                                ? `myra-slide-in-right 0.5s cubic-bezier(0.16,1,0.3,1) ${0.9 + i * 0.08}s both`
                                                : "none",
                                        }}
                                    >
                                        <span
                                            style={{
                                                width: 8,
                                                height: 8,
                                                borderRadius: 2,
                                                background: a.color,
                                                flexShrink: 0,
                                            }}
                                        />
                                        <span style={{ color: "rgba(255,255,255,0.7)", flex: 1, minWidth: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                            {a.name}
                                        </span>
                                        <span style={{ color: "rgba(255,255,255,0.85)", fontWeight: 600 }}>
                                            {a.pct}%
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Bottom row: Insight + Activity */}
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1.3fr",
                            gap: 14,
                        }}
                    >
                        {/* myra AI insight */}
                        <div
                            style={{
                                background: "linear-gradient(135deg, rgba(139,92,246,0.14), rgba(139,92,246,0.05))",
                                border: "1px solid rgba(139,92,246,0.3)",
                                borderRadius: 16,
                                padding: 16,
                                opacity: visible ? 1 : 0,
                                animation: visible
                                    ? "myra-stagger-up 0.7s cubic-bezier(0.16,1,0.3,1) 1.2s both"
                                    : "none",
                            }}
                        >
                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                                <div
                                    style={{
                                        width: 22,
                                        height: 22,
                                        borderRadius: 6,
                                        background: "rgba(139,92,246,0.22)",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }}
                                >
                                    <Icon type="sparkles" color={PURPLE} />
                                </div>
                                <span
                                    style={{
                                        fontSize: 10,
                                        letterSpacing: "0.1em",
                                        textTransform: "uppercase",
                                        color: PURPLE,
                                        fontWeight: 700,
                                    }}
                                >
                                    myra Insight
                                </span>
                                {/* Typing dots */}
                                <span style={{ display: "inline-flex", gap: 3, marginLeft: "auto" }}>
                                    {[0, 1, 2].map((d) => (
                                        <span
                                            key={d}
                                            style={{
                                                width: 4,
                                                height: 4,
                                                borderRadius: "50%",
                                                background: PURPLE,
                                                animation: `myra-dot-bounce 1.2s ease-in-out ${d * 0.15}s infinite`,
                                            }}
                                        />
                                    ))}
                                </span>
                            </div>
                            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.85)", lineHeight: 1.4, marginBottom: 10 }}>
                                Your mix is <strong style={{ color: "#fff" }}>well-diversified across tax categories</strong>. Consider a Roth conversion this year to take advantage of current brackets.
                            </div>
                            <button
                                style={{
                                    background: PURPLE,
                                    color: "#fff",
                                    border: "none",
                                    padding: "6px 12px",
                                    borderRadius: 8,
                                    fontSize: 11,
                                    fontWeight: 600,
                                    cursor: "pointer",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: 6,
                                    fontFamily: "var(--myra-font-body)",
                                }}
                            >
                                <Icon type="chat" color="#fff" />
                                Analyze with myra
                            </button>
                        </div>

                        {/* Recent Activity */}
                        <div
                            style={{
                                background: "rgba(255,255,255,0.03)",
                                border: "1px solid rgba(255,255,255,0.07)",
                                borderRadius: 16,
                                padding: 16,
                                opacity: visible ? 1 : 0,
                                animation: visible
                                    ? "myra-stagger-up 0.7s cubic-bezier(0.16,1,0.3,1) 1.3s both"
                                    : "none",
                            }}
                        >
                            <div
                                style={{
                                    fontSize: 10,
                                    letterSpacing: "0.1em",
                                    textTransform: "uppercase",
                                    color: "rgba(255,255,255,0.55)",
                                    fontWeight: 600,
                                    marginBottom: 10,
                                }}
                            >
                                Recent Activity
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                {RECENT.map((r, i) => (
                                    <div
                                        key={r.title}
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 10,
                                            opacity: visible ? 1 : 0,
                                            animation: visible
                                                ? `myra-slide-in-right 0.5s cubic-bezier(0.16,1,0.3,1) ${1.5 + i * 0.1}s both`
                                                : "none",
                                        }}
                                    >
                                        <div
                                            style={{
                                                width: 22,
                                                height: 22,
                                                borderRadius: 6,
                                                background: `${BLUE}1f`,
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                flexShrink: 0,
                                            }}
                                        >
                                            <Icon type="chat" color={BLUE} />
                                        </div>
                                        <span
                                            style={{
                                                fontSize: 11.5,
                                                color: "rgba(255,255,255,0.75)",
                                                flex: 1,
                                                minWidth: 0,
                                                whiteSpace: "nowrap",
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                            }}
                                        >
                                            {r.title}
                                        </span>
                                        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.45)" }}>{r.time}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

// Helper: compute cumulative offset for donut rotation
function cumulativeOffset(
    segments: { length: number }[],
    upToIndex: number,
): number {
    let sum = 0;
    for (let i = 0; i < upToIndex; i++) sum += segments[i].length;
    return sum;
}

export default NewAppMockup;
