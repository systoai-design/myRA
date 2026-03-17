import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from "react";
import Index from "./pages/Index";
import ThankYou from "./pages/ThankYou";
import AgentChat from "./pages/AgentChat";
import ResetPassword from "./pages/ResetPassword";
import React, { lazy, Suspense } from "react";
import NotFound from "./pages/NotFound";
import { AuthProvider } from "@/contexts/AuthContext";
import SplashScreen from "@/components/SplashScreen";
import { RoleSwitcher } from "@/components/RoleSwitcher";

const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));

const queryClient = new QueryClient();

const App = () => {
  const [showSplash, setShowSplash] = useState(() => {
    // Only show splash once per browser visit globally
    if (localStorage.getItem('myra-splash-shown')) return false;
    return true;
  });

  const handleSplashComplete = () => {
    localStorage.setItem('myra-splash-shown', 'true');
    // Only set this flag if we actually just finished playing the splash screen right now
    sessionStorage.setItem('myra-just-finished-splash', 'true');
    setShowSplash(false);
  };

  return (
    <>
      {showSplash && <SplashScreen onComplete={handleSplashComplete} />}
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <AuthProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/agent-chat" element={<AgentChat />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/admin" element={
                  <Suspense fallback={<div className="min-h-screen bg-black" />}>
                    <AdminDashboard />
                  </Suspense>
                } />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
              <RoleSwitcher />
            </BrowserRouter>
          </AuthProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </>
  );
};

export default App;
