import React, { useEffect, useState, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { NewHeader } from "@/components/new-design/NewHeader";
import NewFooter from "@/components/new-design/NewFooter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import * as pdfjsLib from 'pdfjs-dist';
import { jsPDF } from "jspdf";
import { 
    LayoutDashboard, Users, Database, ShieldAlert, 
    User, Plus, Search, Trash2, Terminal, Archive, 
    RefreshCcw, LifeBuoy, FileText, MessageSquareText, FileUp, File,
    Download, ClipboardCopy, ChevronRight, History
} from "lucide-react";

// Configure PDF.js worker to use CDN to avoid Vite build configuration issues
pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

import { toast } from "sonner";
import { Navigate } from "react-router-dom";
import { Input } from "@/components/ui/input";

const PROTECTED_ADMIN_EMAILS = [
    "systo.ai@gmail.com",
    "darren@retirementarchitects.com",
];

const TRANSCRIPT_CATEGORIES = [
    "Client Transcript",
    "Case Scenario",
    "CFP Curriculum",
    "RICP Curriculum",
    "Compliance / Regulatory",
    "Investment Policy",
    "Fee Schedule",
    "General Knowledge",
];

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
    const [transcript, setTranscript] = useState({ category: "Client Transcript", content: "", label: "" });
    const [isSubmittingTranscript, setIsSubmittingTranscript] = useState(false);
    const [isUploadingPdf, setIsUploadingPdf] = useState(false);
    const [allChats, setAllChats] = useState<any[]>([]);
    const [selectedChat, setSelectedChat] = useState<any | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);

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
                let teamList = (directData || []).map(u => ({ ...u, status: 'active' }));
                
                // Ensure all protected admins always appear in the team list
                for (const adminEmail of PROTECTED_ADMIN_EMAILS) {
                    const exists = teamList.some(t => t.email?.toLowerCase() === adminEmail);
                    if (!exists) {
                        teamList.push({
                            id: `protected-${adminEmail}`,
                            user_id: `protected-${adminEmail}`,
                            email: adminEmail,
                            role: 'admin' as const,
                            status: 'active',
                            created_at: new Date().toISOString(),
                            updated_at: new Date().toISOString(),
                        });
                    }
                }
                setTeam(teamList);
                
                if (teamError || teamResponse?.error) {
                    toast.error("Limited view: Sync service unavailable", {
                        description: teamError?.message || teamResponse?.error || "Using fallback data source."
                    });
                }
            } else {
                // Also ensure protected admins appear in the edge function response
                let teamList = teamResponse.team || [];
                for (const adminEmail of PROTECTED_ADMIN_EMAILS) {
                    const exists = teamList.some((t: any) => t.email?.toLowerCase() === adminEmail);
                    if (!exists) {
                        teamList.push({
                            id: `protected-${adminEmail}`,
                            user_id: `protected-${adminEmail}`,
                            email: adminEmail,
                            role: 'admin',
                            status: 'active',
                            created_at: new Date().toISOString(),
                            updated_at: new Date().toISOString(),
                        });
                    }
                }
                setTeam(teamList);
            }
            
            // Fetch all client conversations via Edge Function
            const { data: chatResponse, error: chatError } = await supabase.functions.invoke('get-admin-chats', {
                headers: {
                    Authorization: `Bearer ${sessionData.session?.access_token}`
                }
            });

            if (chatError) {
                console.error("Chat fetch error:", chatError);
            } else if (chatResponse?.success) {
                setAllChats(chatResponse.chats || []);
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

    const submitTranscript = async () => {
        if (!transcript.content.trim()) return;
        setIsSubmittingTranscript(true);
        try {
            // Split long transcripts into ~2000-char chunks for better retrieval
            const chunks = [];
            const raw = transcript.content.trim();
            const CHUNK_SIZE = 2000;
            if (raw.length <= CHUNK_SIZE) {
                chunks.push(raw);
            } else {
                for (let i = 0; i < raw.length; i += CHUNK_SIZE) {
                    chunks.push(raw.substring(i, i + CHUNK_SIZE));
                }
            }

            for (let i = 0; i < chunks.length; i++) {
                const labelSuffix = chunks.length > 1 ? ` [Part ${i + 1}/${chunks.length}]` : "";
                const { error } = await supabase
                    .from("global_knowledge_base")
                    .insert({
                        category: transcript.category,
                        insight: (transcript.label ? `[${transcript.label}] ` : "") + chunks[i] + labelSuffix,
                        status: 'approved',
                        source: 'manual_training',
                        frequency_score: 100
                    });
                if (error) throw error;
            }

            toast.success(`Transcript ingested successfully! (${chunks.length} chunk${chunks.length > 1 ? 's' : ''})`);
            setTranscript({ category: "Client Transcript", content: "", label: "" });
            fetchData();
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Failed to ingest transcript");
        } finally {
            setIsSubmittingTranscript(false);
        }
    };

    const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploadingPdf(true);
        try {
            // 1. Read PDF text
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            
            let fullText = "";
            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const content = await page.getTextContent();
                const pageText = content.items.map((item: any) => item.str).join(" ");
                fullText += `--- Page ${i} ---\n${pageText}\n\n`;
            }

            if (!fullText.trim()) {
                throw new Error("Could not extract any text from this PDF.");
            }

            // 2. Upload physical file to Supabase Storage
            const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
            const fileName = `${Date.now()}_${cleanFileName}`;
            
            const { data: storageData, error: storageError } = await supabase.storage
                .from('knowledge_base')
                .upload(fileName, file, { cacheControl: '3600', upsert: false });

            if (storageError) {
                // Helpful message if bucket doesn't exist
                if (storageError.message?.toLowerCase().includes("not found") || storageError.name === 'StorageApiError') {
                    throw new Error("The 'knowledge_base' storage bucket does not exist. Please create a public bucket named 'knowledge_base' in your Supabase dashboard.");
                }
                throw storageError;
            }

            const { data: publicUrlData } = supabase.storage.from('knowledge_base').getPublicUrl(fileName);
            const publicUrl = publicUrlData.publicUrl;

            // 3. Insert into global_knowledge_base chunked
            const chunks = [];
            const raw = fullText.trim();
            const CHUNK_SIZE = 2000;
            if (raw.length <= CHUNK_SIZE) {
                chunks.push(raw);
            } else {
                for (let i = 0; i < raw.length; i += CHUNK_SIZE) {
                    chunks.push(raw.substring(i, i + CHUNK_SIZE));
                }
            }

            for (let i = 0; i < chunks.length; i++) {
                const labelSuffix = chunks.length > 1 ? ` [Part ${i + 1}/${chunks.length}]` : "";
                const { error: dbError } = await supabase
                    .from("global_knowledge_base")
                    .insert({
                        category: "Document",
                        insight: `[Source: ${file.name}] (${publicUrl})\n\n` + chunks[i] + labelSuffix,
                        status: 'approved',
                        source: 'manual_training',
                        frequency_score: 100
                    });
                if (dbError) throw dbError;
            }

            toast.success(`PDF uploaded and processed! (${chunks.length} chunks)`);
            if (fileInputRef.current) fileInputRef.current.value = '';
            fetchData();
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Failed to process PDF", { duration: 10000 });
        } finally {
            setIsUploadingPdf(false);
            if (fileInputRef.current) fileInputRef.current.value = ''; // Reset input so same file can be selected again if failed
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

    const exportToMarkdown = (chat: any) => {
        const title = chat.title || `Conversation with ${chat.user_email}`;
        const date = new Date(chat.created_at).toLocaleString();
        let md = `# ${title}\n\n`;
        md += `**Client:** ${chat.user_email}\n`;
        md += `**Date:** ${date}\n`;
        md += `**Chat ID:** ${chat.id}\n\n---\n\n`;

        chat.messages.forEach((msg: any) => {
            const role = msg.role === 'user' ? 'Client' : 'MyRA';
            md += `### ${role}\n${msg.content}\n\n`;
        });

        const blob = new Blob([md], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `MyRA_Transcript_${chat.id}.md`;
        a.click();
        toast.success("Markdown exported!");
    };

    const exportToPDF = (chat: any) => {
        const doc = new jsPDF();
        const title = chat.title || `Conversation with ${chat.user_email}`;
        const date = new Date(chat.created_at).toLocaleString();
        
        doc.setFontSize(18);
        doc.text("Retirement Architects - MyRA Transcript", 10, 20);
        doc.setFontSize(12);
        doc.text(`Client: ${chat.user_email}`, 10, 30);
        doc.text(`Date: ${date}`, 10, 40);
        doc.line(10, 45, 200, 45);
        
        let y = 55;
        chat.messages.forEach((msg: any) => {
            const role = msg.role === 'user' ? 'CLIENT' : 'MYRA';
            
            // Handle page breaks
            if (y > 270) {
                doc.addPage();
                y = 20;
            }

            doc.setFont("helvetica", "bold");
            doc.text(`${role}:`, 10, y);
            y += 7;
            
            doc.setFont("helvetica", "normal");
            const lines = doc.splitTextToSize(msg.content, 180);
            
            // Check if all lines fit on current page, if not, print line by line checking for break
            lines.forEach((line: string) => {
                if (y > 280) {
                    doc.addPage();
                    y = 20;
                }
                doc.text(line, 10, y);
                y += 6;
            });
            y += 10;
        });
        
        doc.save(`MyRA_Transcript_${chat.id}.pdf`);
        toast.success("PDF exported!");
    };

    const copyForGoogleDocs = (chat: any) => {
        let text = `${chat.title || 'MyRA Conversation'}\n`;
        text += `Client: ${chat.user_email}\n`;
        text += `Date: ${new Date(chat.created_at).toLocaleString()}\n\n`;
        text += `--------------------------------------------------\n\n`;
        
        chat.messages.forEach((msg: any) => {
            const role = msg.role === 'user' ? 'CLIENT' : 'MYRA';
            text += `${role}:\n${msg.content}\n\n`;
        });
        
        navigator.clipboard.writeText(text);
        toast.success("Formatted for Google Docs!", {
            description: "Transcript copied. Paste directly into a new Google Doc."
        });
    };

    if (authLoading) return <div className="min-h-screen bg-black" />;
    
    // Protection: Only allow access ifeffective role is admin
    if (effectiveRole !== "admin") {
        return <Navigate to="/agent-chat" replace />;
    }

    return (
        <div className="min-h-screen bg-[#030508] text-white dark selection:bg-primary/30 font-sans flex flex-col relative overflow-x-hidden">
            {/* Background Aurora */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 aurora-bg opacity-30" />
                <div className="absolute inset-0 bg-gradient-to-b from-[#030508] via-transparent to-[#030508]" />
            </div>
            
            <NewHeader />
            
            <main className="flex-1 max-w-7xl w-full mx-auto px-6 pt-32 pb-16 relative z-10 space-y-12">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3 animate-in fade-in slide-in-from-left-4 duration-700">
                            <div className="p-2.5 rounded-2xl bg-primary/10 border border-primary/20">
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
                         <div className="px-4 py-2 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-end">
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
                         <div className="px-4 py-2 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-end">
                            <span className="text-[10px] uppercase tracking-widest text-white/60 font-bold">Version</span>
                            <span className="text-sm font-mono text-primary/80">{functionVersion || "1.2.0"}</span>
                         </div>
                    </div>
                </div>

                <Tabs defaultValue="training" className="w-full animate-in fade-in zoom-in-95 duration-1000">
                    <TabsList className="inline-flex h-12 items-center justify-center rounded-2xl bg-white/5 p-1 border border-white/10 mb-12 shadow-2xl">
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
                        <TabsTrigger value="conversations" className="px-8 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-primary/30 transition-all duration-300">
                            <History className="w-4 h-4 mr-2" />
                            Client Conversations
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="insights" className="outline-none">
                        <div className="bg-white/[0.03] border border-white/10 rounded-[32px] p-8 overflow-hidden relative">
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
                                <div className="rounded-2xl border border-white/10 overflow-hidden bg-black/40 relative z-10">
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
                        <div className="bg-white/[0.03] border border-white/10 rounded-[32px] p-8 overflow-hidden relative">
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
                                <div className="rounded-2xl border border-white/10 overflow-hidden bg-black/40 relative z-10">
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
                                                            {PROTECTED_ADMIN_EMAILS.includes(member.email?.toLowerCase()) && (
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
                                                            disabled={PROTECTED_ADMIN_EMAILS.includes(member.email?.toLowerCase())}
                                                            className={`h-9 px-4 rounded-xl border border-white/5 hover:border-primary/50 transition-all duration-300 ${
                                                                member.role === 'admin' ? 'text-red-400 hover:bg-red-400/10' : 'text-primary hover:bg-primary/10'
                                                            }`}
                                                            onClick={() => toggleUserRole(member.id, member.role)}
                                                        >
                                                            {PROTECTED_ADMIN_EMAILS.includes(member.email?.toLowerCase()) ? 'Protected' : member.role === 'admin' ? 'Revoke Admin' : 'Make Administrator'}
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
                            <div className="lg:col-span-1 bg-white/[0.03] border border-white/10 rounded-[32px] p-8">
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
                                <div className="bg-white/[0.03] border border-white/10 rounded-[32px] p-8">
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

                            {/* Client Transcript Ingestion */}
                            <div className="lg:col-span-3 bg-white/[0.03] border border-white/10 rounded-[32px] p-8 overflow-hidden relative">
                                <div className="absolute top-0 right-0 p-8 pointer-events-none opacity-10">
                                    <MessageSquareText className="w-32 h-32 text-white" />
                                </div>

                                <div className="flex items-center justify-between mb-8 relative z-10">
                                    <div>
                                        <h2 className="text-2xl font-bold font-serif mb-1">Client Transcripts & Case Scenarios</h2>
                                        <p className="text-white/70 text-sm">Paste real client conversations, CFP/RICP curriculum, compliance docs, or fee schedules to train MyRA on real-world reasoning.</p>
                                    </div>
                                    <div className="p-3 rounded-2xl bg-primary/5 border border-primary/10">
                                        <FileText className="w-5 h-5 text-primary" />
                                    </div>
                                </div>

                                <div className="p-6 rounded-2xl border border-white/10 bg-white/5 space-y-5 relative z-10">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] uppercase tracking-widest text-white/50 font-bold ml-1">Category</label>
                                            <select
                                                className="w-full h-10 px-4 rounded-xl bg-black/40 border border-white/5 text-white text-sm focus:outline-none focus:border-primary/50 appearance-none cursor-pointer"
                                                value={transcript.category}
                                                onChange={(e) => setTranscript({...transcript, category: e.target.value})}
                                            >
                                                {TRANSCRIPT_CATEGORIES.map(cat => (
                                                    <option key={cat} value={cat} className="bg-[#0a0f18] text-white">{cat}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] uppercase tracking-widest text-white/50 font-bold ml-1">Label (optional)</label>
                                            <Input
                                                placeholder="e.g. 'Roth Conversion meeting - Jan 2025'"
                                                className="rounded-xl bg-black/40 border-white/5"
                                                value={transcript.label}
                                                onChange={(e) => setTranscript({...transcript, label: e.target.value})}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[10px] uppercase tracking-widest text-white/50 font-bold ml-1">Paste Transcript / Document Content</label>
                                        <textarea
                                            className="w-full p-4 rounded-xl bg-black/40 border border-white/5 text-sm text-white/90 focus:border-primary/50 focus:outline-none custom-scrollbar min-h-[250px] resize-y font-mono leading-relaxed"
                                            placeholder={"Paste the full client conversation, meeting transcript, curriculum excerpt, or compliance document here...\n\nMyRA will chunk and store this in her knowledge base so she can reference it during future conversations."}
                                            value={transcript.content}
                                            onChange={(e) => setTranscript({...transcript, content: e.target.value})}
                                        />
                                        <div className="flex items-center justify-between">
                                            <p className="text-[10px] text-white/30 italic">
                                                {transcript.content.length > 0 ? `${transcript.content.length.toLocaleString()} characters · ~${Math.ceil(transcript.content.length / 2000)} chunk${Math.ceil(transcript.content.length / 2000) !== 1 ? 's' : ''}` : 'No content yet'}
                                            </p>
                                            <Button
                                                onClick={submitTranscript}
                                                disabled={isSubmittingTranscript || !transcript.content.trim()}
                                                className="h-10 px-8 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold shadow-lg shadow-primary/20 flex items-center gap-2"
                                            >
                                                {isSubmittingTranscript ? (
                                                    <>
                                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                        Ingesting...
                                                    </>
                                                ) : (
                                                    <>
                                                        <FileText className="w-4 h-4" />
                                                        Ingest into Knowledge Base
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* PDF Knowledge Upload */}
                            <div className="lg:col-span-3 bg-white/[0.03] border border-white/10 rounded-[32px] p-8 overflow-hidden relative">
                                <div className="absolute top-0 right-0 p-8 pointer-events-none opacity-10">
                                    <FileUp className="w-32 h-32 text-white" />
                                </div>

                                <div className="flex items-center justify-between mb-8 relative z-10">
                                    <div>
                                        <h2 className="text-2xl font-bold font-serif mb-1">Knowledge Documents (PDF)</h2>
                                        <p className="text-white/70 text-sm">Upload standard policies, pitch decks, or informational PDFs. MyRA will read them and keep the original file securely stored.</p>
                                    </div>
                                    <div className="p-3 rounded-2xl bg-primary/5 border border-primary/10">
                                        <File className="w-5 h-5 text-primary" />
                                    </div>
                                </div>

                                <div className="p-8 rounded-2xl border border-dashed border-white/20 bg-white/5 flex gap-6 flex-col items-center justify-center relative z-10 transition-all hover:bg-white/[0.08] hover:border-primary/50 group cursor-pointer"
                                     onClick={() => fileInputRef.current?.click()}
                                >
                                    <input 
                                        type="file" 
                                        accept=".pdf" 
                                        className="hidden" 
                                        ref={fileInputRef}
                                        onChange={handlePdfUpload}
                                        disabled={isUploadingPdf}
                                    />
                                    
                                    <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-primary/20 group-hover:border-primary/40 transition-colors">
                                        {isUploadingPdf ? (
                                            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                        ) : (
                                            <FileUp className="w-8 h-8 text-white/50 group-hover:text-primary transition-colors" />
                                        )}
                                    </div>
                                    
                                    <div className="text-center">
                                        <h3 className="text-white font-bold text-lg mb-1">{isUploadingPdf ? "Reading & Storing Document..." : "Click to Upload PDF"}</h3>
                                        <p className="text-white/40 text-sm">{isUploadingPdf ? "Please wait, extracting text and uploading to Supabase." : "Supports .pdf files up to 50MB"}</p>
                                    </div>
                                    
                                    {!isUploadingPdf && (
                                        <Button className="mt-4 rounded-xl bg-white text-black hover:bg-white/90 font-bold px-8" asChild>
                                            <span>Select File</span>
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </TabsContent>
                    <TabsContent value="conversations" className="outline-none">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Conversations List */}
                            <div className="lg:col-span-1 bg-white/[0.03] border border-white/10 rounded-[32px] p-8 flex flex-col h-[700px]">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <History className="w-6 h-6 text-primary" />
                                        <h3 className="text-xl font-bold font-serif">Recent Chats</h3>
                                    </div>
                                    <Button variant="ghost" size="icon" onClick={fetchData} className="h-8 w-8 rounded-lg hover:bg-white/5">
                                        <RefreshCcw className="w-4 h-4" />
                                    </Button>
                                </div>

                                <div className="relative mb-6">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                                    <Input 
                                        placeholder="Search by email or title..." 
                                        className="h-10 pl-10 rounded-xl bg-black/40 border-white/10"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>

                                <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                                    {allChats
                                        .filter(c => 
                                            c.user_email?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                            c.title?.toLowerCase().includes(searchQuery.toLowerCase())
                                        )
                                        .map((chat) => (
                                            <div 
                                                key={chat.id} 
                                                onClick={() => setSelectedChat(chat)}
                                                className={`p-4 rounded-2xl border transition-all cursor-pointer group ${
                                                    selectedChat?.id === chat.id 
                                                        ? 'bg-primary/20 border-primary/40 shadow-lg shadow-primary/10' 
                                                        : 'bg-white/5 border-white/10 hover:bg-white/[0.08] hover:border-white/20'
                                                }`}
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div className="space-y-1 flex-1 min-w-0">
                                                        <h4 className="text-sm font-bold text-white truncate">{chat.title || "Untitled Conversation"}</h4>
                                                        <p className="text-[10px] text-primary/70 font-mono truncate">{chat.user_email}</p>
                                                    </div>
                                                    <ChevronRight className={`w-4 h-4 text-white/20 group-hover:text-primary transition-colors ${selectedChat?.id === chat.id ? 'rotate-90 text-primary' : ''}`} />
                                                </div>
                                                <div className="mt-3 flex items-center justify-between text-[9px] text-white/40 uppercase tracking-widest font-bold">
                                                    <span>{chat.messages?.length || 0} Messages</span>
                                                    <span>{new Date(chat.updated_at).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        ))
                                    }
                                </div>
                            </div>

                            {/* Chat Preview */}
                            <div className="lg:col-span-2 bg-white/[0.03] border border-white/10 rounded-[32px] p-8 flex flex-col h-[700px] relative overflow-hidden">
                                {!selectedChat ? (
                                    <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
                                        <div className="p-6 rounded-full bg-white/5 border border-white/10">
                                            <MessageSquareText className="w-12 h-12 text-white/20" />
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-bold text-white/60">Select a Conversation</h4>
                                            <p className="text-sm text-white/30 max-w-xs mx-auto">Click on a chat record from the left panel to review the transcript and export documents.</p>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        {/* Header */}
                                        <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/10">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="text-2xl font-bold font-serif">{selectedChat.title || "Untitled Conversation"}</h3>
                                                    <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded font-bold uppercase">v{selectedChat.messages?.length || 0}</span>
                                                </div>
                                                <p className="text-white/50 text-sm font-medium">Session with <span className="text-white/80">{selectedChat.user_email}</span></p>
                                            </div>
                                            
                                            <div className="flex items-center gap-2">
                                                <Button 
                                                    variant="outline" 
                                                    size="sm" 
                                                    className="rounded-xl border-white/10 hover:bg-white/5 text-xs gap-2"
                                                    onClick={() => exportToMarkdown(selectedChat)}
                                                >
                                                    <FileText className="w-3.5 h-3.5" />
                                                    MD
                                                </Button>
                                                <Button 
                                                    variant="outline" 
                                                    size="sm" 
                                                    className="rounded-xl border-white/10 hover:bg-white/5 text-xs gap-2"
                                                    onClick={() => exportToPDF(selectedChat)}
                                                >
                                                    <Download className="w-3.5 h-3.5" />
                                                    PDF
                                                </Button>
                                                <Button 
                                                    className="rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-xs gap-2"
                                                    onClick={() => copyForGoogleDocs(selectedChat)}
                                                >
                                                    <ClipboardCopy className="w-3.5 h-3.5" />
                                                    Transcript
                                                </Button>
                                            </div>
                                        </div>

                                        {/* Messages Scroll Area */}
                                        <div className="flex-1 overflow-y-auto space-y-6 pr-2 custom-scrollbar">
                                            {selectedChat.messages?.map((msg: any, idx: number) => (
                                                <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                                                    <div className="flex items-center gap-2 mb-1.5 px-3">
                                                        <span className="text-[9px] font-bold uppercase tracking-widest text-white/30">
                                                            {msg.role === 'user' ? 'Client' : 'MyRA Intelligence'}
                                                        </span>
                                                    </div>
                                                    <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed ${
                                                        msg.role === 'user' 
                                                            ? 'bg-primary/10 border border-primary/20 text-white rounded-tr-none' 
                                                            : 'bg-white/5 border border-white/10 text-white/90 rounded-tl-none'
                                                    }`}>
                                                        {msg.content}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-[10px] text-white/30 font-mono">
                                            <span>CHAT_ID: {selectedChat.id}</span>
                                            <span>STARTED: {new Date(selectedChat.created_at).toLocaleString()}</span>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </main>

            <NewFooter />
        </div>
    );
}
