import React from 'react';

const team = [
    { name: "Darren P.", role: "Creator", image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Darren" },
    { name: "Sierrah P.", role: "Co-creator", image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sierrah" },
    { name: "Marqus L.", role: "Strategy", image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Marqus" },
    { name: "Kyle C.", role: "Engineering", image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Kyle" },
    { name: "Amanda W.", role: "Designer", image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Amanda" },
    { name: "Alli L.", role: "Designer", image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alli" },
    { name: "Anna B.", role: "Strategy", image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Anna" },
    { name: "Cory G.", role: "Frontend", image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Cory" },
    { name: "Joe P.", role: "Engineering", image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Joe" },
    { name: "Karlan T.", role: "Product", image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Karlan" },
    { name: "Charley", role: "Mascot", image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Charley" },
];

const MissionSection = () => {
    return (
        <section className="py-24 bg-slate-50 dark:bg-slate-900/30 relative z-10 overflow-hidden">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-16 text-center">MyRA's back office</h2>

                <div className="flex gap-6 overflow-x-auto pb-8 custom-scrollbar snap-x">
                    {team.map((member) => (
                        <div key={member.name} className="flex-none w-64 snap-start group">
                            <div className="rounded-[2.5rem] bg-white dark:bg-slate-900 p-8 border border-slate-100 dark:border-white/5 shadow-lg md:shadow-xl transition-all duration-300 hover:-translate-y-2">
                                <div className="w-20 h-20 rounded-2xl bg-slate-100 dark:bg-slate-800 mb-6 overflow-hidden">
                                    <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">{member.name}</h3>
                                <p className="text-sm text-slate-500 font-medium uppercase tracking-widest leading-tight">{member.role}</p>
                                <p className="mt-4 text-xs text-slate-400 leading-relaxed italic">
                                    Dedicated to making fiduciary advice accessible to everyone through advanced AI.
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default MissionSection;
