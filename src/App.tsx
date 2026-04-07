import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";

import Index from "./pages/Index";
import ThankYou from "./pages/ThankYou";
import MyRAChatPage from "./pages/MyRAChatPage";
import PortfolioPage from "./pages/PortfolioPage";
import ProfilePage from "./pages/ProfilePage";
import SettingsPage from "./pages/SettingsPage";
import ResetPassword from "./pages/ResetPassword";
import React, { lazy, Suspense } from "react";
import NotFound from "./pages/NotFound";
import { AuthProvider } from "@/contexts/AuthContext";

import { RoleSwitcher } from "@/components/RoleSwitcher";
import { ThemeProvider } from "@/components/theme-provider";
import { SmoothScroll } from "@/components/SmoothScroll";

const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const NewDesign = lazy(() => import("./pages/NewDesign"));
const SignUpOffer = lazy(() => import("./pages/SignUpOffer"));
import AppLayout from "./layouts/AppLayout";
import DashboardHome from "./components/app/DashboardHome";

const queryClient = new QueryClient();

// SmoothScroll (Lenis) is great for the landing page but hijacks scroll
// inside the dashboard app where we need native overflow-y-auto in panels.
// This component conditionally wraps only non-app routes with SmoothScroll.
function AppRoutes() {
  const location = useLocation();
  const isAppRoute = location.pathname.startsWith('/app') || location.pathname.startsWith('/agent-chat') || location.pathname.startsWith('/dashboard') || location.pathname.startsWith('/admin');

  const routes = (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/app" element={<AppLayout><DashboardHome /></AppLayout>} />
      <Route path="/app/chat" element={<AppLayout><MyRAChatPage /></AppLayout>} />
      <Route path="/agent-chat" element={<AppLayout><MyRAChatPage /></AppLayout>} />
      <Route path="/dashboard" element={<AppLayout><MyRAChatPage /></AppLayout>} />
      <Route path="/app/portfolio" element={<AppLayout><PortfolioPage /></AppLayout>} />
      <Route path="/app/profile" element={<AppLayout><ProfilePage /></AppLayout>} />
      <Route path="/app/settings" element={<AppLayout><SettingsPage /></AppLayout>} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/new-design" element={
        <Suspense fallback={<div className="min-h-screen bg-black" />}>
          <NewDesign />
        </Suspense>
      } />
      <Route path="/admin" element={
        <Suspense fallback={<div className="min-h-screen bg-black" />}>
          <AdminDashboard />
        </Suspense>
      } />
      <Route path="/offer" element={
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-black"><span className="text-white">Loading...</span></div>}>
          <SignUpOffer />
        </Suspense>
      } />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );

  // Wrap with SmoothScroll only on marketing/landing pages
  if (isAppRoute) return routes;
  return <SmoothScroll>{routes}</SmoothScroll>;
}

const App = () => {
  return (
    <ThemeProvider defaultTheme="system" storageKey="myra-theme">
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <AuthProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <AppRoutes />
              <RoleSwitcher />
            </BrowserRouter>
          </AuthProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
};

export default App;
