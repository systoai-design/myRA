import React, { useState } from "react";
import { X, Terminal } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface TrainAIModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function TrainAIModal({ isOpen, onClose }: TrainAIModalProps) {
    const [category, setCategory] = useState("Chat Training");
    const [insight, setInsight] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!insight.trim()) return;

        setIsSubmitting(true);
        try {
            const { error } = await supabase
                .from("global_knowledge_base")
                .insert({
                    category: category.trim(),
                    insight: insight.trim(),
                    status: 'approved',
                    source: 'manual_training',
                    frequency_score: 100
                });

            if (error) throw error;

            toast.success("AI Training Rule deployed successfully!");
            setInsight("");
            onClose();
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Failed to deploy training rule");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-lg bg-[#0a0f18] border border-white/10 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[80px] rounded-full pointer-events-none" />

                <div className="flex items-center justify-between p-6 border-b border-white/10 relative z-10">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20">
                            <Terminal className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white tracking-tight">Train myra</h2>
                            <p className="text-xs text-white/50 font-medium">Inject a new Global Knowledge Rule</p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-all active:scale-95"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 relative z-10 flex flex-col gap-6">
                    <div className="space-y-2">
                        <label className="text-[10px] uppercase font-bold tracking-widest text-white/60 ml-1">Category</label>
                        <input
                            type="text"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full h-12 bg-black/40 border border-white/10 rounded-xl px-4 text-white focus:outline-none focus:border-primary/50 text-sm font-medium transition-all"
                            placeholder="e.g. Products, Objections"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] uppercase font-bold tracking-widest text-white/60 ml-1">Instruction / Knowledge</label>
                        <textarea
                            value={insight}
                            onChange={(e) => setInsight(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-primary/50 text-sm font-medium transition-all min-h-[120px] resize-none custom-scrollbar"
                            placeholder="Directly command the AI (e.g., 'Always mention the Bucket Strategy when explaining FIAs')"
                            required
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 text-sm font-bold text-white/70 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting || !insight.trim()}
                            className="px-6 py-2.5 text-sm font-bold bg-primary hover:bg-primary/90 text-white rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Deploying...
                                </>
                            ) : (
                                "Deploy Rule"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
