import { motion } from "framer-motion";

const teamData = [
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

const NewTeam = () => {
    return (
        <section className="relative py-32 bg-background overflow-hidden">
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-200/20 dark:bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />
            
            <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
                <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-24"
                >
                    <h2 className="text-5xl md:text-6xl font-serif text-foreground mb-6">
                        <span className="italic font-light">myra's</span> Back Office
                    </h2>
                    <p className="max-w-2xl mx-auto text-lg text-muted-foreground font-sans font-light">
                        The humans behind the intelligence — dedicated to making <br className="hidden sm:block" />
                        fiduciary advice accessible to everyone.
                    </p>
                </motion.div>

                {/* Infinite scrolling marquee */}
                <div className="overflow-hidden -mx-6 py-4">
                    <div 
                        className="flex gap-5 w-max marquee-track"
                        style={{
                            animation: "marquee 30s linear infinite",
                        }}
                    >
                        {/* Render team twice for seamless loop */}
                        {[...teamData, ...teamData].map((member, idx) => (
                            <div 
                                key={idx} 
                                className="group relative glass-card rounded-3xl overflow-hidden flex-shrink-0 w-[200px] h-[280px] transition-all duration-500 hover:-translate-y-2"
                            >
                                <img 
                                    src={member.img} 
                                    alt={member.name}
                                    className="w-full h-full object-cover transition-all duration-700 grayscale group-hover:grayscale-0 opacity-80 group-hover:opacity-100 group-hover:scale-105"
                                />
                                
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-90 transition-opacity duration-500" />
                                
                                <div className="absolute bottom-0 left-0 w-full p-5 text-left transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                                    <h3 className="text-white font-serif text-lg mb-0.5">{member.name}</h3>
                                    <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/50 font-sans">{member.role}</p>
                                </div>
                                
                                <div className="absolute inset-0 border border-black/5 dark:border-white/10 rounded-3xl pointer-events-none transition-colors duration-500 group-hover:border-black/10 dark:group-hover:border-white/20" />
                            </div>
                        ))}
                    </div>
                </div>

                <style>{`
                    @keyframes marquee {
                        0% { transform: translateX(0); }
                        100% { transform: translateX(-50%); }
                    }
                    .marquee-track {
                        animation: marquee 30s linear infinite;
                    }
                    .marquee-track:hover {
                        animation-duration: 180s;
                    }
                `}</style>
            </div>
        </section>
    );
};

export default NewTeam;
