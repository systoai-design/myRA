import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { User, Calendar, MapPin, ReceiptText, Users, Clock, Loader2, CheckCircle2 } from 'lucide-react';

export default function InitialProfileSurvey({ onComplete }: { onComplete: () => void }) {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    
    const [formData, setFormData] = useState({
        name: '',
        dob: '',
        state: '',
        tax_status: 'Single',
        spouse_age: '',
        retirement_age: '',
    });

    const STATES = [
        "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA",
        "HI","ID","IL","IN","IA","KS","KY","LA","ME","MD",
        "MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
        "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC",
        "SD","TN","TX","UT","VT","VA","WA","WV","WI","WY"
    ];

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            toast.error("You must be logged in to save your profile.");
            return;
        }

        setLoading(true);

        try {
            // 1. Save all fields to user_memories
            const memoriesToSave = [
                { category: 'legal_name', fact: formData.name },
                { category: 'date_of_birth', fact: formData.dob },
                { category: 'state', fact: formData.state },
                { category: 'marital_status', fact: formData.tax_status },
                { category: 'retirement_date', fact: formData.retirement_age },
            ];

            if (formData.tax_status.includes('Married')) {
                memoriesToSave.push({ category: 'spouse_age', fact: formData.spouse_age });
            }

            for (const mem of memoriesToSave) {
                if (mem.fact.trim() === '') continue;
                await supabase.from('user_memory').upsert({
                    user_id: user.id,
                    category: mem.category,
                    fact: mem.fact,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'user_id, category' });
            }

            // 2. Trigger GHL Sync Edge Function (we will build this next)
            const { data: sessionData } = await supabase.auth.getSession();
            const { error: syncError } = await supabase.functions.invoke('sync-ghl-contact', {
                body: { userId: user.id },
                headers: {
                    Authorization: `Bearer ${sessionData.session?.access_token}`
                }
            });

            if (syncError) {
                console.error("GHL Sync Error:", syncError);
                // We don't block the user UI on a GHL sync failure
            }

            setSuccess(true);
            toast.success("Profile saved successfully!");
            
            setTimeout(() => {
                onComplete();
            }, 1500);

        } catch (error: any) {
            toast.error(error.message || "Failed to save profile details");
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="flex flex-col items-center justify-center p-8 space-y-4 text-center">
                <CheckCircle2 className="w-16 h-16 text-green-400" />
                <h3 className="text-xl font-bold font-serif text-white">Profile Complete</h3>
                <p className="text-white/60 text-sm">MyRA now has your baseline details.</p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="space-y-1">
                <h3 className="text-2xl font-bold font-serif text-white tracking-tight">Quick Calibration</h3>
                <p className="text-white/50 text-sm">Skip the introductory chat and provide your baseline details up front.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                    <label className="text-xs font-bold text-white/50 uppercase tracking-wider flex items-center gap-1.5 border-none">
                        <User className="w-3.5 h-3.5" /> Full Name
                    </label>
                    <input required type="text" name="name" value={formData.name} onChange={handleChange} placeholder="John Doe" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-primary/50 transition-colors" />
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold text-white/50 uppercase tracking-wider flex items-center gap-1.5 border-none">
                        <Calendar className="w-3.5 h-3.5" /> Date of Birth
                    </label>
                    <input required type="date" name="dob" value={formData.dob} onChange={handleChange} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-primary/50 transition-colors" />
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold text-white/50 uppercase tracking-wider flex items-center gap-1.5 border-none">
                        <ReceiptText className="w-3.5 h-3.5" /> Tax Filing Status
                    </label>
                    <select required name="tax_status" value={formData.tax_status} onChange={handleChange} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50 transition-colors appearance-none">
                        <option value="Single">Single</option>
                        <option value="Married Filing Jointly">Married Filing Jointly</option>
                        <option value="Married Filing Separately">Married Filing Separately</option>
                        <option value="Head of Household">Head of Household</option>
                    </select>
                </div>

                {formData.tax_status.includes('Married') && (
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-white/50 uppercase tracking-wider flex items-center gap-1.5 border-none">
                            <Users className="w-3.5 h-3.5" /> Spouse's Age
                        </label>
                        <input required type="number" name="spouse_age" value={formData.spouse_age} onChange={handleChange} placeholder="e.g. 58" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-primary/50 transition-colors" />
                    </div>
                )}

                <div className="space-y-2">
                    <label className="text-xs font-bold text-white/50 uppercase tracking-wider flex items-center gap-1.5 border-none">
                        <MapPin className="w-3.5 h-3.5" /> State of Residence
                    </label>
                    <select required name="state" value={formData.state} onChange={handleChange} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50 transition-colors appearance-none">
                        <option value="" disabled>Select State</option>
                        {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold text-white/50 uppercase tracking-wider flex items-center gap-1.5 border-none">
                        <Clock className="w-3.5 h-3.5" /> Target Retirement Age
                    </label>
                    <input required type="number" name="retirement_age" value={formData.retirement_age} onChange={handleChange} placeholder="e.g. 65 (or current age if retired)" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-primary/50 transition-colors" />
                </div>
            </div>

            <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={onComplete} className="px-6 py-3 font-semibold text-white/60 hover:text-white transition-colors">
                    Skip for now
                </button>
                <button type="submit" disabled={loading} className="px-8 py-3 bg-gradient-to-r from-primary to-blue-500 hover:opacity-90 transition-opacity rounded-xl font-bold text-white flex items-center gap-2 shadow-lg shadow-primary/20">
                    {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : "Save Profile"}
                </button>
            </div>
        </form>
    );
}
