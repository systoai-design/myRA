import { useState } from "react";
import { motion } from "framer-motion";

const teamData = [
    { name: "Darren P.", role: "Creator", img: "/team/Darren.avif" },
    { name: "Sierra P.", role: "Co-Creator", img: "/team/Sierra.avif" },
    { name: "Marquis L.", role: "Strategy", img: "/team/Marquis.avif" },
    { name: "Amanda W.", role: "Designer", img: "/team/Amanda.avif" },
    { name: "Ally L.", role: "Designer", img: "/team/Ally.avif" },
    { name: "Anna B.", role: "Dev", img: "/team/Anna.avif" },
    { name: "Cory G.", role: "Dev", img: "/team/Cory.avif" },
    { name: "Joe P.", role: "Dev", img: "/team/Joe.avif" },
    { name: "Karlan T.", role: "Dev", img: "/team/Karlan.avif" },
    { name: "Ashton", role: "Copywriter", img: "/team/Ashton.avif" },
    { name: "Charley", role: "Dev", img: "/team/Charley.avif" },
];

const NewTeam = () => {
    return (
        <section className="relative py-32 bg-[#030508] overflow-hidden">
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />
            
            <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
                <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-24"
                >
                    <h2 className="text-5xl md:text-6xl font-serif text-white mb-6">
                        <span className="italic font-light">MyRA's</span> Back Office
                    </h2>
                    <p className="max-w-2xl mx-auto text-lg text-white/50 font-sans font-light">
                        The humans behind the intelligence — dedicated to making <br className="hidden sm:block" />
                        fiduciary advice accessible to everyone.
                    </p>
                </motion.div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {teamData.map((member, idx) => (
                        <motion.div 
                            key={idx} 
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: idx * 0.05 }}
                            className="group relative glass-premium rounded-3xl overflow-hidden aspect-[3/4] transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.6)]"
                        >
                            <img 
                                src={member.img} 
                                alt={member.name}
                                className="w-full h-full object-cover transition-all duration-700 grayscale group-hover:grayscale-0 opacity-80 group-hover:opacity-100 group-hover:scale-105"
                            />
                            
                            {/* Inner gradient overlay for text readability */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-90 transition-opacity duration-500" />
                            
                            <div className="absolute bottom-0 left-0 w-full p-6 text-left transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                                <h3 className="text-white font-serif text-xl mb-1">{member.name}</h3>
                                <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/50 font-sans">{member.role}</p>
                            </div>
                            
                            {/* Subtle Origin-style top border reflection */}
                            <div className="absolute inset-0 border border-white/10 rounded-3xl pointer-events-none transition-colors duration-500 group-hover:border-white/20" />
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default NewTeam;
