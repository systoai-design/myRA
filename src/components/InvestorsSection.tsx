import React from 'react';

const investors = [
    {
        name: "Darren Moore",
        role: "Founder & CEO",
        image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Darren"
    },
    {
        name: "Sierra Moore",
        role: "Head of Operations",
        image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sierra"
    },
    {
        name: "Kyle Smith",
        role: "Lead Developer",
        image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Kyle"
    },
    {
        name: "Dr. Elena Vance",
        role: "Strategic Partner",
        image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Elena"
    }
];

const InvestorsSection = () => {
    return (
        <section className="py-24 bg-white dark:bg-background relative z-10">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-12">My investors</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    {investors.map((investor) => (
                        <div key={investor.name} className="group">
                            <div className="aspect-[4/5] overflow-hidden rounded-[2rem] bg-slate-100 dark:bg-slate-900 mb-4 transition-transform duration-500 group-hover:scale-[1.02]">
                                <img
                                    src={investor.image}
                                    alt={investor.name}
                                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                                />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white uppercase tracking-wider">{investor.name}</h3>
                            <p className="text-sm text-slate-500 font-medium uppercase tracking-widest">{investor.role}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default InvestorsSection;
