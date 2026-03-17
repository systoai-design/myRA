import { Users, DollarSign, CheckCircle } from "lucide-react";

const reasons = [{
  icon: Users,
  title: "Human-curated",
  text: "Curated by humans who know DMV area venues, supported by smart tools."
}, {
  icon: DollarSign,
  title: "Total budget focus",
  text: "Built around your total budget, not just the venue budget."
}, {
  icon: CheckCircle,
  title: "Real data only",
  text: "Grounded in what's real — no guesses or outdated blogs."
}];

const WhyItWorksSection = () => {
  return (
    <section id="how-it-works" className="section-padding relative overflow-hidden py-[100px]">
      <div className="absolute inset-0 bg-[#050810] z-0" />
      <div className="relative z-10 w-full max-w-5xl mx-auto px-6">
        <div className="text-center mb-20">
          <span className="section-label inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary font-bold text-xs uppercase tracking-widest mb-6">Why We're Different</span>
          <h2 className="section-title text-4xl md:text-6xl font-black text-white mb-8 tracking-tight">
            Most tools show you every venue.
            <br />
            <span className="text-primary italic">MyRA does the opposite.</span>
          </h2>
          <p className="text-lg md:text-xl text-white/40 max-w-3xl mx-auto leading-relaxed font-inter">
            We take your full picture — budget, date, guest count, style, must-haves — and filter out everything that doesn't fit. Then our planners layer in real pricing, policies, and availability to build a must-tour list that actually makes sense.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {reasons.map((reason, index) => (
            <div key={index} className="group p-10 rounded-[2.5rem] liquid-glass border-white/5 hover:border-primary/20 transition-all duration-500 hover:-translate-y-2 h-full">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-8 group-hover:bg-primary/20 transition-colors">
                <reason.icon className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-bold text-2xl text-white mb-4 tracking-tight">{reason.title}</h3>
              <p className="text-white/40 leading-relaxed font-inter">{reason.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyItWorksSection;