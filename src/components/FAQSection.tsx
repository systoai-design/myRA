import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const faqs = [
    {
        question: "How is MyRA different from a human advisor?",
        answer: "MyRA provides the same fiduciary-grade logic as a top-tier CFP® but at 1% of the cost. She's available 24/7, never sleeps, and has perfect memory of your entire financial life."
    },
    {
        question: "Is my financial data secure?",
        answer: "Absolutely. We use bank-level AES-256 encryption. Your data is anonymous, encrypted, and never sold to third parties. We prioritize your privacy above all else."
    },
    {
        question: "Can MyRA handle complex tax situations?",
        answer: "Yes. MyRA is trained on complex tax-loss harvesting and multi-bucket asset allocation strategies including Roth conversions and tax-efficient withdrawal sequencing."
    },
    {
        question: "What products does MyRA recommend?",
        answer: "MyRA recommends a blended approach: a low-cost, diversified investment portfolio for growth, combined with high-quality guaranteed income vehicles (FIAs) where necessary."
    },
    {
        question: "Can I still talk to a human?",
        answer: "Of course. MyRA can handle everything digitally, but if you prefer the human touch, she can instantly book a call with one of our licensed human CFP® advisors."
    }
];

const FAQSection = () => {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    return (
        <section className="py-24 bg-white dark:bg-background relative z-10 border-t border-slate-50 dark:border-white/5">
            <div className="mx-auto max-w-3xl px-6 lg:px-8">
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-16 text-center">Frequently asked questions</h2>

                <div className="space-y-4">
                    {faqs.map((faq, index) => {
                        const isOpen = openIndex === index;
                        return (
                        <div
                            key={index}
                            className={`rounded-[2rem] overflow-hidden transition-all duration-300 glass dark:glass-dark ${isOpen ? 'ring-1 ring-slate-900/5 dark:ring-white/10' : ''}`}
                        >
                            <button
                                onClick={() => setOpenIndex(isOpen ? null : index)}
                                className="w-full flex items-center justify-between p-8 text-left hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                            >
                                <span className="text-xl font-bold text-slate-900 dark:text-white">{faq.question}</span>
                                <motion.div
                                    animate={{ rotate: isOpen ? 180 : 0 }}
                                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                >
                                    <ChevronDown className="w-6 h-6 text-slate-400" />
                                </motion.div>
                            </button>
                            <AnimatePresence initial={false}>
                                {isOpen && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                                    >
                                        <div className="px-8 pb-8">
                                            <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
                                                {faq.answer}
                                            </p>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    )})}
                </div>
            </div>
        </section>
    );
};

export default FAQSection;
