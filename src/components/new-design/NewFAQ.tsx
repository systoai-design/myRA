import { useState } from "react";
import { useScrollReveal } from "./hooks";

const ACCENT = "#00D4AA";

const faqs = [
    {
        q: "How is myra different from a human advisor?",
        a: "myra provides the same fiduciary-grade logic as a top-tier CFP® but at 1% of the cost. She's available 24/7, never sleeps, and has perfect memory of your entire financial life.",
    },
    {
        q: "Is my financial data secure?",
        a: "Yes. We use bank-level 256-bit AES encryption and your data is protected by Plaid's secure infrastructure. We never sell your data to third parties.",
    },
    {
        q: "Can myra handle complex tax situations?",
        a: "Absolutely. myra is trained on the latest tax codes and uses advanced forecasting to help you optimize withdrawals, minimize capital gains, and plan multi-generational wealth transfers.",
    },
    {
        q: "What products does myra recommend?",
        a: "Since we act as a fiduciary, myra only recommends low-cost, globally diversified ETFs and index funds tailored to your risk tolerance and retirement timeline. No hidden commission products.",
    },
    {
        q: "Can I still talk to a human?",
        a: "Of course. Our Back Office team of licensed professionals can review your AI-generated plan and answer edge-case questions whenever you need human reassurance.",
    },
];

const NewFAQ = () => {
    const [ref, visible] = useScrollReveal<HTMLElement>(0.1);
    const [open, setOpen] = useState<number | null>(0);

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
            <h2
                style={{
                    fontSize: "clamp(30px, 4.2vw, 54px)",
                    textAlign: "center",
                    lineHeight: 1.1,
                    margin: 0,
                    maxWidth: 900,
                    opacity: visible ? 1 : 0,
                    transform: visible ? "translateY(0)" : "translateY(30px)",
                    transition: "all 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
                }}
            >
                <span style={{ fontFamily: "var(--myra-font-display)", fontWeight: 700 }}>Frequently</span>{" "}
                <span style={{ fontFamily: "var(--myra-font-body)", fontWeight: 400 }}>Asked Questions</span>
            </h2>
            <p
                style={{
                    fontFamily: "'Lato', system-ui, sans-serif",
                    fontSize: 18,
                    fontWeight: 700,
                    color: "var(--myra-text)",
                    textAlign: "center",
                    marginTop: 14,
                    maxWidth: 520,
                    opacity: visible ? 1 : 0,
                    transition: "opacity 0.8s ease 0.2s",
                }}
            >
                Clear answers to common questions.
            </p>

            <div
                style={{
                    marginTop: 48,
                    maxWidth: 640,
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                    gap: 6,
                }}
            >
                {faqs.map((f, i) => (
                    <div
                        key={i}
                        style={{
                            background: "var(--myra-glass)",
                            border: "1px solid var(--myra-glass-border)",
                            borderRadius: 14,
                            overflow: "hidden",
                            opacity: visible ? 1 : 0,
                            transform: visible ? "translateY(0)" : "translateY(20px)",
                            transition: `opacity 0.8s cubic-bezier(0.16,1,0.3,1) ${0.1 + i * 0.06}s, transform 0.8s cubic-bezier(0.16,1,0.3,1) ${0.1 + i * 0.06}s`,
                        }}
                    >
                        <button
                            onClick={() => setOpen(open === i ? null : i)}
                            aria-expanded={open === i}
                            style={{
                                width: "100%",
                                padding: "22px 24px",
                                background: "none",
                                border: "none",
                                color: "var(--myra-text)",
                                fontSize: 18,
                                fontWeight: 600,
                                lineHeight: 1.4,
                                textAlign: "left",
                                cursor: "pointer",
                                fontFamily: "'Lato', system-ui, sans-serif",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                gap: 16,
                            }}
                        >
                            <span>{f.q}</span>
                            <span
                                aria-hidden
                                style={{
                                    fontSize: 20,
                                    color: "var(--myra-text-secondary)",
                                    transform: open === i ? "rotate(45deg)" : "rotate(0)",
                                    transition: "transform 0.3s ease",
                                    display: "inline-block",
                                    lineHeight: 1,
                                }}
                            >
                                +
                            </span>
                        </button>
                        <div
                            style={{
                                maxHeight: open === i ? 400 : 0,
                                overflow: "hidden",
                                transition: "max-height 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
                            }}
                        >
                            <p
                                style={{
                                    padding: "0 24px 22px",
                                    fontFamily: "'Lato', system-ui, sans-serif",
                                    fontSize: 16,
                                    lineHeight: 1.7,
                                    color: "var(--myra-text-secondary)",
                                    margin: 0,
                                }}
                            >
                                {f.a}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default NewFAQ;
