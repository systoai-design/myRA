import { Link, useNavigate } from "react-router-dom";
import { Sun } from "lucide-react";

export const NewHeader = () => {
    const navigate = useNavigate();

    return (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 w-[95%] max-w-7xl z-50">
            <header className="glass-premium rounded-full px-6 py-3 flex items-center justify-between border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)]">
                
                <div className="flex items-center gap-3">
                    <Link to="/" className="flex items-center gap-2 group">
                        <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center bg-white/5 group-hover:bg-white/10 transition-colors">
                            <span className="text-white font-serif font-bold text-xs tracking-wider">RA</span>
                        </div>
                        <span className="text-xl font-serif text-white tracking-tight">
                            MyRA
                        </span>
                    </Link>
                </div>

                <div className="flex items-center gap-3">
                    <button className="w-9 h-9 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5 transition-colors text-white/70">
                        <Sun className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => navigate("/")}
                        className="hidden sm:block px-4 py-2 rounded-full text-xs font-semibold text-white/70 hover:text-white hover:bg-white/5 transition-colors border border-transparent"
                    >
                        Old Design
                    </button>
                    <button
                        onClick={() => navigate("/agent-chat")}
                        className="h-9 px-5 rounded-full bg-white text-black text-xs font-semibold hover:bg-white/90 transition-colors hidden sm:block"
                    >
                        Agent Chat
                    </button>
                    <button className="h-9 px-5 rounded-full bg-white/10 border border-white/10 text-white text-xs font-semibold hover:bg-white/20 transition-colors">
                        Sign In / Up
                    </button>
                </div>
            </header>
        </div>
    );
};

export default NewHeader;
