import { Check, X, Star } from "lucide-react";

const forYou = [
  "You're planning a DC-area wedding.",
  "You have at least a $12,000 wedding budget.",
  "You want a shortlist that reflects your real budget and must-haves.",
  "You're done with guessing, scrolling, and blind tours.",
];

const notForYou = [
  "You're still deciding whether you want a real wedding.",
  "You're looking outside DMV and surrounding areas.",
  "You prefer to research everything manually.",
];

const WhoForSection = () => {
  return (
    <section className="section-padding bg-[#050810] relative overflow-hidden py-[80px]">
      <div className="relative z-10 w-full max-w-5xl mx-auto px-6 text-center mb-12">
        <span className="section-label inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary font-bold text-xs uppercase tracking-widest mb-6">Is This For You?</span>
        <h2 className="section-title text-4xl md:text-5xl font-black text-white mb-4">
          MyRA makes sense out of chaos
        </h2>
        <p className="text-xl text-white/50">especially when...</p>
      </div>

      <div className="relative z-10 w-full max-w-5xl mx-auto px-6">
        <div className="mb-16 flex flex-col items-center gap-4">
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-6 h-6 fill-amber-400 text-amber-400" />
            ))}
          </div>
          <blockquote className="text-center max-w-lg">
            <p className="text-lg md:text-xl text-white italic font-medium leading-relaxed">
              "I had a vision but no direction. The MyRA planners gave me that and more."
            </p>
            <cite className="text-sm text-white/40 mt-3 block not-italic">
              — Past Bride
            </cite>
          </blockquote>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="relative rounded-[2.5rem] p-8 md:p-10 h-full overflow-hidden liquid-glass">
            <div className="absolute inset-0 bg-primary/5 pointer-events-none" />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center">
                  <Check className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-white">Especially when:</h3>
              </div>
              <ul className="space-y-5">
                {forYou.map((item, index) => (
                  <li key={index} className="flex items-start gap-4">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-white/80 leading-relaxed font-medium">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="relative rounded-[2.5rem] p-8 md:p-10 h-full liquid-glass">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
                <X className="w-6 h-6 text-white/40" />
              </div>
              <h3 className="text-2xl font-bold text-white/60">Maybe not if:</h3>
            </div>
            <ul className="space-y-5">
              {notForYou.map((item, index) => (
                <li key={index} className="flex items-start gap-4">
                  <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center shrink-0 mt-0.5">
                    <X className="w-4 h-4 text-white/30" />
                  </div>
                  <span className="text-white/40 leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhoForSection;
