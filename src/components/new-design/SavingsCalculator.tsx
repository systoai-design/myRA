import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useScrollReveal } from "./hooks";

const ACCENT = "#00D4AA";

const getMyraFee = (balance: number): number => {
    if (balance <= 100_000) return 0.60;
    if (balance <= 500_000) return 0.50;
    if (balance <= 2_000_000) return 0.40;
    return 0.30;
};

const SavingsCalculator = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [ref, visible] = useScrollReveal<HTMLElement>(0.15);
    const [portfolio, setPortfolio] = useState(500_000);

    const myraFee = getMyraFee(portfolio);
    const annualSavings = useMemo(() => {
        const traditional = portfolio * 0.01;
        const myra = portfolio * (myraFee / 100);
        return Math.max(0, Math.round((traditional - myra) / 100) * 100);
    }, [portfolio, myraFee]);

    const handleStart = () => {
        if (user) navigate("/app");
        else document.getElementById("auth-modal-trigger")?.click();
    };

    const reveal = (delay = 0): React.CSSProperties => ({
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(30px)",
        transition: `opacity 0.8s cubic-bezier(0.16,1,0.3,1) ${delay}s, transform 0.8s cubic-bezier(0.16,1,0.3,1) ${delay}s`,
    });

    return (
        <section
            ref={ref}
            style={{
                padding: "120px 24px",
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
                Savings Calculator
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
                    ...reveal(0.1),
                }}
            >
                Calculate <span style={{ fontStyle: "italic", color: ACCENT }}>how much</span> you save
            </h2>
            <p
                style={{
                    fontSize: 17,
                    color: "var(--myra-text-secondary)",
                    textAlign: "center",
                    marginTop: 16,
                    maxWidth: 460,
                    opacity: visible ? 1 : 0,
                    transition: "opacity 0.8s ease 0.2s",
                }}
            >
                See how much you could save by switching from a traditional advisor to myra.
            </p>

            <div
                style={{
                    marginTop: 56,
                    width: "100%",
                    maxWidth: 700,
                    background: "linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))",
                    border: "1px solid var(--myra-glass-border)",
                    borderRadius: 24,
                    padding: "clamp(24px, 4vw, 40px)",
                    backdropFilter: "blur(40px)",
                    WebkitBackdropFilter: "blur(40px)",
                    ...reveal(0.3),
                }}
            >
                <div style={{ marginBottom: 32 }}>
                    <label
                        style={{
                            fontSize: 12,
                            letterSpacing: "0.06em",
                            textTransform: "uppercase",
                            color: "var(--myra-text-secondary)",
                            display: "block",
                            marginBottom: 12,
                        }}
                    >
                        Portfolio Size
                    </label>
                    <div
                        style={{
                            fontSize: 36,
                            fontWeight: 700,
                            marginBottom: 16,
                            color: "var(--myra-text)",
                            fontFamily: "var(--myra-font-body)",
                        }}
                    >
                        ${portfolio.toLocaleString()}
                    </div>
                    <input
                        type="range"
                        min={50_000}
                        max={5_000_000}
                        step={10_000}
                        value={portfolio}
                        onChange={(e) => setPortfolio(+e.target.value)}
                        style={{ width: "100%", accentColor: ACCENT, height: 4, cursor: "pointer" }}
                    />
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
                        <span style={{ fontSize: 11, color: "var(--myra-text-secondary)" }}>$50K</span>
                        <span style={{ fontSize: 11, color: "var(--myra-text-secondary)" }}>$5M</span>
                    </div>
                </div>

                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                        gap: 16,
                        marginBottom: 32,
                    }}
                >
                    <div
                        style={{
                            background: `${ACCENT}1a`,
                            borderRadius: 16,
                            padding: 20,
                            border: `1px solid ${ACCENT}33`,
                        }}
                    >
                        <div
                            style={{
                                fontSize: 11,
                                letterSpacing: "0.06em",
                                textTransform: "uppercase",
                                color: ACCENT,
                                marginBottom: 4,
                            }}
                        >
                            myra's fee
                        </div>
                        <div style={{ fontSize: 32, fontWeight: 700, color: ACCENT, fontFamily: "var(--myra-font-body)" }}>
                            {myraFee.toFixed(2)}%
                        </div>
                    </div>
                    <div
                        style={{
                            background: "var(--myra-surface)",
                            borderRadius: 16,
                            padding: 20,
                            border: "1px solid var(--myra-glass-border)",
                        }}
                    >
                        <div
                            style={{
                                fontSize: 11,
                                letterSpacing: "0.06em",
                                textTransform: "uppercase",
                                color: "var(--myra-text-secondary)",
                                marginBottom: 4,
                            }}
                        >
                            Annual Savings
                        </div>
                        <div
                            style={{
                                fontSize: 32,
                                fontWeight: 700,
                                color: "var(--myra-text)",
                                fontFamily: "var(--myra-font-body)",
                            }}
                        >
                            ${annualSavings.toLocaleString()}
                        </div>
                    </div>
                </div>

                <button
                    onClick={handleStart}
                    style={{
                        background: ACCENT,
                        color: "#000",
                        border: "none",
                        padding: "14px 32px",
                        borderRadius: 12,
                        fontSize: 15,
                        fontWeight: 600,
                        cursor: "pointer",
                        fontFamily: "var(--myra-font-body)",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 8,
                        transition: "transform 0.2s ease",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
                    onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
                >
                    Start Saving Today
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <line x1="5" y1="12" x2="19" y2="12" />
                        <polyline points="12 5 19 12 12 19" />
                    </svg>
                </button>
            </div>
        </section>
    );
};

export default SavingsCalculator;
