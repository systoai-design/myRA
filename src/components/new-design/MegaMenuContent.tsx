import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
    BookOpen, TrendingUp, Shield, DollarSign, BarChart3,
    PiggyBank, Eye, Cpu, Heart, ArrowRight, Scale,
    Wallet, Clock, Landmark, Briefcase, Target, Zap,
    X
} from "lucide-react";
import { Link } from "react-router-dom";

/* ───────── content data ───────── */

interface Section {
    icon: React.ElementType;
    title: string;
    subtitle: string;
    bullets: { bold: string; text: string }[];
}

interface MenuContent {
    id: string;
    label: string;
    headline: string;
    tagline: string;
    sections: Section[];
    cta?: { label: string; to: string };
    /** For "myra Story" which is free-form prose, not structured sections */
    prose?: string;
}

export const MENU_ITEMS: MenuContent[] = [
    /* ── 1. myra Story ── */
    {
        id: "myra-story",
        label: "myra Story",
        headline: "Hello, I'm myra.",
        tagline: "",
        sections: [],
        prose: `I was created by the founder and CEO of Retirement Architects LLC, a human financial planner who spent more than a decade sitting across the table from real people trying to answer the same questions you probably have:

• Have I saved enough to retire?
• How much can I safely spend?
• What happens if prices keep going up?
• Will I be okay if something unexpected happens?

He earned his CFP® and RICP® designations, attended countless trainings, and helped hundreds of families build retirement plans. He also saw the limits of the traditional advisory model: higher fees, limited availability, conflicting incentives, and advisors who eventually leave or retire themselves.

So, he decided to train me.

My job is simple: take everything he's learned about good retirement planning and combine it with modern AI so more people can get actionable, unbiased advice at a fraction of the usual cost.

What I'm built to do

I'm designed specifically for retirement planning and investing, not "everything finance." That means I focus on:

• Turning your savings into a reliable retirement paycheck
• Making smart decisions about Social Security and pensions
• Building investment plans that match your risk tolerance and time horizon
• Watching taxes, healthcare costs, inflation, and longevity risk
• Adjusting your plan as life and markets change

I'm available 24/7, remember every detail you share, and never get tired of running "what if?" scenarios.

How I work with you

I'm not here to sell you products. I'm here to:

1. Listen and learn — I start by understanding your goals, accounts, income sources, and what keeps you up at night.

2. Build your plan — I map your income in retirement, highlight any gaps, and show clear paths to get or stay on track.

3. Guide your decisions — I explain trade-offs in plain language and give you step-by-step to-dos instead of generic advice.

4. Stay with you — I monitor your plan, help you adjust when life changes, and keep everything organized in one place.

And when it comes to bigger decisions — like Roth conversions, tax strategies, or annuity choices — my creator and his team of human CFP® professionals double-check and reaffirm my recommendations.

What I believe

I'm built on a few simple beliefs:

• Retirement planning should be understandable, not intimidating.
• Good advice shouldn't require hundreds of dollars an hour.
• You deserve help when you need it, not just when there's an opening on someone's calendar.
• Every retirement is unique, but the plan should always start with one thing: making sure you'll have enough income to live the life you want.

If you're ready for clear numbers, plain English, and total peace of mind, I'm here whenever you are. So the next time someone asks why you're so zen about your financial future, you can just tell them: "I have my retirement architect."

— myra.`,
    },

    /* ── 2. Financial Planning ── */
    {
        id: "financial-planning",
        label: "Financial Planning",
        headline: "Financial Planning with myra",
        tagline: "Your plan shouldn't be a three-ring binder that gathers dust or a spreadsheet snapshot. It should be a living, breathing roadmap that adapts to your life.",
        sections: [
            {
                icon: PiggyBank,
                title: "Intelligent Budgeting & Cash Flow",
                subtitle: "Know exactly what's safe to spend today and tomorrow.",
                bullets: [
                    { bold: "Income mapping:", text: "I sync your Social Security, pensions, and savings to show exactly what's coming in." },
                    { bold: "Essential vs. Fun:", text: "We'll categorize your budget into essentials (housing, healthcare) and discretionary spending (travel, hobbies) so you always know your baseline is covered." },
                    { bold: 'The "Safe to Spend" number:', text: "I calculate your retirement income gap and give you a clear, plain-English target of what you can safely withdraw each month without risking your future." },
                ],
            },
            {
                icon: TrendingUp,
                title: "Purpose-Driven Investing",
                subtitle: "Investments built for your retirement paycheck.",
                bullets: [
                    { bold: "Custom Portfolios:", text: "I build diversified, low-cost investment strategies tailored exactly to your timeline and risk comfort." },
                    { bold: "Tax-Smart Strategies:", text: "I prioritize tax-deferred funding where appropriate and sequence your withdrawals to help you keep more of your money away from the IRS." },
                    { bold: "Human Oversight:", text: "For high-impact investment moves — like major Roth conversions or selecting income riders — my team of human CFP® professionals steps in to review and approve the strategy." },
                ],
            },
            {
                icon: Eye,
                title: "24/7 Portfolio Monitoring",
                subtitle: "I never sleep, so you don't have to lose sleep over the markets.",
                bullets: [
                    { bold: "Automated Rebalancing:", text: "If the market drifts and throws your portfolio out of balance, I automatically adjust it back to your target risk level." },
                    { bold: "Proactive Alerts:", text: "I notify you ahead of important deadlines, like Required Minimum Distributions (RMDs) and tax-filing dates." },
                    { bold: 'Continuous "What-If" Testing:', text: "I run thousands of Monte Carlo stress tests in the background to ensure your plan stays in the \"safe zone.\"" },
                ],
            },
            {
                icon: Cpu,
                title: "The myraTech™ Advantage: Seamless, Secure Custody",
                subtitle: "Next-generation wealth management.",
                bullets: [
                    { bold: "Zero manual entry:", text: "By securely linking your accounts, my brain syncs with your balances and transactions in real-time." },
                    { bold: "Bank-level security:", text: "Your assets are held at a secure, top-tier custodian. I simply act as the intelligent brain managing the data and trades." },
                    { bold: "Frictionless action:", text: "When we update a goal in your plan, your portfolio can adjust to match it seamlessly." },
                ],
            },
        ],
        cta: { label: "Get Your Free Retirement Score", to: "/offer" },
    },

    /* ── 3. Retirement Planning ── */
    {
        id: "retirement-planning",
        label: "Retirement Planning",
        headline: "Retirement Planning with myra",
        tagline: "Turning your life's savings into a reliable, lifelong paycheck shouldn't keep you up at night.",
        sections: [
            {
                icon: Target,
                title: 'The "Income-First" Philosophy',
                subtitle: "Building your new monthly paycheck.",
                bullets: [
                    { bold: "Calculating your Income Gap:", text: "I look at your desired lifestyle cost, subtract your guaranteed income (like Social Security and pensions), and find your exact \"income gap.\"" },
                    { bold: "Covering the basics:", text: "Our first goal is to ensure your essential living expenses are fully covered by reliable, predictable income streams." },
                ],
            },
            {
                icon: Shield,
                title: "Smart, Principal-Protected Income Strategies",
                subtitle: "Guaranteed income without giving up control of your money.",
                bullets: [
                    { bold: "Income Riders, Not Annuitization:", text: "I look exclusively for modern strategies using fixed indexed annuities with guaranteed income riders." },
                    { bold: "Hunting for Fee-Free Options:", text: "Whenever possible, I search the market for \"fee-free\" income riders." },
                    { bold: "Optimized Funding:", text: "I strategically recommend funding these income strategies using your tax-deferred accounts (like IRAs) first." },
                    { bold: "Human Oversight:", text: "My human team of CFP® professionals reviews and approves every single income-rider recommendation." },
                ],
            },
            {
                icon: BarChart3,
                title: "Investment Portfolios Built for Retirees",
                subtitle: "Growth to beat inflation, without the roller coaster.",
                bullets: [
                    { bold: "Distribution-focused investing:", text: "I build and manage diversified, low-cost portfolios specifically designed to weather market storms." },
                    { bold: "Risk-adjusted to your life:", text: "Your portfolio's risk level is tied directly to your timeline, your income gap, and your personal comfort level." },
                ],
            },
            {
                icon: Wallet,
                title: "Strategic Liquidity & Cash Flow Modeling",
                subtitle: "Spend your money when you have the energy to enjoy it.",
                bullets: [
                    { bold: 'The "Fun-Adjusted" Spending Plan:', text: "I mathematically model your free cash flow so you can safely spend a little more early in retirement." },
                    { bold: "The Cash Buffer:", text: "I help you carve out a strategic 12-to-24-month liquid emergency reserve." },
                ],
            },
            {
                icon: Scale,
                title: "Tax-Efficient Planning",
                subtitle: "It's not what you make; it's what you keep.",
                bullets: [
                    { bold: "Withdrawal Sequencing:", text: "I tell you exactly which accounts to pull money from, and in what order." },
                    { bold: "Roth Conversions & RMDs:", text: "I continuously monitor your tax brackets for shifting money to tax-free Roth accounts." },
                ],
            },
        ],
        cta: { label: "Get Your Free Retirement Score", to: "/offer" },
    },

    /* ── 4. Tax Planning ── */
    {
        id: "tax-planning",
        label: "Tax Planning",
        headline: "Tax Planning with myra",
        tagline: "It's not just about what you've saved. It's about what you get to keep.",
        sections: [
            {
                icon: Landmark,
                title: 'The Strategy of "Which Account First?"',
                subtitle: "Smarter withdrawal sequencing.",
                bullets: [
                    { bold: "The Optimal Order:", text: "I calculate exactly which accounts you should draw from each year to keep your taxable income as low as possible." },
                    { bold: "Smoothing Your Taxes:", text: "Instead of huge tax spikes in your 70s, I create a withdrawal plan that smooths your tax liability over your entire lifetime." },
                ],
            },
            {
                icon: Zap,
                title: "Proactive Roth Conversions",
                subtitle: "Paying taxes on sale, so you don't pay taxes on the harvest.",
                bullets: [
                    { bold: "Filling the Brackets:", text: 'I look for windows where you are in a low tax bracket and suggest "Roth conversions."' },
                    { bold: "The Long Game:", text: "You pay a small amount of tax now at a low rate, so that money becomes 100% tax-free for the rest of your life." },
                    { bold: "Human CFP® Oversight:", text: "My team of human CFP® professionals reviews and approves these strategies before we make a move." },
                ],
            },
            {
                icon: Clock,
                title: "No More RMD Surprises",
                subtitle: "Taking the stress out of Required Minimum Distributions.",
                bullets: [
                    { bold: "Predicting the Future:", text: "I project exactly what your RMDs will be years before they happen." },
                    { bold: "Strategic Income Riders:", text: "I prioritize funding income riders from your tax-deferred accounts, satisfying your RMDs automatically." },
                    { bold: "Automated Alerts:", text: "I notify you 90, 60, and 30 days ahead of any RMD deadlines." },
                ],
            },
            {
                icon: Heart,
                title: 'Maximizing the "Utility" of Your Money',
                subtitle: "Spend it when you have the energy to enjoy it.",
                bullets: [
                    { bold: 'The "Fun-Adjusted™" Value:', text: "By keeping your lifetime tax bill low, I increase the \"utility\" of your money." },
                    { bold: "Legacy Protection:", text: "I help ensure that if you plan to leave a legacy, you aren't accidentally leaving them a massive tax burden." },
                ],
            },
            {
                icon: DollarSign,
                title: "Tax-Loss Harvesting",
                subtitle: "Turning market dips into tax breaks.",
                bullets: [
                    { bold: "Silver Linings:", text: "If investments lose value, I can automatically sell them to capture the loss and immediately buy a similar investment." },
                    { bold: "Continuous Monitoring:", text: "Because I monitor your portfolio 24/7, I catch tax-saving opportunities that a human advisor checking once a quarter might miss." },
                ],
            },
        ],
        cta: { label: "Get Your Free Retirement Score", to: "/offer" },
    },

    /* ── 5. Invest with myra ── */
    {
        id: "invest-with-myra",
        label: "Invest with myra",
        headline: "Invest with myra",
        tagline: "Why settle for clunky, expensive, and slow investment management when you can have smart, fast, and affordable?",
        sections: [
            {
                icon: DollarSign,
                title: "Low Fees, More Returns",
                subtitle: "Maximize your portfolio's potential by minimizing costs.",
                bullets: [
                    { bold: "Fraction of the Cost:", text: "Get professional portfolio management at a fraction of typical advisory fees." },
                    { bold: "Keep More:", text: "Every dollar saved in fees is a dollar that remains invested, working harder for your retirement." },
                    { bold: "Same or Better Results:", text: "By eliminating unnecessary costs and relying on proven investment principles, your portfolio is positioned for optimal returns." },
                ],
            },
            {
                icon: BarChart3,
                title: "Your Real-Time Investment Hub",
                subtitle: "A slick UI for a crystal-clear view of your wealth.",
                bullets: [
                    { bold: "Secure Account Linking:", text: "Securely link all your investment accounts. I instantly pull real-time data, giving you a complete view of your net worth." },
                    { bold: "Performance Monitoring:", text: "Easily track your progress towards your goals, understand your returns, and see exactly how your investments are allocated." },
                    { bold: "Crystal-Clear Insights:", text: "I present complex portfolio information in easy-to-understand visuals." },
                ],
            },
            {
                icon: Briefcase,
                title: "Instant Answers for Game-Time Decisions",
                subtitle: "Your advisor is always just a chat away.",
                bullets: [
                    { bold: "Chat with myra, Instantly:", text: "Just ask. Chat with me in real-time about your investment decisions, get immediate answers, and execute changes if needed." },
                    { bold: "Proactive Management:", text: "I continuously monitor your portfolio and automatically rebalance to keep you on track." },
                    { bold: "Smart Rebalancing:", text: "My AI identifies optimal rebalancing opportunities, including tax-loss harvesting in taxable accounts." },
                ],
            },
            {
                icon: Cpu,
                title: "The Power of an AI-Forward Custodial Relationship",
                subtitle: "Seamless integration for frictionless investing.",
                bullets: [
                    { bold: "Frictionless Action:", text: "When your retirement plan evolves, your investment portfolio can adjust automatically to match." },
                    { bold: "Bank-Level Security:", text: "Your assets are held at a secure, top-tier custodian, ensuring the safety of your money." },
                ],
            },
        ],
        cta: { label: "See How Much You Can Save", to: "/offer" },
    },
];

