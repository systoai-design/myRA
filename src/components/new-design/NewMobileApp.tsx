import { useScrollReveal, useSectionScroll } from "./hooks";

const ACCENT = "#00D4AA";
const ACCENT_2 = "#6e56cf";
const ACCENT_3 = "#f59e0b";

const FEATURES = [
    "Smart portfolio rebalancing",
    "Real-time spending alerts",
    "AI-powered tax optimization",
];

// ─── Mini dashboard rendered inside the phone screen ───
const MiniDashboard = () => {
    // Donut segments for tax-category allocation
    const segments = [
        { label: "Pre-Tax", value: 58, color: ACCENT, amount: "$142k" },
        { label: "Post-Tax", value: 27, color: ACCENT_2, amount: "$66k" },
        { label: "Tax-Free", value: 15, color: ACCENT_3, amount: "$37k" },
    ];
    const circumference = 2 * Math.PI * 42;
    let offset = 0;
    const donutStrokes = segments.map((seg) => {
        const dash = (seg.value / 100) * circumference;
        const stroke = {
            color: seg.color,
            dasharray: `${dash} ${circumference - dash}`,
            dashoffset: -offset,
        };
        offset += dash;
        return stroke;
    });

    const accounts = [
        { name: "Fidelity 401(k)", type: "Pre-Tax", amount: "$142,000", color: ACCENT },
        { name: "Schwab Brokerage", type: "Post-Tax", amount: "$66,400", color: ACCENT_2 },
        { name: "Roth IRA", type: "Tax-Free", amount: "$37,200", color: ACCENT_3 },
    ];

    return (
        <div
            style={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                background: "linear-gradient(180deg, #08090e 0%, #000 100%)",
                color: "#f5f5f7",
                fontFamily: "var(--myra-font-body)",
                overflow: "hidden",
            }}
        >
            {/* ── iOS status bar ── */}
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "10px 24px 4px",
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: 0.2,
                }}
            >
                <span>9:41</span>
                <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
                    {/* signal */}
                    <svg width="15" height="10" viewBox="0 0 15 10" fill="#fff">
                        <rect x="0" y="7" width="2.5" height="3" rx="0.5" />
                        <rect x="3.5" y="5" width="2.5" height="5" rx="0.5" />
                        <rect x="7" y="3" width="2.5" height="7" rx="0.5" />
                        <rect x="10.5" y="0" width="2.5" height="10" rx="0.5" />
                    </svg>
                    {/* battery */}
                    <svg width="22" height="10" viewBox="0 0 22 10" fill="none">
                        <rect x="0.5" y="0.5" width="18" height="9" rx="2" stroke="#fff" strokeOpacity="0.5" />
                        <rect x="2" y="2" width="13" height="6" rx="1" fill="#fff" />
                        <rect x="19.5" y="3.5" width="1.5" height="3" rx="0.5" fill="#fff" fillOpacity="0.5" />
                    </svg>
                </div>
            </div>

            {/* ── Scrollable content ── */}
            <div style={{ flex: 1, padding: "14px 16px 8px", display: "flex", flexDirection: "column", gap: 10, overflow: "hidden" }}>
                {/* Greeting */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", fontWeight: 500, letterSpacing: 0.5 }}>
                            GOOD MORNING
                        </div>
                        <div
                            style={{
                                fontFamily: "var(--myra-font-display)",
                                fontSize: 22,
                                fontWeight: 700,
                                letterSpacing: -0.5,
                                marginTop: 2,
                            }}
                        >
                            Kyle
                        </div>
                    </div>
                    <div
                        style={{
                            width: 32,
                            height: 32,
                            borderRadius: "50%",
                            background: `linear-gradient(135deg, ${ACCENT} 0%, ${ACCENT_2} 100%)`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 13,
                            fontWeight: 700,
                            color: "#000",
                            boxShadow: `0 4px 12px ${ACCENT}33`,
                        }}
                    >
                        K
                    </div>
                </div>

                {/* Net Worth hero card */}
                <div
                    style={{
                        position: "relative",
                        borderRadius: 18,
                        padding: "16px 16px 14px",
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        overflow: "hidden",
                    }}
                >
                    {/* subtle glow */}
                    <div
                        aria-hidden
                        style={{
                            position: "absolute",
                            top: -20,
                            right: -20,
                            width: 120,
                            height: 120,
                            background: `radial-gradient(circle, ${ACCENT}33 0%, transparent 70%)`,
                            filter: "blur(24px)",
                        }}
                    />
                    <div style={{ position: "relative", zIndex: 1 }}>
                        <div style={{ fontSize: 9, color: "rgba(255,255,255,0.5)", fontWeight: 700, letterSpacing: 1 }}>
                            TOTAL NET WORTH
                        </div>
                        <div
                            style={{
                                fontFamily: "var(--myra-font-display)",
                                fontSize: 32,
                                fontWeight: 700,
                                marginTop: 4,
                                letterSpacing: -1,
                            }}
                        >
                            $245,600
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 4 }}>
                            <span
                                style={{
                                    fontSize: 10,
                                    fontWeight: 700,
                                    color: ACCENT,
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: 2,
                                }}
                            >
                                <svg width="8" height="8" viewBox="0 0 8 8" fill={ACCENT}>
                                    <path d="M4 1 L7 5 L5 5 L5 7 L3 7 L3 5 L1 5 Z" />
                                </svg>
                                +$4,280 (1.8%)
                            </span>
                            <span style={{ fontSize: 9, color: "rgba(255,255,255,0.4)" }}>this month</span>
                        </div>
                    </div>
                </div>

                {/* Allocation donut + legend */}
                <div
                    style={{
                        borderRadius: 18,
                        padding: 14,
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        display: "flex",
                        gap: 12,
                        alignItems: "center",
                    }}
                >
                    <div style={{ width: 90, height: 90, position: "relative", flexShrink: 0 }}>
                        <svg width="90" height="90" viewBox="0 0 100 100" style={{ transform: "rotate(-90deg)" }}>
                            <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
                            {donutStrokes.map((s, i) => (
                                <circle
                                    key={i}
                                    cx="50"
                                    cy="50"
                                    r="42"
                                    fill="none"
                                    stroke={s.color}
                                    strokeWidth="10"
                                    strokeDasharray={s.dasharray}
                                    strokeDashoffset={s.dashoffset}
                                    strokeLinecap="butt"
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
                            }}
                        >
                            <span style={{ fontSize: 8, color: "rgba(255,255,255,0.5)", fontWeight: 700, letterSpacing: 0.5 }}>
                                ALLOC
                            </span>
                            <span style={{ fontSize: 12, fontWeight: 700 }}>$245k</span>
                        </div>
                    </div>
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
                        {segments.map((seg) => (
                            <div key={seg.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                    <div style={{ width: 6, height: 6, borderRadius: 2, background: seg.color }} />
                                    <span style={{ fontSize: 10, color: "rgba(255,255,255,0.7)" }}>{seg.label}</span>
                                </div>
                                <span style={{ fontSize: 10, fontWeight: 700 }}>{seg.value}%</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Accounts list */}
                <div
                    style={{
                        borderRadius: 18,
                        padding: "10px 12px",
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.08)",
                    }}
                >
                    <div style={{ fontSize: 9, color: "rgba(255,255,255,0.5)", fontWeight: 700, letterSpacing: 1, marginBottom: 8, paddingLeft: 2 }}>
                        ACCOUNTS
                    </div>
                    {accounts.map((acc, i) => (
                        <div
                            key={acc.name}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                padding: "7px 2px",
                                borderTop: i === 0 ? "none" : "1px solid rgba(255,255,255,0.05)",
                            }}
                        >
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <div
                                    style={{
                                        width: 22,
                                        height: 22,
                                        borderRadius: 7,
                                        background: `${acc.color}22`,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }}
                                >
                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={acc.color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="3" y="8" width="18" height="12" rx="2" />
                                        <path d="M7 8V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v3" />
                                    </svg>
                                </div>
                                <div>
                                    <div style={{ fontSize: 10, fontWeight: 600 }}>{acc.name}</div>
                                    <div style={{ fontSize: 8, color: "rgba(255,255,255,0.4)", fontWeight: 500, letterSpacing: 0.5 }}>
                                        {acc.type.toUpperCase()}
                                    </div>
                                </div>
                            </div>
                            <span style={{ fontSize: 10, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>{acc.amount}</span>
                        </div>
                    ))}
                </div>

                <div style={{ flex: 1 }} />

                {/* Chat with myra pill */}
                <div
                    style={{
                        borderRadius: 14,
                        padding: "10px 14px",
                        background: `linear-gradient(135deg, ${ACCENT}1f 0%, ${ACCENT_2}1f 100%)`,
                        border: `1px solid ${ACCENT}33`,
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                    }}
                >
                    <div
                        style={{
                            width: 26,
                            height: 26,
                            borderRadius: 8,
                            background: `linear-gradient(135deg, ${ACCENT} 0%, ${ACCENT_2} 100%)`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                        </svg>
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 10, fontWeight: 700 }}>Ask myra</div>
                        <div style={{ fontSize: 8, color: "rgba(255,255,255,0.5)" }}>How's my tax diversification?</div>
                    </div>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="9 18 15 12 9 6" />
                    </svg>
                </div>
            </div>

            {/* ── iOS home indicator ── */}
            <div style={{ display: "flex", justifyContent: "center", paddingBottom: 8, paddingTop: 4 }}>
                <div style={{ width: 100, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.3)" }} />
            </div>
        </div>
    );
};

const NewMobileApp = () => {
    const [sRef, ratio] = useSectionScroll<HTMLElement>();
    const [rRef, visible] = useScrollReveal<HTMLElement>(0.1);

    const setRef = (el: HTMLElement | null) => {
        sRef.current = el;
        rRef.current = el;
    };

    // Slight parallax as the section scrolls, but always angled for 3D
    const phoneRotY = -18 + ratio * 10;
    const phoneRotX = 6 - ratio * 4;

    // iPhone 15 Pro proportions: roughly 1:2.05. Bumped up so the screen content reads clearly.
    const PHONE_W = 320;
    const PHONE_H = 660;

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
                        }}
                    >
                        <span style={{ fontFamily: "var(--myra-font-display)", fontWeight: 700 }}>Your</span>{" "}
                        <span style={{ fontFamily: "var(--myra-font-body)", fontWeight: 400 }}>entire financial life, in your pocket.</span>
                    </h2>
                    <p
                        style={{
                            fontFamily: "var(--myra-font-body)",
                            fontSize: 18,
                            fontWeight: 700,
                            lineHeight: 1.6,
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

                {/* ═══════ Realistic 3D iPhone ═══════ */}
                <div style={{ perspective: 1800, display: "flex", justifyContent: "center" }}>
                    <div
                        style={{
                            width: PHONE_W,
                            height: PHONE_H,
                            position: "relative",
                            transformStyle: "preserve-3d",
                            transform: `rotateY(${phoneRotY}deg) rotateX(${phoneRotX}deg)`,
                            transition: "transform 0.2s linear",
                            // NOTE: No `filter` here — filter: drop-shadow() forces raster of the whole
                            // subtree which destroys text crispness inside the phone. Shadow is applied
                            // via box-shadow on the titanium frame below instead.
                        }}
                    >
                        {/* ── Side buttons — chunky, protruding off the frame edges ── */}
                        {/* Action button (left top) */}
                        <div
                            aria-hidden
                            style={{
                                position: "absolute",
                                left: -4,
                                top: 100,
                                width: 5,
                                height: 30,
                                background: "linear-gradient(90deg, #1a1a1e 0%, #4a4a50 40%, #6a6a70 60%, #2a2a2e 100%)",
                                borderRadius: "3px 0 0 3px",
                                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.25), inset 0 -1px 0 rgba(0,0,0,0.5), -1px 0 2px rgba(0,0,0,0.4)",
                                zIndex: 0,
                            }}
                        />
                        {/* Volume up */}
                        <div
                            aria-hidden
                            style={{
                                position: "absolute",
                                left: -4,
                                top: 150,
                                width: 5,
                                height: 56,
                                background: "linear-gradient(90deg, #1a1a1e 0%, #4a4a50 40%, #6a6a70 60%, #2a2a2e 100%)",
                                borderRadius: "3px 0 0 3px",
                                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.25), inset 0 -1px 0 rgba(0,0,0,0.5), -1px 0 2px rgba(0,0,0,0.4)",
                                zIndex: 0,
                            }}
                        />
                        {/* Volume down */}
                        <div
                            aria-hidden
                            style={{
                                position: "absolute",
                                left: -4,
                                top: 214,
                                width: 5,
                                height: 56,
                                background: "linear-gradient(90deg, #1a1a1e 0%, #4a4a50 40%, #6a6a70 60%, #2a2a2e 100%)",
                                borderRadius: "3px 0 0 3px",
                                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.25), inset 0 -1px 0 rgba(0,0,0,0.5), -1px 0 2px rgba(0,0,0,0.4)",
                                zIndex: 0,
                            }}
                        />
                        {/* Power button (right) */}
                        <div
                            aria-hidden
                            style={{
                                position: "absolute",
                                right: -4,
                                top: 170,
                                width: 5,
                                height: 82,
                                background: "linear-gradient(-90deg, #1a1a1e 0%, #4a4a50 40%, #6a6a70 60%, #2a2a2e 100%)",
                                borderRadius: "0 3px 3px 0",
                                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.25), inset 0 -1px 0 rgba(0,0,0,0.5), 1px 0 2px rgba(0,0,0,0.4)",
                                zIndex: 0,
                            }}
                        />

                        {/* ── Titanium frame (outer body) with strong specular banding ── */}
                        <div
                            style={{
                                width: "100%",
                                height: "100%",
                                borderRadius: 48,
                                padding: 5,
                                position: "relative",
                                background: `
                                    linear-gradient(135deg,
                                        #7c7c82 0%,
                                        #a8a8b0 6%,
                                        #3a3a40 18%,
                                        #1e1e22 32%,
                                        #44444a 48%,
                                        #0e0e12 62%,
                                        #2e2e34 78%,
                                        #8e8e95 92%,
                                        #5a5a60 100%)
                                `,
                                boxShadow: `
                                    inset 0 2px 0 rgba(255,255,255,0.35),
                                    inset 0 -2px 0 rgba(0,0,0,0.6),
                                    inset 2px 0 0 rgba(255,255,255,0.12),
                                    inset -2px 0 0 rgba(255,255,255,0.12),
                                    0 0 0 1px rgba(0,0,0,0.4),
                                    0 40px 60px rgba(0,0,0,0.75),
                                    0 12px 24px rgba(0,0,0,0.55),
                                    0 0 80px rgba(0,212,170,0.12)
                                `,
                            }}
                        >
                            {/* Left-edge rim light — catches light due to the Y-axis rotation */}
                            <div
                                aria-hidden
                                style={{
                                    position: "absolute",
                                    left: 0,
                                    top: "8%",
                                    bottom: "8%",
                                    width: 3,
                                    background: "linear-gradient(180deg, transparent 0%, rgba(255,255,255,0.5) 30%, rgba(255,255,255,0.3) 70%, transparent 100%)",
                                    borderRadius: "3px 0 0 3px",
                                    pointerEvents: "none",
                                    zIndex: 3,
                                    filter: "blur(0.5px)",
                                }}
                            />

                            {/* Inner black bezel (deep frame that surrounds the glass) */}
                            <div
                                style={{
                                    width: "100%",
                                    height: "100%",
                                    borderRadius: 43,
                                    padding: 4,
                                    background: "linear-gradient(135deg, #050507 0%, #000 50%, #050507 100%)",
                                    position: "relative",
                                    overflow: "hidden",
                                    boxShadow: `
                                        inset 0 0 0 1px rgba(0,0,0,1),
                                        inset 0 1px 2px rgba(0,0,0,0.9)
                                    `,
                                }}
                            >
                                {/* Screen (black OLED surface) */}
                                <div
                                    style={{
                                        width: "100%",
                                        height: "100%",
                                        borderRadius: 39,
                                        overflow: "hidden",
                                        position: "relative",
                                        background: "#000",
                                    }}
                                >
                                    <MiniDashboard />

                                    {/* Dynamic Island */}
                                    <div
                                        aria-hidden
                                        style={{
                                            position: "absolute",
                                            top: 10,
                                            left: "50%",
                                            transform: "translateX(-50%)",
                                            width: 104,
                                            height: 30,
                                            background: "#000",
                                            borderRadius: 20,
                                            boxShadow: `
                                                inset 0 0 0 0.5px rgba(255,255,255,0.08),
                                                inset 0 1px 2px rgba(255,255,255,0.04),
                                                0 2px 6px rgba(0,0,0,0.8)
                                            `,
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "flex-end",
                                            paddingRight: 11,
                                            zIndex: 10,
                                        }}
                                    >
                                        {/* Front camera lens */}
                                        <div
                                            style={{
                                                width: 9,
                                                height: 9,
                                                borderRadius: "50%",
                                                background: "radial-gradient(circle at 30% 30%, #2a2a4e 0%, #0a0a18 60%, #000 100%)",
                                                boxShadow: `
                                                    inset 0 0 0 1px rgba(40,40,60,0.9),
                                                    inset 0 0 0 2px rgba(80,80,110,0.2)
                                                `,
                                            }}
                                        />
                                    </div>

                                    {/* ── Glass surface reflection — the big diagonal gloss stripe ── */}
                                    <div
                                        aria-hidden
                                        style={{
                                            position: "absolute",
                                            inset: 0,
                                            background: `linear-gradient(118deg,
                                                rgba(255,255,255,0) 0%,
                                                rgba(255,255,255,0.14) 18%,
                                                rgba(255,255,255,0.04) 28%,
                                                rgba(255,255,255,0) 42%,
                                                rgba(255,255,255,0) 58%,
                                                rgba(255,255,255,0.06) 70%,
                                                rgba(255,255,255,0) 82%)`,
                                            pointerEvents: "none",
                                            zIndex: 20,
                                            mixBlendMode: "screen",
                                        }}
                                    />

                                    {/* Subtle curved edge highlight on screen */}
                                    <div
                                        aria-hidden
                                        style={{
                                            position: "absolute",
                                            inset: 0,
                                            borderRadius: "inherit",
                                            background: "radial-gradient(ellipse 120% 90% at 15% 5%, rgba(255,255,255,0.1) 0%, transparent 35%)",
                                            pointerEvents: "none",
                                            zIndex: 21,
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Frame top-edge specular highlight */}
                            <div
                                aria-hidden
                                style={{
                                    position: "absolute",
                                    top: 1,
                                    left: "15%",
                                    right: "15%",
                                    height: 2,
                                    background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.7), transparent)",
                                    borderRadius: 2,
                                    pointerEvents: "none",
                                    filter: "blur(0.5px)",
                                    zIndex: 2,
                                }}
                            />

                            {/* Frame bottom-edge shadow */}
                            <div
                                aria-hidden
                                style={{
                                    position: "absolute",
                                    bottom: 1,
                                    left: "20%",
                                    right: "20%",
                                    height: 1.5,
                                    background: "linear-gradient(90deg, transparent, rgba(0,0,0,0.7), transparent)",
                                    borderRadius: 2,
                                    pointerEvents: "none",
                                    zIndex: 2,
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default NewMobileApp;
