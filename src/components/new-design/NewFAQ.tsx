import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X } from "lucide-react";

const faqs = [
    {
        question: "How is MyRA different from a human advisor?",
        answer: "MyRA provides the same fiduciary-grade logic as a top-tier CFP® but at 1% of the cost. She's available 24/7, never sleeps, and has perfect memory of your entire financial life."
    },
    {
        question: "Is my financial data secure?",
        answer: "Yes. We use bank-level 256-bit AES encryption. We never sell your data to third parties, and our AI models are trained on completely anonymized data streams."
    },
    {
        question: "Can MyRA handle complex tax situations?",
        answer: "Absolutely. MyRA is trained on the latest tax codes and uses advanced forecasting to help you optimize withdrawals, minimize capital gains, and plan multi-generational wealth transfers."
    },
    {
        question: "What products does MyRA recommend?",
        answer: "Since we act as a fiduciary, MyRA only recommends low-cost, globally diversified ETFs and index funds tailored to your specific risk tolerance and retirement timeline. No hidden commission products."
    },
    {
        question: "Can I still talk to a human?",
        answer: "Yes. Our Back Office team of licensed professionals can review your AI-generated plan and answer edge-case questions whenever you need human reassurance."
    }
];

const NewFAQ = () => {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    return (
        <section className="py-32 bg-[#030508] relative">
            <div className="max-w-3xl mx-auto px-6 lg:px-8 relative z-10">
                <div className="text-center mb-20">
                    <h2 className="text-5xl md:text-6xl font-serif text-white mb-6">
                        Ask <span className="italic font-light">anything</span>
                    </h2>
                    <p className="text-lg text-white/50 font-sans font-light">
                        Clear answers to common questions.
                    </p>
                </div>

                <div className="space-y-4">
                    {faqs.map((faq, index) => {
                        const isOpen = openIndex === index;
                        
                        return (
                            <div 
                                key={index} 
                                className="glass-premium rounded-2xl overflow-hidden transition-colors duration-300"
                            >
                                <button
                                    onClick={() => setOpenIndex(isOpen ? null : index)}
                                    className="w-full text-left px-8 py-6 flex items-center justify-between focus:outline-none group"
                                >
                                    <h3 className="text-lg font-serif text-white group-hover:text-white/80 transition-colors pr-8">
                                        {faq.question}
                                    </h3>
                                    <div className={`flex-shrink-0 w-8 h-8 rounded-full border flex items-center justify-center transition-all duration-300 ${isOpen ? 'border-white/30 bg-white/10' : 'border-white/10 bg-transparent group-hover:border-white/30'}`}>
                                        {isOpen ? (
                                            <X className="w-4 h-4 text-white" />
                                        ) : (
                                            <Plus className="w-4 h-4 text-white/70" />
                                        )}
                                    </div>
                                </button>
                                
                                <AnimatePresence initial={false}>
                                    {isOpen && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.3, ease: "easeInOut" }}
                                        >
                                            <div className="px-8 pb-8 text-white/60 font-sans font-light leading-relaxed">
                                                {faq.answer}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default NewFAQ;
