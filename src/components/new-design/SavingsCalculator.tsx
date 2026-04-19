import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useScrollReveal } from "./hooks";

const ACCENT = "#00D4AA";
const BLUE = "#4F8BFF";

const getMyraFee = (balance: number): number => {
    if (balance <= 100_000) return 0.60;
    if (balance <= 500_000) return 0.50;
    if (balance <= 2_000_000) return 0.40;
    return 0.30;
};

const getMyraFeeTier = (balance: number): string => {
    if (balance <= 100_000) return "60 basis points for portfolios under $100K";
    if (balance <= 500_000) return "50 basis points for portfolios $100K–$500K";
    if (balance <= 2_000_000) return "40 basis points for portfolios $500K–$2M";
    return "30 basis points for portfolios above $2M";
};

const SavingsCalculator = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [ref, visible] = useScrollReveal<HTMLElement>(0.15);
    const [portfolio, setPortfolio] = useState(500_000);
    const [currentFee, setCurrentFee] = useState(1.00);
    const [portfolioInput, setPortfolioInput] = useState("500,000");

    const myraFee = getMyraFee(portfolio);

    const annualSavings = useMemo(() => {
        const traditional = portfolio * (currentFee / 100);
        const myra = portfolio * (myraFee / 100);
        return Math.max(0, traditional - myra);
    }, [portfolio, myraFee, currentFee]);

    const tradAnnual = portfolio * (currentFee / 100);
    const myraAnnual = portfolio * (myraFee / 100);

    const tenYearCompound = useMemo(() => {
        const r = 0.07;
        const fv = annualSavings * ((Math.pow(1 + r, 10) - 1) / r);
        return fv;
    }, [annualSavings]);

    const formatMoney = (n: number): string => {
        if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
        if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
        return `$${n.toFixed(0)}`;
    };

    const handlePortfolioInputChange = (v: string) => {
        const cleaned = v.replace(/[^0-9]/g, "");
        if (!cleaned) {
            setPortfolioInput("");
            return;
        }
        const num = Math.min(5_000_000, Math.max(50_000, parseInt(cleaned, 10)));
        setPortfolio(num);
        setPortfolioInput(num.toLocaleString());
    };

    const handlePortfolioSliderChange = (v: number) => {
        setPortfolio(v);
        setPortfolioInput(v.toLocaleString());
    };

    const handleStart = () => {
        if (user) navigate("/app");
        else document.getElementById("auth-modal-trigger")?.click();
    };

    const reveal = (delay = 0): React.CSSProperties => ({
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(30px)",
        transition: `opacity 0.8s cubic-bezier(0.16,1,0.3,1) ${delay}s, transform 0.8s cubic-bezier(0.16,1,0.3,1) ${delay}s`,
    });

    const labelStyle: React.CSSProperties = {
        fontSize: 11,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        color: "rgba(255,255,255,0.75)",
        fontWeight: 700,
        display: "block",
        marginBottom: 14,
    };

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
                    fontSize: "clamp(36px, 5vw, 72px)",
                    textAlign: "center",
                    lineHeight: 1.1,
                    maxWidth: 760,
                    margin: 0,
                    ...reveal(0.1),
                }}
            >
                <span style={{ fontFamily: "var(--myra-font-display)", fontWeight: 700 }}>Calculate</span>{" "}
                <span style={{ fontFamily: "var(--myra-font-body)", fontWeight: 400 }}>
                    how much you save
                </span>
            </h2>
            <p
                style={{
                    fontFamily: "var(--myra-font-body)",
                    fontSize: 19,
                    fontWeight: 700,
                    color: "var(--myra-text)",
                    textAlign: "center",
                    marginTop: 16,
                    maxWidth: 520,
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
                    maxWidth: 1080,
                    background: "linear-gradient(135deg, rgba(255,255,255,0.16), rgba(255,255,255,0.09))",
                    border: "1px solid rgba(255,255,255,0.28)",
                    borderRadius: 28,
                    padding: "clamp(28px, 3.5vw, 44px)",
                    backdropFilter: "blur(40px)",
                    WebkitBackdropFilter: "blur(40px)",
                    boxShadow: "0 40px 120px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.18)",
                    ...reveal(0.3),
                }}
            >
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(380px, 1fr))",
                        gap: 32,
                    }}
                >
                    {/* LEFT: INPUTS */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
                        {/* Portfolio Size */}
                        <div>
                            <label style={labelStyle}>Portfolio Size</label>
                            <div
                                style={{
                                    background: "linear-gradient(135deg, rgba(79,139,255,0.28), rgba(79,139,255,0.14))",
                                    border: "1px solid rgba(79,139,255,0.55)",
                                    borderRadius: 14,
                                    padding: "14px 20px",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 10,
                                    marginBottom: 18,
                                    boxShadow: "0 4px 20px rgba(79,139,255,0.12)",
                                }}
                            >
                                <span style={{ fontSize: 20, color: BLUE, fontWeight: 700 }}>$</span>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    value={portfolioInput}
                                    onChange={(e) => handlePortfolioInputChange(e.target.value)}
                                    onBlur={() => {
                                        if (!portfolioInput) {
                                            setPortfolio(50_000);
                                            setPortfolioInput("50,000");
                                        }
                                    }}
                                    style={{
                                        flex: 1,
                                        background: "transparent",
                                        border: "none",
                                        outline: "none",
                                        color: "#fff",
                                        fontSize: 22,
                                        fontWeight: 700,
                                        fontFamily: "var(--myra-font-body)",
                                    }}
                                />
                            </div>
                            <input
                                type="range"
                                min={50_000}
                                max={5_000_000}
                                step={10_000}
                                value={portfolio}
                                onChange={(e) => handlePortfolioSliderChange(+e.target.value)}
                                style={{ width: "100%", accentColor: ACCENT, height: 4, cursor: "pointer" }}
                            />
                            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
                                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>$50K</span>
                                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>$5M</span>
                            </div>
                        </div>

                        {/* Current AUM Fee */}
                        <div>
                            <label style={labelStyle}>Current AUM Fee (%)</label>
                            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                                <input
                                    type="range"
                                    min={0.25}
                                    max={2.50}
                                    step={0.05}
                                    value={currentFee}
                                    onChange={(e) => setCurrentFee(+e.target.value)}
                                    style={{ flex: 1, accentColor: BLUE, height: 4, cursor: "pointer" }}
                                />
                                <div
                                    style={{
                                        background: "rgba(79,139,255,0.14)",
                                        border: "1px solid rgba(79,139,255,0.3)",
                                        borderRadius: 10,
                                        padding: "8px 14px",
                                        minWidth: 78,
                                        textAlign: "center",
                                        fontSize: 15,
                                        fontWeight: 700,
                                        color: "#fff",
                                        fontFamily: "var(--myra-font-body)",
                                    }}
                                >
                                    {currentFee.toFixed(2)}%
                                </div>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
                                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>0.25%</span>
                                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>2.50%</span>
                            </div>
                        </div>

                        {/* myra's fee tier card */}
                        <div
                            style={{
                                background: "linear-gradient(135deg, rgba(0,212,170,0.32), rgba(0,212,170,0.14))",
                                border: `1px solid ${ACCENT}90`,
                                borderRadius: 16,
                                padding: 18,
                                display: "flex",
                                alignItems: "center",
                                gap: 14,
                                boxShadow: "0 4px 20px rgba(0,212,170,0.12)",
                            }}
                        >
                            <div
                                style={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: 10,
                                    background: "rgba(0,212,170,0.22)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    flexShrink: 0,
                                }}
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
                                    <polyline points="17 18 23 18 23 12" />
                                </svg>
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>
                                    myra's fee: {myraFee.toFixed(2)}%
                                </div>
                                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.65)", marginTop: 2 }}>
                                    Based on {getMyraFeeTier(portfolio)}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT: OUTPUTS */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                        {/* Annual Savings */}
                        <div
                            style={{
                                background: "linear-gradient(135deg, rgba(0,212,170,0.28), rgba(0,212,170,0.12))",
                                border: `1px solid ${ACCENT}80`,
                                borderRadius: 20,
                                padding: 26,
                                boxShadow: "0 4px 20px rgba(0,212,170,0.12)",
                            }}
                        >
                            <div
                                style={{
                                    fontSize: 11,
                                    letterSpacing: "0.12em",
                                    textTransform: "uppercase",
                                    color: "rgba(255,255,255,0.65)",
                                    fontWeight: 600,
                                    marginBottom: 8,
                                }}
                            >
                                Annual Savings
                            </div>
                            <div
                                style={{
                                    fontSize: 48,
                                    fontWeight: 700,
                                    color: ACCENT,
                                    fontFamily: "var(--myra-font-body)",
                                    lineHeight: 1,
                                    letterSpacing: "-0.02em",
                                }}
                            >
                                {formatMoney(annualSavings)}
                            </div>
                            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", marginTop: 10 }}>
                                {formatMoney(tradAnnual)} → {formatMoney(myraAnnual)} per year
                            </div>
                        </div>

                        {/* 10-Year Compound Savings */}
                        <div
                            style={{
                                background: "linear-gradient(135deg, rgba(0,212,170,0.32), rgba(79,139,255,0.28))",
                                border: "1px solid rgba(0,212,170,0.7)",
                                borderRadius: 20,
                                padding: 26,
                                flex: 1,
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "center",
                                boxShadow: "0 6px 28px rgba(0,212,170,0.18)",
                            }}
                        >
                            <div
                                style={{
                                    fontSize: 11,
                                    letterSpacing: "0.12em",
                                    textTransform: "uppercase",
                                    color: "rgba(255,255,255,0.7)",
                                    fontWeight: 600,
                                    marginBottom: 8,
                                }}
                            >
                                10-Year Compound Savings
                            </div>
                            <div
                                style={{
                                    fontSize: 68,
                                    fontWeight: 700,
                                    color: "#fff",
                                    fontFamily: "var(--myra-font-body)",
                                    lineHeight: 1,
                                    letterSpacing: "-0.03em",
                                }}
                            >
                                {formatMoney(tenYearCompound)}
                            </div>
                            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.65)", marginTop: 12 }}>
                                Assuming 7% average annual return on saved fees
                            </div>
                        </div>

                        {/* CTA */}
                        <button
                            onClick={handleStart}
                            style={{
                                background: "#fff",
                                color: "#000",
                                border: "none",
                                padding: "16px 32px",
                                borderRadius: 999,
                                fontSize: 15,
                                fontWeight: 600,
                                cursor: "pointer",
                                fontFamily: "var(--myra-font-body)",
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: 10,
                                transition: "transform 0.2s ease, box-shadow 0.2s ease",
                                alignSelf: "flex-start",
                                boxShadow: "0 10px 30px rgba(255,255,255,0.08)",
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = "translateY(-2px)";
                                e.currentTarget.style.boxShadow = "0 14px 40px rgba(255,255,255,0.16)";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = "translateY(0)";
                                e.currentTarget.style.boxShadow = "0 10px 30px rgba(255,255,255,0.08)";
                            }}
                        >
                            Start Saving Today
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                <line x1="5" y1="12" x2="19" y2="12" />
                                <polyline points="12 5 19 12 12 19" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default SavingsCalculator;
