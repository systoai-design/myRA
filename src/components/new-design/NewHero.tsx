import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useScrollReveal } from "./hooks";

const ACCENT = "#00D4AA";

const rotatingQuestions = [
    "How much do I need to retire comfortably?",
    "Should I convert to a Roth IRA?",
    "What's the best age to start Social Security?",
    "How much will I pay in taxes this year?",
    "Can I afford to retire early?",
    "How should I invest my 401(k)?",
    "Will I outlive my savings?",
    "How do I reduce my tax burden in retirement?",
];

const useTypewriter = (texts: string[], typingSpeed = 45, deletingSpeed = 25, pauseTime = 2200) => {
    const [displayText, setDisplayText] = useState("");
    const [textIndex, setTextIndex] = useState(0);
    const [isDeleting, setIsDeleting] = useState(false);

    const tick = useCallback(() => {
        const currentFullText = texts[textIndex];
        if (!isDeleting) {
            if (displayText.length < currentFullText.length) {
                setDisplayText(currentFullText.substring(0, displayText.length + 1));
            } else {
                setTimeout(() => setIsDeleting(true), pauseTime);
                return;
            }
        } else {
            if (displayText.length > 0) {
                setDisplayText(currentFullText.substring(0, displayText.length - 1));
            } else {
                setIsDeleting(false);
                setTextIndex((prev) => (prev + 1) % texts.length);
                return;
            }
        }
    }, [displayText, textIndex, isDeleting, texts, pauseTime]);

    useEffect(() => {
        const speed = isDeleting ? deletingSpeed : typingSpeed;
        const timer = setTimeout(tick, speed);
        return () => clearTimeout(timer);
    }, [tick, isDeleting, typingSpeed, deletingSpeed]);

    return displayText;
};

const NewHero = () => {
    const typedQuestion = useTypewriter(rotatingQuestions);
    const navigate = useNavigate();
    const { user } = useAuth();
    const [ref, visible] = useScrollReveal<HTMLElement>(0.05);

    const handleChatClick = () => {
        if (user) navigate("/app/chat");
        else document.getElementById("auth-modal-trigger")?.click();
    };

    const reveal = (delay = 0): React.CSSProperties => ({
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(30px)",
        transition: `opacity 1s cubic-bezier(0.16,1,0.3,1) ${delay}s, transform 1s cubic-bezier(0.16,1,0.3,1) ${delay}s`,
    });

    return (
        <section
            ref={ref}
            style={{
                minHeight: "100vh",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                overflow: "hidden",
                padding: "140px 24px 80px",
            }}
        >
            {/* Gradient orbs */}
            <div
                aria-hidden
                style={{
                    position: "absolute",
                    top: "8%",
                    left: "50%",
                    transform: "translate(-50%, -30%)",
                    width: 800,
                    height: 800,
                    borderRadius: "50%",
                    background: `radial-gradient(circle, ${ACCENT}26 0%, transparent 70%)`,
                    filter: "blur(60px)",
                    pointerEvents: "none",
                }}
            />
            <div
                aria-hidden
                style={{
                    position: "absolute",
                    top: "40%",
                    right: "-10%",
                    width: 500,
                    height: 500,
                    borderRadius: "50%",
                    background: `radial-gradient(circle, ${ACCENT}1a 0%, transparent 70%)`,
                    filter: "blur(80px)",
                    pointerEvents: "none",
                }}
            />

            {/* Badge */}
            <div
                style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "6px 16px",
                    borderRadius: 20,
                    background: "var(--myra-glass)",
                    border: "1px solid var(--myra-glass-border)",
                    backdropFilter: "blur(12px)",
                    WebkitBackdropFilter: "blur(12px)",
                    marginBottom: 32,
                    ...reveal(0),
                }}
            >
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: ACCENT }} />
                <span
                    style={{
                        fontSize: 12,
                        fontWeight: 500,
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        color: "var(--myra-text-secondary)",
                    }}
                >
                    Fiduciary Standard · AI Powered
                </span>
            </div>

            {/* Headline */}
            <h1
                style={{
                    fontFamily: "var(--myra-font-display)",
                    fontWeight: 400,
                    fontSize: "clamp(48px, 8vw, 96px)",
                    lineHeight: 1.05,
                    textAlign: "center",
                    maxWidth: 900,
                    margin: 0,
                    ...reveal(0.15),
                }}
            >
                Your money.{" "}
                <span style={{ fontStyle: "italic", color: ACCENT }}>Smarter.</span>
            </h1>

            <p
                style={{
                    fontSize: 20,
                    lineHeight: 1.5,
                    color: "var(--myra-text-secondary)",
                    textAlign: "center",
                    maxWidth: 520,
                    marginTop: 24,
                    textWrap: "pretty",
                    ...reveal(0.3),
                }}
            >
                Skip the drive. Meet your AI financial advisor here. Keep more of your money while we map your best path forward — together.
            </p>

            {/* Chat input with rotating typewriter */}
            <div
                onClick={handleChatClick}
                style={{
                    marginTop: 48,
                    width: "100%",
                    maxWidth: 560,
                    background: "var(--myra-glass)",
                    border: "1px solid var(--myra-glass-border)",
                    borderRadius: 16,
                    padding: "4px 4px 4px 20px",
                    display: "flex",
                    alignItems: "center",
                    backdropFilter: "blur(20px)",
                    WebkitBackdropFilter: "blur(20px)",
                    cursor: "pointer",
                    ...reveal(0.45),
                }}
            >
                <span
                    style={{
                        flex: 1,
                        fontSize: 15,
                        color: "var(--myra-text-secondary)",
                        fontFamily: "var(--myra-font-body)",
                        minHeight: 44,
                        display: "flex",
                        alignItems: "center",
                    }}
                >
                    {typedQuestion}
                    <span
                        aria-hidden
                        style={{
                            display: "inline-block",
                            width: 2,
                            height: 18,
                            background: ACCENT,
                            marginLeft: 2,
                            verticalAlign: "middle",
                            animation: "myra-blink 1s infinite",
                        }}
                    />
                </span>
                <button
                    onClick={(e) => { e.stopPropagation(); handleChatClick(); }}
                    aria-label={user ? "Open chat" : "Sign up to chat"}
                    style={{
                        width: 44,
                        height: 44,
                        borderRadius: 12,
                        background: ACCENT,
                        border: "none",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                    }}
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round">
                        <line x1="5" y1="12" x2="19" y2="12" />
                        <polyline points="12 5 19 12 12 19" />
                    </svg>
                </button>
            </div>

            {/* Trust badges */}
            <div
                style={{
                    display: "flex",
                    flexWrap: "wrap",
                    justifyContent: "center",
                    gap: 40,
                    marginTop: 56,
                    opacity: visible ? 1 : 0,
                    transition: "opacity 1s ease 0.6s",
                }}
            >
                {[
                    { icon: "🔒", label: "Bank-Level Security" },
                    { icon: "✓", label: "SEC Registered" },
                    { icon: "⚡", label: "Powered by Plaid" },
                ].map(({ icon, label }) => (
                    <div key={label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 14 }}>{icon}</span>
                        <span
                            style={{
                                fontSize: 12,
                                color: "var(--myra-text-secondary)",
                                letterSpacing: "0.02em",
                            }}
                        >
                            {label}
                        </span>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default NewHero;
