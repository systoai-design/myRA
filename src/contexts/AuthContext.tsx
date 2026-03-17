import { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType {
    user: User | null;
    session: Session | null;
    loading: boolean;
    role: "user" | "admin" | null;
    testRole: "user" | "admin" | null;
    setTestRole: (role: "user" | "admin" | null) => void;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    session: null,
    loading: true,
    role: null,
    testRole: null,
    setTestRole: () => {},
    signOut: async () => { },
});

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);
    const [role, setRole] = useState<"user" | "admin" | null>(null);
    const [testRole, setTestRole] = useState<"user" | "admin" | null>(null);

    const fetchUserRole = async (userId: string | undefined) => {
        if (!userId) {
            setRole(null);
            return;
        }
        try {
            const { data, error } = await supabase
                .from("user_roles")
                .select("role")
                .eq("user_id", userId)
                .single();
            if (data && !error) {
                setRole(data.role);
            } else {
                setRole(null);
            }
        } catch (error) {
            console.error("Error fetching user role:", error);
            setRole(null);
        }
    };

    useEffect(() => {
        // Check active sessions and sets the user
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            fetchUserRole(session?.user?.id).then(() => {
                setLoading(false);
            });
        });

        // Listen for changes on auth state (logged in, signed out, etc.)
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            fetchUserRole(session?.user?.id).then(() => {
                setLoading(false);
            });
        });

        return () => subscription.unsubscribe();
    }, []);

    const signOut = async () => {
        setRole(null);
        setTestRole(null);
        await supabase.auth.signOut();
    };

    return (
        <AuthContext.Provider value={{ user, session, loading, role, testRole, setTestRole, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};
