import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import AIVisualChallenges from "./pages/AIVisualChallenges";
import PvsNP from "./pages/PvsNP";
import RiemannHypothesis from "./pages/RiemannHypothesis";
import ExperimentsGallery from "./pages/ExperimentsGallery";
import Dashboard from "./pages/Dashboard";
import CommunityGallery from "./pages/CommunityGallery";
import SharedExperiment from "./pages/SharedExperiment";
import Leaderboard from "./pages/Leaderboard";
import Profile from "./pages/Profile";
import CollectionView from "./pages/CollectionView";
import ComingSoon from "./pages/ComingSoon";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import AdminDashboard from "./pages/admin/AdminDashboard";
import UserManagement from "./pages/admin/UserManagement";
import ContentModeration from "./pages/admin/ContentModeration";
import NotificationManagement from "./pages/admin/NotificationManagement";
import Analytics from "./pages/admin/Analytics";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/ai-challenges" element={<AIVisualChallenges />} />
            
            {/* Millennium Problems */}
            <Route path="/pvsnp" element={<PvsNP />} />
            <Route path="/riemann" element={<RiemannHypothesis />} />
            
            {/* Coming Soon */}
            <Route path="/navier-stokes" element={<ComingSoon />} />
            <Route path="/yang-mills" element={<ComingSoon />} />
            <Route path="/hodge" element={<ComingSoon />} />
            <Route path="/birch-sd" element={<ComingSoon />} />
            <Route path="/poincare" element={<ComingSoon />} />
            
            {/* Auth & User */}
            <Route path="/auth" element={<Auth />} />
            <Route path="/experiments" element={<ExperimentsGallery />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/community" element={<CommunityGallery />} />
            <Route path="/shared/:token" element={<SharedExperiment />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/profile/:username" element={<Profile />} />
            <Route path="/collections/:collectionId" element={<CollectionView />} />
            
            {/* Admin */}
            <Route path="/admin" element={<AdminDashboard />}>
              <Route index element={<Analytics />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="content" element={<ContentModeration />} />
              <Route path="notifications" element={<NotificationManagement />} />
              <Route path="analytics" element={<Analytics />} />
            </Route>
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
