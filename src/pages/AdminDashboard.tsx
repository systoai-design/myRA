import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
    LayoutDashboard, Users, Database, ShieldAlert, 
    User, Plus, Search, Trash2, Terminal, Archive, 
    RefreshCcw, LifeBuoy 
} from "lucide-react";
import { toast } from "sonner";
import { Navigate } from "react-router-dom";
import { Input } from "@/components/ui/input";

export default function AdminDashboard() {
    const { role, testRole, loading: authLoading } = useAuth();
    const effectiveRole = testRole || role;

    const [insights, setInsights] = useState<any[]>([]);
    const [team, setTeam] = useState<any[]>([]);
    const [manualTraining, setManualTraining] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [inviteEmail, setInviteEmail] = useState("");
    const [syncStatus, setSyncStatus] = useState<"idle" | "loading" | "error">("idle");
    const [functionVersion, setFunctionVersion] = useState<string | null>(null);
    const [newTraining, setNewTraining] = useState({ category: "General", insight: "" });

    useEffect(() => {
        if (effectiveRole === "admin") {
            fetchData();
        }
    }, [effectiveRole]);

    const fetchData = async () => {
        setLoading(true);
        setSyncStatus("loading");
        try {
            // Fetch pending insights (ai_extraction)
            const { data: insightsData, error: insightsError } = await supabase
                .from("global_knowledge_base")
                .select("*")
                .eq("source", "ai_extraction")
                .order("created_at", { ascending: false });
            
            if (insightsError) console.error("Insights fetch error:", insightsError);
            if (insightsData) setInsights(insightsData);

            // Fetch manual training rules
            const { data: manualData, error: manualError } = await supabase
                .from("global_knowledge_base")
                .select("*")
                .eq("source", "manual_training")
                .order("created_at", { ascending: false });
            
            if (manualError) console.error("Manual training fetch error:", manualError);
            if (manualData) setManualTraining(manualData);

            // Fetch team members via Edge Function for full visibility
            const { data: sessionData } = await supabase.auth.getSession();
            const { data: teamResponse, error: teamError } = await supabase.functions.invoke('get-team', {
                headers: {
                    Authorization: `Bearer ${sessionData.session?.access_token}`
                }
            });
                
            if (teamError || !teamResponse?.success) {
                console.warn("Edge function fetch failed, falling back to direct DB fetch:", teamError || teamResponse?.error);
                
                // Fallback to direct DB fetch if Edge Function fails
                const { data: directData, error: directError } = await supabase
                    .from("user_roles")
                    .select("*")
                    .order("created_at", { ascending: true });
                
                if (directError) throw directError;
                if (directData) setTeam(directData.map(u => ({ ...u, status: 'active' })));
                
                if (teamError || teamResponse?.error) {
                    toast.error("Limited view: Sync service unavailable", {
                        description: teamError?.message || teamResponse?.error || "Using fallback data source."
                    });
                }
            } else {
                setTeam(teamResponse.team);
            }
            
            setSyncStatus("idle");
        } catch (err: any) {
            console.error("Fetch error:", err);
            setSyncStatus("error");
            toast.error("Sync Error", {
                description: err.message || "Could not synchronize with the server."
            });
        }
        setLoading(false);
    };

    const updateInsightStatus = async (id: string, status: 'approved' | 'rejected') => {
        const { error } = await supabase
            .from("global_knowledge_base")
            .update({ status })
            .eq("id", id);

        if (error) {
            toast.error("Failed to update status");
        } else {
            toast.success(`Insight ${status}`);
            setInsights(insights.map(i => i.id === id ? { ...i, status } : i));
        }
    };

    const toggleTrainingActive = async (id: string, current: boolean) => {
        const { error } = await supabase
            .from("global_knowledge_base")
            .update({ is_active: !current })
            .eq("id", id);

        if (error) {
            toast.error("Failed to update status");
        } else {
            toast.success(`Training ${!current ? 'Enabled' : 'Disabled'}`);
            setManualTraining(manualTraining.map(t => t.id === id ? { ...t, is_active: !current } : t));
        }
    };

    const addManualTraining = async () => {
        if (!newTraining.insight) return;
        
        const { error } = await supabase
            .from("global_knowledge_base")
            .insert({
                category: newTraining.category,
                insight: newTraining.insight,
                status: 'approved',
                source: 'manual_training',
                frequency_score: 100
            });

        if (error) {
            toast.error("Failed to add training rule");
        } else {
            toast.success("Training rule added successfully");
            setNewTraining({ category: "General", insight: "" });
            fetchData();
        }
    };

    const generateRescueLink = async (email: string) => {
        setSyncStatus("loading");
        try {
            const { data, error } = await supabase.functions.invoke('add-admin', {
                body: { email: email.trim().toLowerCase(), debug: true }
            });
            
            if (error || !data?.success) throw new Error(error?.message || data?.error || "Failed to generate link");
            
            if (data.action_link) {
                await navigator.clipboard.writeText(data.action_link);
                toast.success("Rescue link copied!", {
                    description: "Share this link with " + email + " to bypass email issues."
                });
            }
        } catch (err: any) {
            toast.error("Rescue Error", { description: err.message });
        }
        setSyncStatus("idle");
    };

    const troubleshootSMTP = async () => {
        const toastId = toast.loading("Testing SMTP configuration...");
        try {
            const { data, error } = await supabase.functions.invoke('debug-smtp', {
                body: { email: 'systo.ai@gmail.com' }
            });

            if (error || !data?.success) {
                toast.error("SMTP Configuration Error", {
                    id: toastId,
                    description: data?.error || error?.message || "Check your Resend API Key in Supabase Secrets.",
                    duration: 10000
                });
                if (data?.details) console.log("SMTP Debug Details:", data.details);
            } else {
                toast.success("SMTP is working!", {
                    id: toastId,
                    description: "A test email has been sent to your inbox via Resend."
                });
            }
        } catch (err: any) {
            toast.error("SMTP Test Failed", { id: toastId, description: err.message });
        }
    };

    const toggleUserRole = async (userId: string, currentRole: string) => {
        const newRole = currentRole === 'admin' ? 'user' : 'admin';
        const { error } = await supabase
            .from("user_roles")
            .update({ role: newRole })
            .eq("id", userId); 

        if (error) {
            toast.error("Failed to update user role");
        } else {
            toast.success(`User role updated to ${newRole}`);
            setTeam(team.map(t => t.id === userId ? { ...t, role: newRole } : t));
        }
    };

    const promoteUserByEmail = async () => {
        if (!inviteEmail) return;
        setSyncStatus("loading");
        
        try {
            const { data: sessionData } = await supabase.auth.getSession();
            const token = sessionData.session?.access_token;
            
            const { data, error } = await supabase.functions.invoke('add-admin', {
                body: { email: inviteEmail.trim().toLowerCase() },
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (data?.version) setFunctionVersion(data.version);

            if (error) {
                toast.error(error.message || "An error occurred while promoting the user.");
                setSyncStatus("error");
                console.error(error);
                return;
            }

            if (data && data.success === false) {
                toast.error(data.error || "Failed to promote user.");
                setSyncStatus("error");
                console.error("Edge function logical error:", data.error);
                return;
            }

            if (data && data.action_link) {
                await navigator.clipboard.writeText(data.action_link);
                toast.success(`Action link generated!`, {
                    description: "The login/invite link has been copied to your clipboard. Send it to the user manually if the SMTP email didn't arrive.",
                    duration: 15000,
                });
            } else {
                toast.success(`Promotion requested for ${inviteEmail}`);
            }
            
            setInviteEmail("");
            setTimeout(fetchData, 1500);
        } catch (err: any) {
            toast.error(err.message || "Failed to promote user");
            setSyncStatus("error");
            console.error(err);
        }
    };

    if (authLoading) return <div className="min-h-screen bg-black" />;
    
    // Protection: Only allow access ifeffective role is admin
    if (effectiveRole !== "admin") {
        return <Navigate to="/agent-chat" replace />;
    }

    return (
        <div className="min-h-screen bg-[#050505] text-white dark selection:bg-primary/30 font-sans flex flex-col relative overflow-hidden">
            {/* Background Mesh/Glows */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full pointer-events-none -z-1" />
            <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] bg-accent/20 blur-[100px] rounded-full pointer-events-none -z-1" />
            
            <Header />
            
            <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-28 relative z-10 space-y-12">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3 animate-in fade-in slide-in-from-left-4 duration-700">
                            <div className="p-2 rounded-xl bg-primary/10 border border-primary/20 backdrop-blur-md">
                                <ShieldAlert className="w-8 h-8 text-primary shadow-lg shadow-primary/20" />
                            </div>
                            <h1 className="text-4xl font-bold tracking-tight font-serif italic text-white/90">
                                Admin<span className="text-primary not-italic">Dashboard</span>
                            </h1>
                        </div>
                        <p className="text-white/70 font-light max-w-md animate-in fade-in slide-in-from-left-6 duration-1000">
                            Manage your retirement AI knowledge base and oversee team members from a centralized command center.
                        </p>
                    </div>

                    <div className="flex items-center gap-4 animate-in fade-in slide-in-from-right-4 duration-700">
                         <div className="px-4 py-2 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md flex flex-col items-end">
                            <span className="text-[10px] uppercase tracking-widest text-white/60 font-bold">System Status</span>
                            <div className="flex items-center gap-2">
                                <div className={`w-1.5 h-1.5 rounded-full ${
                                    syncStatus === 'loading' ? 'bg-primary animate-pulse' : 
                                    syncStatus === 'error' ? 'bg-red-400' : 'bg-green-400'
                                }`} />
                                <span className="text-sm font-mono text-white/80">
                                    {syncStatus === 'loading' ? 'Syncing' : syncStatus === 'error' ? 'Sync Error' : 'Online'}
                                </span>
                            </div>
                         </div>
                         <div className="px-4 py-2 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md flex flex-col items-end">
                            <span className="text-[10px] uppercase tracking-widest text-white/60 font-bold">Version</span>
                            <span className="text-sm font-mono text-primary/80">{functionVersion || "1.2.0"}</span>
                         </div>
                    </div>
                </div>

                <Tabs defaultValue="insights" className="w-full animate-in fade-in zoom-in-95 duration-1000">
                    <TabsList className="inline-flex h-12 items-center justify-center rounded-2xl bg-white/5 p-1 border border-white/10 backdrop-blur-xl mb-12 shadow-2xl">
                        <TabsTrigger value="insights" className="px-8 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-primary/30 transition-all duration-300">
                            <Database className="w-4 h-4 mr-2" />
                            AI Patterns
                        </TabsTrigger>
                        <TabsTrigger value="training" className="px-8 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-primary/30 transition-all duration-300">
                            <Terminal className="w-4 h-4 mr-2" />
                            AI Training
                        </TabsTrigger>
                        <TabsTrigger value="team" className="px-8 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-primary/30 transition-all duration-300">
                            <Users className="w-4 h-4 mr-2" />
                            Team Management
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="insights" className="outline-none">
                        <div className="glass-dark border border-white/10 rounded-[32px] p-8 glass-shine overflow-hidden relative">
                             <div className="absolute top-0 right-0 p-8 pointer-events-none opacity-10">
                                <Database className="w-32 h-32 text-white" />
                             </div>
                            
                            <div className="flex items-center justify-between mb-8 relative z-10">
                                <div>
                                    <h2 className="text-2xl font-bold font-serif mb-1">Knowledge Aggregation</h2>
                                    <p className="text-white/70 text-sm font-medium italic">Validating patterns learned from user conversations</p>
                                </div>
                                <Button variant="ghost" className="text-xs text-white/60 hover:text-white hover:bg-white/5" onClick={fetchData}>
                                    Refresh Data
                                </Button>
                            </div>

                            {loading ? (
                                <div className="py-12 flex flex-col items-center justify-center space-y-4">
                                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                    <p className="text-white/30 text-sm italic">Synchronizing with Knowledge Base...</p>
                                </div>
                            ) : insights.length === 0 ? (
                                <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-2xl">
                                    <Database className="w-12 h-12 text-white/10 mx-auto mb-4" />
                                    <p className="text-white/30 italic">No patterns detected for review yet.</p>
                                </div>
                            ) : (
                                <div className="rounded-2xl border border-white/10 overflow-hidden bg-black/40 backdrop-blur-md relative z-10">
                                    <Table>
                                        <TableHeader className="bg-white/10 border-b border-white/20">
                                            <TableRow className="border-white/10 hover:bg-transparent">
                                                <TableHead className="text-white/90 text-xs uppercase tracking-tighter py-4">Category</TableHead>
                                                <TableHead className="text-white/90 text-xs uppercase tracking-tighter py-4">Insight Description</TableHead>
                                                <TableHead className="text-white/90 text-xs uppercase tracking-tighter py-4">Freq. Score</TableHead>
                                                <TableHead className="text-white/90 text-xs uppercase tracking-tighter py-4">Current Status</TableHead>
                                                <TableHead className="text-right text-white/90 text-xs uppercase tracking-tighter py-4">Review Action</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {insights.map((insight) => (
                                                <TableRow key={insight.id} className="border-white/5 hover:bg-white/[0.03] transition-colors group">
                                                    <TableCell className="font-semibold text-primary/70">{insight.category}</TableCell>
                                                    <TableCell className="max-w-md py-6">
                                                        <p className="text-sm text-white/80 leading-relaxed">{insight.insight}</p>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-16 h-1 bg-white/10 rounded-full overflow-hidden">
                                                                <div className="h-full bg-primary" style={{ width: `${insight.frequency_score}%` }} />
                                                            </div>
                                                            <span className="text-xs text-white/40">{insight.frequency_score}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border shadow-sm ${
                                                            insight.status === 'approved' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                                            insight.status === 'rejected' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                                            'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                                                        }`}>
                                                            {insight.status.replace('_', ' ')}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex justify-end gap-3 translate-x-4 opacity-50 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
                                                            <Button 
                                                                size="sm" 
                                                                className="h-8 rounded-full bg-green-500/10 hover:bg-green-500 text-green-400 hover:text-white border border-green-500/20" 
                                                                onClick={() => updateInsightStatus(insight.id, 'approved')}
                                                            >
                                                                Approve
                                                            </Button>
                                                            <Button 
                                                                size="sm" 
                                                                className="h-8 rounded-full bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/20" 
                                                                onClick={() => updateInsightStatus(insight.id, 'rejected')}
                                                            >
                                                                Discard
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="team" className="outline-none">
                        <div className="glass-dark border border-white/10 rounded-[32px] p-8 glass-shine overflow-hidden relative">
                             <div className="absolute top-0 right-0 p-8 pointer-events-none opacity-10">
                                <Users className="w-32 h-32 text-white" />
                             </div>

                              <div className="flex items-center justify-between mb-12 relative z-10">
                                <div>
                                    <h2 className="text-2xl font-bold font-serif mb-1">Team Overview</h2>
                                    <p className="text-white/50 text-sm">Provision access and manage administrative roles</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        className="h-9 rounded-xl border-white/10 hover:bg-white/5 text-white/60 gap-2"
                                        onClick={troubleshootSMTP}
                                    >
                                        <ShieldAlert className="w-4 h-4 text-amber-400" />
                                        Troubleshoot Email
                                    </Button>
                                    <div className="px-4 py-2 bg-primary/10 border border-primary/20 rounded-xl">
                                        <span className="text-xs text-primary font-bold">{team.length} Team Members</span>
                                    </div>
                                </div>
                            </div>

                            {loading ? (
                                <div className="py-12 flex flex-col items-center justify-center space-y-4">
                                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                    <p className="text-white/30 text-sm italic">Synchronizing with Roles Database...</p>
                                </div>
                            ) : (
                                <div className="rounded-2xl border border-white/10 overflow-hidden bg-black/40 backdrop-blur-md relative z-10">
                                     <Table>
                                        <TableHeader className="bg-white/10 border-b border-white/20">
                                            <TableRow className="border-white/10 hover:bg-transparent">
                                                <TableHead className="text-white/90 text-xs uppercase tracking-tighter py-4 pl-6 text-left">Identity (Email)</TableHead>
                                                <TableHead className="text-white/90 text-xs uppercase tracking-tighter py-4 text-left">Assigned Role</TableHead>
                                                <TableHead className="text-white/90 text-xs uppercase tracking-tighter py-4 text-left">Account Status</TableHead>
                                                <TableHead className="text-white/90 text-xs uppercase tracking-tighter py-4">Auth Date</TableHead>
                                                <TableHead className="text-right text-white/90 text-xs uppercase tracking-tighter py-4 pr-6">Management</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {team.map((member) => (
                                                <TableRow key={member.id} className="border-white/5 hover:bg-white/[0.03] transition-colors group">
                                                    <TableCell className="py-6 pl-6 text-left">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-[10px] font-bold">
                                                                {member.email.substring(0,2).toUpperCase()}
                                                            </div>
                                                            <span className="font-semibold text-white/90">{member.email}</span>
                                                            {member.email === 'systo.ai@gmail.com' && (
                                                                <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded text-white/40 border border-white/10">Owner</span>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-left">
                                                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border shadow-sm ${
                                                            member.role === 'admin' ? 'bg-primary/10 text-primary border-primary/20' : 'bg-white/5 text-white/60 border-white/10'
                                                        }`}>
                                                            {member.role === 'admin' ? (
                                                                <><ShieldAlert className="w-3 h-3" /> Admin</>
                                                            ) : (
                                                                <><User className="w-3 h-3" /> Standard User</>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-left">
                                                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border shadow-sm ${
                                                            member.status === 'active' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-orange-500/10 text-orange-400 border-orange-500/20'
                                                        }`}>
                                                            {member.status === 'active' ? 'Active' : 'Invited (Pending)'}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-white/70 text-xs font-mono">
                                                        {new Date(member.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                                    </TableCell>
                                                     <TableCell className="text-right pr-6 flex justify-end gap-2">
                                                        <Button 
                                                            variant="ghost" 
                                                            size="icon"
                                                            title="Rescue Login (Manual Link)"
                                                            className="h-9 w-9 rounded-xl border border-white/5 text-amber-400 hover:bg-amber-400/10 hover:border-amber-400/30 transition-all"
                                                            onClick={() => generateRescueLink(member.email)}
                                                        >
                                                            <LifeBuoy className="w-4 h-4" />
                                                        </Button>
                                                        <Button 
                                                            variant="ghost" 
                                                            size="sm"
                                                            disabled={member.email === 'systo.ai@gmail.com'}
                                                            className={`h-9 px-4 rounded-xl border border-white/5 hover:border-primary/50 transition-all duration-300 ${
                                                                member.role === 'admin' ? 'text-red-400 hover:bg-red-400/10' : 'text-primary hover:bg-primary/10'
                                                            }`}
                                                            onClick={() => toggleUserRole(member.id, member.role)}
                                                        >
                                                            {member.role === 'admin' ? 'Revoke Admin' : 'Make Administrator'}
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}

                            {/* Promote User Action */}
                            <div className="mt-12 group p-8 rounded-[32px] border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all relative">
                                <div className="flex items-start justify-between mb-6">
                                    <div>
                                        <h3 className="text-xl font-bold font-serif mb-1">Add Administrator</h3>
                                        <p className="text-white/60 text-sm">Enter the email of an existing user to grant them admin permissions.</p>
                                    </div>
                                    <div className="p-3 rounded-2xl bg-primary/5 border border-primary/10">
                                        <Plus className="w-5 h-5 text-primary" />
                                    </div>
                                </div>
                                <div className="flex gap-4 max-w-lg">
                                    <div className="relative flex-1">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                                        <Input 
                                            placeholder="user@example.com" 
                                            className="h-12 pl-12 rounded-xl bg-black/40 border-white/10 focus:border-primary/50"
                                            value={inviteEmail}
                                            onChange={(e) => setInviteEmail(e.target.value)}
                                        />
                                    </div>
                                    <Button onClick={promoteUserByEmail} className="h-12 px-8 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold shadow-lg shadow-primary/20">
                                        Promote User
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="training" className="outline-none">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                             {/* Core Directive View */}
                            <div className="lg:col-span-1 glass-dark border border-white/10 rounded-[32px] p-8 glass-shine">
                                <div className="flex items-center gap-3 mb-6">
                                    <Terminal className="w-6 h-6 text-primary" />
                                    <h3 className="text-xl font-bold font-serif">Core Directive</h3>
                                </div>
                                <div className="p-6 rounded-2xl bg-black/60 border border-white/5 font-mono text-[11px] text-white/70 leading-relaxed overflow-y-auto max-h-[400px] custom-scrollbar">
                                    <p className="mb-4">SYSTEM_ROLE: You are MyRA, a fiduciary retirement advisor.</p>
                                    <p className="mb-4">BASE_KNOWLEDGE: Retirement planning, 401k, IRAs, Social Security, FIAs, Income Gaps.</p>
                                    <p className="mb-4">TONE: Professional, empathetic, clear, confident.</p>
                                    <p className="text-primary/80 italic animate-pulse mt-8 border-t border-white/5 pt-4">
                                        Note: This prompt is read-only. To modify AI behavior, add specific knowledge rules to the archive.
                                    </p>
                                </div>
                            </div>

                            {/* Manual Training Management */}
                            <div className="lg:col-span-2 space-y-8">
                                <div className="glass-dark border border-white/10 rounded-[32px] p-8 glass-shine">
                                    <div className="flex items-center justify-between mb-8">
                                        <div>
                                            <h2 className="text-2xl font-bold font-serif mb-1">Global Knowledge Rules</h2>
                                            <p className="text-white/70 text-sm">Add manual corrections that apply to all user conversations.</p>
                                        </div>
                                    </div>

                                    {/* Add Rule Form */}
                                    <div className="mb-10 p-6 rounded-2xl border border-white/10 bg-white/5 space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] uppercase tracking-widest text-white/50 font-bold ml-1">Category</label>
                                                <Input 
                                                    placeholder="e.g. Products, Compliance" 
                                                    className="rounded-xl bg-black/40 border-white/5"
                                                    value={newTraining.category}
                                                    onChange={(e) => setNewTraining({...newTraining, category: e.target.value})}
                                                />
                                            </div>
                                            <div className="space-y-1.5 flex items-end">
                                               <Button onClick={addManualTraining} className="w-full h-10 rounded-xl bg-primary text-white font-bold">
                                                    Deploy Rule
                                               </Button>
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] uppercase tracking-widest text-white/50 font-bold ml-1">Instruction / Knowledge</label>
                                            <textarea 
                                                className="w-full h-24 p-4 rounded-xl bg-black/40 border border-white/5 text-sm text-white/90 focus:border-primary/50 focus:outline-none custom-scrollbar"
                                                placeholder="Explain FIAs using the 'Bucket Strategy' concept..."
                                                value={newTraining.insight}
                                                onChange={(e) => setNewTraining({...newTraining, insight: e.target.value})}
                                            />
                                        </div>
                                    </div>

                                    {/* Training List */}
                                    <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                                        {manualTraining.length === 0 ? (
                                            <p className="text-center py-10 text-white/20 italic border border-dashed border-white/5 rounded-2xl">No manual training rules deployed.</p>
                                        ) : manualTraining.map((rule) => (
                                            <div key={rule.id} className={`p-5 rounded-2xl border transition-all ${rule.is_active ? 'bg-white/5 border-white/10' : 'bg-white/[0.02] border-white/5 opacity-60'}`}>
                                                <div className="flex items-start justify-between gap-4">
                                                    <div className="space-y-2 flex-1">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-[10px] font-bold uppercase tracking-wider text-primary px-2 py-0.5 bg-primary/10 rounded border border-primary/20">{rule.category}</span>
                                                            {!rule.is_active && <span className="text-[10px] font-bold uppercase tracking-wider text-white/30 px-2 py-0.5 bg-white/5 rounded">Archived</span>}
                                                        </div>
                                                        <p className="text-sm text-white/90 leading-relaxed font-light">{rule.insight}</p>
                                                        <p className="text-[10px] text-white/30 italic">Added {new Date(rule.created_at).toLocaleDateString()}</p>
                                                    </div>
                                                    <div className="flex flex-col gap-2">
                                                        <Button 
                                                            variant="ghost" 
                                                            size="icon" 
                                                            title={rule.is_active ? "Archive/Disable" : "Enable"}
                                                            className={`h-8 w-8 rounded-lg border border-white/5 ${rule.is_active ? 'text-white/40 hover:text-red-400 hover:bg-red-400/10' : 'text-primary hover:bg-primary/10'}`}
                                                            onClick={() => toggleTrainingActive(rule.id, rule.is_active)}
                                                        >
                                                            {rule.is_active ? <Archive className="w-4 h-4" /> : <RefreshCcw className="w-4 h-4" />}
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </main>

            <Footer />
        </div>
    );
}
