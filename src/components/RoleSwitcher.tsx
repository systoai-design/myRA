import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Shield, User } from "lucide-react";

export const RoleSwitcher = () => {
    const { user, role, testRole, setTestRole } = useAuth();

    // Only show the switcher if the actual DB role is admin (or specifically systo.ai@gmail.com)
    if (!user || role !== "admin") return null;

    const currentActiveRole = testRole || role;

    return (
        <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 bg-black/80 backdrop-blur-md border border-white/10 p-2 rounded-full shadow-2xl">
            <span className="text-white/60 text-xs px-2 hidden sm:inline-block">Test Mode:</span>
            <Button
                variant={currentActiveRole === "admin" ? "default" : "ghost"}
                size="sm"
                className={`rounded-full ${currentActiveRole === "admin" ? "bg-primary text-white" : "text-white/70 hover:text-white"}`}
                onClick={() => setTestRole(null)} // null clears override, defaults to real role (admin)
            >
                <Shield className="w-4 h-4 mr-2" />
                Admin
            </Button>
            <Button
                variant={currentActiveRole === "user" ? "default" : "ghost"}
                size="sm"
                className={`rounded-full ${currentActiveRole === "user" ? "bg-primary text-white" : "text-white/70 hover:text-white"}`}
                onClick={() => setTestRole("user")}
            >
                <User className="w-4 h-4 mr-2" />
                User
            </Button>
        </div>
    );
};
