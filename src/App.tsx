import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index";
import AIVisualChallenges from "./pages/AIVisualChallenges";
import PvsNP from "./pages/PvsNP";
import RiemannHypothesis from "./pages/RiemannHypothesis";
import NavierStokes from "./pages/NavierStokes";
import YangMills from "./pages/YangMills";
import HodgeConjecture from "./pages/HodgeConjecture";
import BirchSwinnertonDyer from "./pages/BirchSwinnertonDyer";
import PoincareConjecture from "./pages/PoincareConjecture";
import Auth from "./pages/Auth";
import ExperimentsGallery from "./pages/ExperimentsGallery";
import Dashboard from "./pages/Dashboard";
import CommunityGallery from "./pages/CommunityGallery";
import SharedExperiment from "./pages/SharedExperiment";
import Leaderboard from "./pages/Leaderboard";
import Profile from "./pages/Profile";
import CollectionView from "./pages/CollectionView";
import NotFound from "./pages/NotFound";
import AdminDashboard from "./pages/admin/AdminDashboard";
import UserManagement from "./pages/admin/UserManagement";
import ContentModeration from "./pages/admin/ContentModeration";
import NotificationManagement from "./pages/admin/NotificationManagement";
import Analytics from "./pages/admin/Analytics";
import AIOpsDashboard from "./pages/admin/AIOpsDashboard";

import GlassRoom from "./pages/GlassRoom";
import Careers from "./pages/Careers";
import WeeklyChallenge from "./pages/WeeklyChallenge";

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

          {/* Millennium Problems - All 7 Complete */}
          <Route path="/pvsnp" element={<PvsNP />} />
          <Route path="/riemann" element={<RiemannHypothesis />} />
          <Route path="/navier-stokes" element={<NavierStokes />} />
          <Route path="/yang-mills" element={<YangMills />} />
          <Route path="/hodge" element={<HodgeConjecture />} />
          <Route path="/birch-sd" element={<BirchSwinnertonDyer />} />
          <Route path="/poincare" element={<PoincareConjecture />} />

          {/* Auth & User */}
          <Route path="/auth" element={<Auth />} />
          <Route path="/experiments" element={<ExperimentsGallery />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/community" element={<CommunityGallery />} />
          <Route path="/shared/:token" element={<SharedExperiment />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/profile/:username" element={<Profile />} />
          <Route path="/collections/:collectionId" element={<CollectionView />} />
          <Route path="/glass-room" element={<GlassRoom />} />
          <Route path="/careers" element={<Careers />} />
          <Route path="/weekly" element={<WeeklyChallenge />} />

          {/* Admin */}
          <Route path="/admin" element={<AdminDashboard />}>
            <Route index element={<Analytics />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="content" element={<ContentModeration />} />
            <Route path="notifications" element={<NotificationManagement />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="ai-ops" element={<AIOpsDashboard />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
