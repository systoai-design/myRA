import { useState } from "react";
import { useScrollReveal } from "./hooks";

const ACCENT = "#00D4AA";

type Member = { name: string; role: string; img: string; objectPosition?: string };

const teamData: Member[] = [
    // Darren's source image is framed wider than the others; pull up and slightly left so
    // the crop reads as a tight headshot matching the rest of the grid.
    { name: "Darren P.", role: "Creator", img: "/team/Darren.avif", objectPosition: "50% 18%" },
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

const TeamAvatar = ({ member }: { member: Member }) => {
    const [errored, setErrored] = useState(false);
    return (
        <div
            style={{
                width: "100%",
                aspectRatio: "3 / 4",
                borderRadius: 16,
                background: "linear-gradient(135deg, var(--myra-surface-2), var(--myra-surface))",
                marginBottom: 12,
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
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
                        objectPosition: member.objectPosition || "50% 30%",
                        filter: "grayscale(0.1) contrast(1.02)",
                    }}
                />
            )}
        </div>
    );
};

const NewTeam = () => {
    const [ref, visible] = useScrollReveal<HTMLElement>(0.1);

    return (
        <section
            ref={ref}
            style={{
                padding: "120px 24px",
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
                    fontStyle: "normal",
                    textAlign: "center",
                    lineHeight: 1.1,
                    margin: 0,
                    opacity: visible ? 1 : 0,
                    transform: visible ? "translateY(0)" : "translateY(30px)",
                    transition: "all 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.1s",
                    position: "relative",
                    color: "var(--myra-text)",
                }}
            >
                myra's Back Office
            </h2>
            <p
                style={{
                    fontSize: "clamp(16px, 1.4vw, 19px)",
                    fontWeight: 700,
                    color: "var(--myra-text)",
                    textAlign: "center",
                    marginTop: 12,
                    maxWidth: 520,
                    opacity: visible ? 1 : 0,
                    transition: "opacity 0.8s ease 0.2s",
                    position: "relative",
                }}
            >
                The humans behind the intelligence — dedicated to making fiduciary advice accessible to everyone.
            </p>

            <div
                style={{
                    marginTop: 56,
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
                    gap: 16,
                    maxWidth: 1100,
                    width: "100%",
                    position: "relative",
                }}
            >
                {teamData.map((m, i) => (
                    <div
                        key={m.name}
                        style={{
                            textAlign: "center",
                            opacity: visible ? 1 : 0,
                            transform: visible ? "translateY(0)" : "translateY(20px)",
                            transition: `opacity 0.8s cubic-bezier(0.16,1,0.3,1) ${0.2 + i * 0.05}s, transform 0.8s cubic-bezier(0.16,1,0.3,1) ${0.2 + i * 0.05}s`,
                        }}
                    >
                        <TeamAvatar member={m} />
                        <div style={{ fontSize: 14, fontWeight: 600, color: "var(--myra-text)" }}>{m.name}</div>
                        <div
                            style={{
                                fontSize: 11,
                                color: "var(--myra-text-secondary)",
                                textTransform: "uppercase",
                                letterSpacing: "0.06em",
                                marginTop: 2,
                            }}
                        >
                            {m.role}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default NewTeam;
