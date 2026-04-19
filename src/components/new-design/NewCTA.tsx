import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useScrollReveal } from "./hooks";

const ACCENT = "#00D4AA";

const NewCTA = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [ref, visible] = useScrollReveal<HTMLElement>(0.15);

    const handleLaunch = () => {
        if (user) navigate("/app");
        else document.getElementById("auth-modal-trigger")?.click();
    };

    const handleLearnMore = () => {
        document.querySelector(".myra-landing section")?.scrollIntoView({ behavior: "smooth" });
    };

    return (
        <section
            ref={ref}
            style={{
                padding: "120px 24px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                position: "relative",
            }}
        >
            <div
                aria-hidden
                style={{
                    position: "absolute",
                    inset: 0,
                    background: `linear-gradient(180deg, transparent 0%, ${ACCENT}0f 50%, transparent 100%)`,
                    pointerEvents: "none",
                }}
            />

            <h2
                style={{
                    fontFamily: "var(--myra-font-display)",
                    fontSize: "clamp(40px, 6vw, 80px)",
                    fontWeight: 400,
                    textAlign: "center",
                    lineHeight: 1.1,
                    maxWidth: 700,
                    margin: 0,
                    position: "relative",
                    opacity: visible ? 1 : 0,
                    transform: visible ? "translateY(0)" : "translateY(30px)",
                    transition: "all 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
                }}
            >
                Forecast <span style={{ fontStyle: "italic", color: ACCENT }}>your future.</span>
            </h2>
            <p
                style={{
                    fontSize: 18,
                    color: "var(--myra-text-secondary)",
                    textAlign: "center",
                    marginTop: 20,
                    maxWidth: 500,
                    position: "relative",
                    textWrap: "pretty",
                    opacity: visible ? 1 : 0,
                    transition: "opacity 0.8s ease 0.15s",
                }}
            >
                Take control of your retirement trajectory. Start your free analysis today and see how your money could grow.
            </p>

            <div
                style={{
                    display: "flex",
                    flexWrap: "wrap",
                    justifyContent: "center",
                    gap: 12,
                    marginTop: 40,
                    position: "relative",
                    opacity: visible ? 1 : 0,
                    transition: "opacity 0.8s ease 0.3s",
                }}
            >
                <button
                    onClick={handleLaunch}
                    style={{
                        background: ACCENT,
                        color: "#000",
                        border: "none",
                        padding: "16px 36px",
                        borderRadius: 14,
                        fontSize: 16,
                        fontWeight: 600,
                        cursor: "pointer",
                        fontFamily: "var(--myra-font-body)",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 8,
                        transition: "transform 0.2s ease",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.03)")}
                    onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                >
                    {user ? "Open App" : "Launch App"}
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <line x1="5" y1="12" x2="19" y2="12" />
                        <polyline points="12 5 19 12 12 19" />
                    </svg>
                </button>
                <button
                    onClick={handleLearnMore}
                    style={{
                        background: "transparent",
                        color: "var(--myra-text)",
                        border: "1px solid var(--myra-glass-border)",
                        padding: "16px 36px",
                        borderRadius: 14,
                        fontSize: 16,
                        fontWeight: 500,
                        cursor: "pointer",
                        fontFamily: "var(--myra-font-body)",
                        transition: "border-color 0.2s ease",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)")}
                    onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--myra-glass-border)")}
                >
                    Learn More
                </button>
            </div>
        </section>
    );
};

export default NewCTA;
