import { useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { RotatingQuestions } from "./chat/RotatingQuestions";
import gsap from "gsap";

const Hero = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const heroTextRef = useRef<HTMLButtonElement>(null);

    // Initial GSAP Entrance Animation
    useEffect(() => {
        if (heroTextRef.current) {
            gsap.fromTo(
                heroTextRef.current,
                { opacity: 0, y: 30 },
                { opacity: 1, y: 0, duration: 1.2, ease: "power3.out", delay: 0.4 }
            );
        }
    }, []);

    const handleNavigateToChat = () => {
        window.open('/agent-chat', '_blank');
    };

    return (
        <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-6 pt-32 pb-20 bg-slate-900">
            <video
                autoPlay
                loop
                muted
                playsInline
                className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none"
            >
                <source src="/video_background_seamless.mp4" type="video/mp4" />
            </video>

            {/* Hero Main Content */}
            <div className="relative z-20 w-full max-w-4xl mx-auto flex flex-col items-center justify-center min-h-[70vh]">

                {/* Smart Chat Panel Portal */}
                <button
                    ref={heroTextRef}
                    onClick={handleNavigateToChat}
                    className="opacity-0 w-full liquid-glass relative overflow-hidden flex flex-col rounded-[2.5rem] p-6 sm:p-10 max-h-[65vh] min-h-[45vh] glass-shine text-left group hover:scale-[1.01] transition-all duration-500 active:scale-[0.99] border border-white/20"
                >
                    {/* Decorative reflection */}
                    <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />

                    {/* Content Area */}
                    <div className="relative z-10 flex flex-col flex-1 justify-between gap-6 mb-8 w-full">
                        {/* Initial Greeting */}
                        <div className="flex items-end gap-3 sm:gap-4">
                            <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-slate-900/90 backdrop-blur-md flex items-center justify-center shadow-lg border border-slate-700/50">
                                <span className="text-white font-bold text-sm sm:text-base font-outfit">RA</span>
                            </div>
                            <div className="bg-white/70 backdrop-blur-2xl rounded-2xl rounded-bl-sm p-4 sm:p-5 shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white/50 max-w-[90%] sm:max-w-[85%]">
                                <p className="text-slate-900 font-inter text-base sm:text-lg leading-relaxed">
                                    {user
                                        ? `Hey ${user.user_metadata?.first_name || 'there'}! Ready to dive back into your retirement plan?`
                                        : <>Hello, I'm MyRA. <br className="hidden sm:block" /> Your ultimate <span className="font-bold border-b-2 border-slate-900/30">retirement planner.</span></>
                                    }
                                </p>
                            </div>
                        </div>

                        {/* Interactive-looking but static Chat Area (Placeholder for visual interest) */}
                        <div className="flex-1 flex flex-col justify-center">
                            <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-3xl p-6 sm:p-8 flex flex-col items-center justify-center gap-4 text-center group-hover:bg-white/20 transition-all text-white">
                                <p className="text-slate-700/70 dark:text-white/60 text-sm font-medium uppercase tracking-widest mb-2 transition-colors">Click to start your conversation</p>
                                <div className="h-16 sm:h-20 lg:h-24 flex items-center justify-center">
                                    <RotatingQuestions />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Chat Input Box Mockup */}
                    <div className="relative z-10 w-full group/input">
                        <div className="relative flex items-center bg-white/40 backdrop-blur-xl rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-white/40 overflow-hidden p-1.5 sm:p-2 transition-all duration-300">
                            <div className="flex-1 bg-transparent py-3 sm:py-4 pl-6 pr-4 text-base sm:text-lg text-slate-900 dark:text-white font-inter font-medium opacity-70 group-hover/input:opacity-90 transition-opacity italic">
                                Ask me anything about your retirement...
                            </div>
                            <div
                                className="bg-slate-900 dark:bg-white dark:text-slate-900 text-white p-3.5 sm:p-4 rounded-full flex items-center justify-center shrink-0 shadow-md"
                            >
                                <svg className="w-5 h-5 sm:w-6 sm:h-6 -rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19V6m0 0l-7 7m7-7l7 7" /></svg>
                            </div>
                        </div>
                    </div>
                </button>

                {/* Scroll Indicator (Static) */}
                <div className="relative mt-12 flex flex-col items-center text-white/90 drop-shadow-md animate-none">
                    <span className="text-sm font-medium tracking-wide mb-2 opacity-80 uppercase tracking-widest">Scroll for more information</span>
                    <ChevronDown className="w-6 h-6" />
                </div>
            </div>
        </section>
    );
};

export default Hero;