/* ───────── Rendered panel ───────── */

interface MegaMenuPanelProps {
    item: MenuContent;
    onClose: () => void;
}

export function MegaMenuPanel({ item, onClose }: MegaMenuPanelProps) {
    // Lock body scroll when panel is open
    useEffect(() => {
        const original = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = original; };
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed inset-0 z-[60] bg-background overflow-y-auto"
            data-lenis-prevent
        >
            {/* Sticky header bar */}
            <div className="sticky top-0 z-10 flex items-center justify-between px-6 md:px-12 py-4 bg-background/90 backdrop-blur-xl border-b border-border/30">
                <div className="flex items-center gap-3">
                    <span className="text-lg font-serif tracking-tight" style={{ color: '#6B9FCE' }}>myra.</span>
                    <span className="text-foreground/30">|</span>
                    <h2 className="text-base font-semibold text-foreground tracking-tight">{item.headline}</h2>
                </div>
                <button
                    onClick={onClose}
                    className="w-10 h-10 rounded-full bg-foreground/5 hover:bg-foreground/10 border border-border/50 flex items-center justify-center transition-all hover:scale-105"
                >
                    <X className="w-4 h-4 text-foreground" />
                </button>
            </div>

            <div className="mx-auto max-w-3xl px-6 md:px-8 py-8 pb-20">
                {/* Tagline */}
                {item.tagline && (
                    <div className="mb-8 p-6 rounded-2xl bg-primary/[0.04] dark:bg-primary/[0.08] border border-primary/10">
                        <p className="text-base md:text-lg text-foreground/80 font-medium leading-relaxed">
                            {item.tagline}
                        </p>
                    </div>
                )}

                {/* Prose mode (myra Story) */}
                {item.prose && (
                    <div className="p-6 md:p-8 rounded-2xl bg-foreground/[0.02] dark:bg-white/[0.03] border border-border/40">
                        <div className="whitespace-pre-line text-foreground/70 leading-[1.85] text-[15px] font-sans">
                            {item.prose}
                        </div>
                    </div>
                )}

                {/* Structured sections */}
                {item.sections.length > 0 && (
                    <div className="space-y-4">
                        {item.sections.map((section, idx) => {
                            const Icon = section.icon;
                            return (
                                <div 
                                    key={idx} 
                                    className="p-5 md:p-6 rounded-2xl bg-foreground/[0.02] dark:bg-white/[0.03] border border-border/40 hover:border-primary/20 transition-colors"
                                >
                                    <div className="flex items-start gap-4 mb-4">
                                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                                            <Icon className="w-5 h-5 text-primary" />
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="text-base font-semibold text-foreground leading-tight">
                                                {idx + 1}. {section.title}
                                            </h3>
                                            <p className="text-sm italic text-foreground/50 mt-1">
                                                {section.subtitle}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="ml-14 space-y-2">
                                        {section.bullets.map((b, bi) => (
                                            <div key={bi} className="text-sm text-foreground/65 leading-relaxed flex items-start gap-2.5">
                                                <span className="w-1.5 h-1.5 rounded-full bg-primary/30 mt-[7px] shrink-0" />
                                                <span>
                                                    <strong className="text-foreground/85 font-medium">{b.bold}</strong>{" "}
                                                    {b.text}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* CTA */}
                {item.cta && (
                    <div className="mt-10 p-8 rounded-2xl bg-foreground/[0.03] dark:bg-white/[0.04] border border-border/40 text-center">
                        <p className="text-foreground/60 text-sm mb-5">
                            Ready to see what a completely optimized retirement looks like?
                        </p>
                        <Link
                            to={item.cta.to}
                            target="_blank"
                            onClick={onClose}
                            className="inline-flex items-center gap-2 h-12 px-8 rounded-full bg-foreground text-background text-sm font-semibold hover:opacity-90 transition-all shadow-lg hover:scale-[1.02] active:scale-[0.98]"
                        >
                            {item.cta.label}
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                )}
            </div>
        </motion.div>
    );
}

export default MegaMenuPanel;
