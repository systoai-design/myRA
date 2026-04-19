import { useState } from "react";
import { useScrollReveal } from "./hooks";

const ACCENT = "#00D4AA";

type Member = { name: string; role: string; img: string };

const teamData: Member[] = [
    { name: "Darren P.", role: "Creator", img: "/team/Darren.avif" },
    { name: "Sierrah P.", role: "Creator", img: "/team/Sierra.avif" },
    { name: "Marquis L.", role: "Strategy", img: "/team/Marquis.avif" },
    { name: "Amanda W.", role: "Designer", img: "/team/Amanda.avif" },
    { name: "Ally L.", role: "Designer", img: "/team/Ally.avif" },
    { name: "Anna B.", role: "Dev", img: "/team/Anna.avif" },
    { name: "Cory G.", role: "Dev", img: "/team/Cory.avif" },
    { name: "Joe P.", role: "Dev", img: "/team/Joe.avif" },
    { name: "Karlan T.", role: "Dev", img: "/team/Karlan.avif" },
    { name: "Charley", role: "Mascot", img: "/team/Charley.avif" },
];

const CARD_WIDTH = 220;
const CARD_GAP = 24;

const TeamCard = ({ member }: { member: Member }) => {
    const [errored, setErrored] = useState(false);
    return (
        <div
            style={{
                flexShrink: 0,
                width: CARD_WIDTH,
                textAlign: "center",
            }}
        >
            <div
                style={{
                    width: "100%",
                    aspectRatio: "3 / 4",
                    borderRadius: 16,
                    background: "linear-gradient(135deg, var(--myra-surface-2), var(--myra-surface))",
                    marginBottom: 14,
                    overflow: "hidden",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
                }}
            >
                {errored ? (
                    <span style={{ fontSize: 36, opacity: 0.35, color: "var(--myra-text)" }}>
                        {member.name[0]}
                    </span>
                ) : (
                    <img
                        src={member.img}
                        alt={member.name}
                        loading="lazy"
                        onError={() => setErrored(true)}
                        style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            filter: "grayscale(0.1) contrast(1.02)",
                        }}
                    />
                )}
            </div>
            <div style={{ fontSize: 15, fontWeight: 600, color: "var(--myra-text)" }}>{member.name}</div>
            <div
                style={{
                    fontSize: 11,
                    color: "var(--myra-text-secondary)",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    marginTop: 4,
                }}
            >
                {member.role}
            </div>
        </div>
    );
};

const NewTeam = () => {
    const [ref, visible] = useScrollReveal<HTMLElement>(0.1);

    // Duplicate the list so the translateX(-50%) loop is seamless
    const loopedTeam = [...teamData, ...teamData];

    return (
        <section
            ref={ref}
            style={{
                padding: "120px 0",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                position: "relative",
                overflow: "hidden",
            }}
        >
            <div
                aria-hidden
                style={{
                    position: "absolute",
                    top: 0,
                    right: "-10%",
                    width: 600,
                    height: 600,
                    borderRadius: "50%",
                    background: `radial-gradient(circle, ${ACCENT}10 0%, transparent 70%)`,
                    filter: "blur(120px)",
                    pointerEvents: "none",
                }}
            />

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
                    position: "relative",
                }}
            >
                The Team
            </span>
            <h2
                style={{
                    fontFamily: "var(--myra-font-display)",
                    fontSize: "clamp(36px, 5vw, 56px)",
                    fontWeight: 400,
                    textAlign: "center",
                    lineHeight: 1.1,
                    margin: 0,
                    padding: "0 24px",
                    opacity: visible ? 1 : 0,
                    transform: visible ? "translateY(0)" : "translateY(30px)",
                    transition: "all 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.1s",
                    position: "relative",
                }}
            >
                myra's Back Office
            </h2>
            <p
                style={{
                    fontFamily: "var(--myra-font-body)",
                    fontSize: 18,
                    fontWeight: 700,
                    color: "var(--myra-text)",
                    textAlign: "center",
                    marginTop: 14,
                    maxWidth: 520,
                    padding: "0 24px",
                    opacity: visible ? 1 : 0,
                    transition: "opacity 0.8s ease 0.2s",
                    position: "relative",
                }}
            >
                The humans behind the intelligence — dedicated to making fiduciary advice accessible to everyone.
            </p>

            {/* Marquee */}
            <div
                style={{
                    marginTop: 56,
                    width: "100%",
                    position: "relative",
                    overflow: "hidden",
                    // Edge fade masks
                    WebkitMaskImage:
                        "linear-gradient(to right, transparent 0, #000 80px, #000 calc(100% - 80px), transparent 100%)",
                    maskImage:
                        "linear-gradient(to right, transparent 0, #000 80px, #000 calc(100% - 80px), transparent 100%)",
                }}
            >
                <div
                    className="myra-marquee-track"
                    style={{
                        display: "flex",
                        gap: CARD_GAP,
                        width: "max-content",
                        paddingLeft: CARD_GAP,
                    }}
                >
                    {loopedTeam.map((m, i) => (
                        <TeamCard key={`${m.name}-${i}`} member={m} />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default NewTeam;
