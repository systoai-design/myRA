import React from 'react';
import { Play } from 'lucide-react';

const helpVideos = [
    {
        id: 1,
        title: 'Bank Level Encryption',
        description: 'See exactly how we secure your data and protect your identity.',
        thumbnail: 'https://images.pexels.com/photos/60504/security-protection-anti-virus-software-60504.jpeg?auto=compress&cs=tinysrgb&w=800'
    },
    {
        id: 2,
        title: 'Why Create a Login?',
        description: 'Discover the benefits of saving your progress and building a long-term plan.',
        thumbnail: 'https://images.pexels.com/photos/7688336/pexels-photo-7688336.jpeg?auto=compress&cs=tinysrgb&w=800'
    },
    {
        id: 3,
        title: 'Transferring Files',
        description: 'A quick guide on securely uploading your statements and policies to MyRA.',
        thumbnail: 'https://images.pexels.com/photos/443383/pexels-photo-443383.jpeg?auto=compress&cs=tinysrgb&w=800'
    }
];

const QuickHelp = () => {
    return (
        <section className="py-24 bg-white dark:bg-background relative z-10 overflow-hidden">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
                        Quick Help Videos
                    </h2>
                    <p className="mt-4 text-lg leading-8 text-slate-600 dark:text-slate-400">
                        Everything you need to know about getting started with MyRA.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {helpVideos.map((video) => (
                        <div key={video.id} className="group relative rounded-3xl overflow-hidden cursor-pointer bg-slate-100 dark:bg-slate-800 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                            <div className="aspect-video relative overflow-hidden">
                                <img
                                    src={video.thumbnail}
                                    alt={video.title}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-300" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/50 group-hover:scale-110 group-hover:bg-white text-white group-hover:text-blue-600 transition-all duration-300 shadow-[0_0_30px_rgba(255,255,255,0.3)]">
                                        <Play className="w-6 h-6 ml-1" fill="currentColor" />
                                    </div>
                                </div>
                            </div>
                            <div className="p-8">
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{video.title}</h3>
                                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{video.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default QuickHelp;
