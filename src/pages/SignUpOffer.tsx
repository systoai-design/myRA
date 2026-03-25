import { Apple, Eye } from "lucide-react";
import { Link } from "react-router-dom";

export default function SignUpOffer() {
  return (
    <div className="min-h-screen bg-[#000000] flex items-center justify-center p-4 md:p-8 font-sans text-white">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 items-stretch">
        
        {/* Left Panel - Pricing & Sign Up */}
        <div className="bg-[#0f0f0f] rounded-[2rem] p-8 md:p-12 flex flex-col items-center justify-center relative border border-white/5">
          <div className="w-full max-w-sm flex flex-col items-center">
            
            {/* Logo */}
            <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center bg-white/5 mb-8">
              <span className="text-white font-serif font-bold text-xs tracking-wider">RA</span>
            </div>

            {/* Badge */}
            <div className="px-3 py-1 rounded-full bg-[#00282b] text-[#33e2dc] text-xs font-medium mb-8">
              Limited Time Offer
            </div>

            {/* Pricing */}
            <div className="text-center mb-6">
              <h1 className="text-7xl font-serif mb-2">$1</h1>
              <h2 className="text-4xl font-serif text-white/90">for six months</h2>
              <p className="text-white/40 text-sm mt-3">Renews at $99/year. Cancel anytime.</p>
            </div>

            <p className="text-center text-sm text-white/80 mb-8 max-w-[250px]">
              Take control of your entire financial life - with our best offer.
            </p>

            {/* SSO Buttons */}
            <div className="w-full grid grid-cols-2 gap-3 mb-6">
              <button className="flex items-center justify-center h-12 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/5">
                <Apple className="w-5 h-5" fill="white" />
              </button>
              <button className="flex items-center justify-center h-12 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/5">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
              </button>
            </div>

            {/* Divider */}
            <div className="w-full flex items-center gap-3 mb-6">
              <div className="flex-1 h-px bg-white/10"></div>
              <span className="text-xs text-white/40">Or sign up with email</span>
              <div className="flex-1 h-px bg-white/10"></div>
            </div>

            {/* Email Form */}
            <div className="w-full mb-6">
              <div className="relative">
                <input 
                  type="email" 
                  placeholder="E-mail" 
                  className="w-full h-12 bg-transparent border border-white/20 rounded-xl px-4 text-sm text-white focus:outline-none focus:border-white/50 transition-colors"
                />
              </div>
            </div>

            <button className="w-full h-12 bg-white text-black font-medium text-sm rounded-xl hover:bg-white/90 transition-colors mb-4">
              Sign up
            </button>

            <p className="text-sm text-white/60 mb-8">
              Already have an account? <Link to="/login" className="text-white hover:underline">Sign in</Link>
            </p>

            {/* Disclaimer */}
            <p className="text-[10px] leading-relaxed text-white/40 text-center max-w-[300px]">
              By creating an account, you agree to our <a href="#" className="underline">Investment Advisory Agreement</a>, <a href="#" className="underline">Terms of Service</a> and <a href="#" className="underline">Privacy Policy</a>. You also acknowledge that you have reviewed our <a href="#" className="underline">Form ADV Brochure</a> and <a href="#" className="underline">Form CRS</a>. Limited time offer. <a href="#" className="underline">Terms apply</a>.
            </p>

          </div>
        </div>

        {/* Right Panel - Branding & Testimonial */}
        <div className="bg-[#0b101a] rounded-[2rem] p-8 md:p-12 relative overflow-hidden flex flex-col items-center justify-center min-h-[500px] border border-white/5">
          {/* Starry Background Image overlay */}
          <div 
            className="absolute inset-0 z-0 bg-cover bg-center opacity-60 mix-blend-screen"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=2694&auto=format&fit=crop')" }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0b101a] via-transparent to-[#0b101a]/30 z-0" />
          
          <div className="relative z-10 w-full max-w-md flex flex-col items-center text-center">
            
            <h2 className="text-3xl md:text-4xl font-serif mb-4 leading-tight">
              Track spend, ask anything.<br />
              Own your wealth.
            </h2>

            {/* Stars */}
            <div className="flex flex-col items-center gap-2 mb-12">
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-4 h-4 text-[#eab308]" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-[10px] font-bold tracking-widest text-white/70">180K+ MEMBERS</p>
            </div>

            {/* Widget Mockup */}
            <div className="w-full max-w-sm rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md p-6 relative overflow-hidden">
              <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
              </div>
              
              <p className="text-[10px] font-medium tracking-wider text-white/50 uppercase mb-2 text-left">
                Spending this month
              </p>
              
              <div className="text-left mb-8">
                <span className="text-2xl font-serif">$2,132</span>
                <div className="flex items-center gap-1 mt-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-white/80"></span>
                  <span className="text-xs text-white/40">May</span>
                </div>
              </div>

              {/* Chart line mock */}
              <div className="h-24 w-full relative">
                <svg viewBox="0 0 100 40" className="w-full h-full preserve-3d overflow-visible" preserveAspectRatio="none">
                  {/* Gradient definition */}
                  <defs>
                    <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="rgba(255,255,255,0.3)" />
                      <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                    </linearGradient>
                  </defs>
                  
                  {/* Area fill */}
                  <path 
                    d="M0,40 L0,35 C20,35 40,30 60,15 C80,0 90,0 100,0 L100,40 Z" 
                    fill="url(#chartGradient)" 
                  />
                  
                  {/* Line stroke */}
                  <path 
                    d="M0,35 C20,35 40,30 60,15 C80,0 90,0 100,0" 
                    fill="none" 
                    stroke="white" 
                    strokeWidth="1.5"
                    className="drop-shadow-[0_2px_4px_rgba(255,255,255,0.3)]"
                  />
                </svg>
                
                {/* X axis labels */}
                <div className="absolute -bottom-4 left-0 right-0 flex justify-between px-1">
                  <span className="text-[9px] text-white/30">01</span>
                  <span className="text-[9px] text-white/30">07</span>
                  <span className="text-[9px] text-white/30">14</span>
                  <span className="text-[9px] text-white/30">21</span>
                  <span className="text-[9px] text-white/30">28</span>
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
