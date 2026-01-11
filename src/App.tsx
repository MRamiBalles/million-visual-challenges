import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Suspense, lazy } from "react";

// Eager load: Critical path components
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Lazy load: Problem pages (heavy WebGPU/Three.js)
const PvsNP = lazy(() => import("./pages/PvsNP"));
const RiemannHypothesis = lazy(() => import("./pages/RiemannHypothesis"));
const NavierStokes = lazy(() => import("./pages/NavierStokes"));
const YangMills = lazy(() => import("./pages/YangMills"));
const HodgeConjecture = lazy(() => import("./pages/HodgeConjecture"));
const BirchSwinnertonDyer = lazy(() => import("./pages/BirchSwinnertonDyer"));
const BSDLaboratory = lazy(() => import("./pages/BSDLaboratory"));
const PoincareConjecture = lazy(() => import("./pages/PoincareConjecture"));

// Lazy load: Feature pages
const AIVisualChallenges = lazy(() => import("./pages/AIVisualChallenges"));
const Auth = lazy(() => import("./pages/Auth"));
const ExperimentsGallery = lazy(() => import("./pages/ExperimentsGallery"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const CommunityGallery = lazy(() => import("./pages/CommunityGallery"));
const SharedExperiment = lazy(() => import("./pages/SharedExperiment"));
const Leaderboard = lazy(() => import("./pages/Leaderboard"));
const Profile = lazy(() => import("./pages/Profile"));
const CollectionView = lazy(() => import("./pages/CollectionView"));
const GlassRoom = lazy(() => import("./pages/GlassRoom"));
const Careers = lazy(() => import("./pages/Careers"));
const WeeklyChallenge = lazy(() => import("./pages/WeeklyChallenge"));
const InsightMarket = lazy(() => import("./pages/InsightMarket"));

// Lazy load: Admin pages
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const UserManagement = lazy(() => import("./pages/admin/UserManagement"));
const ContentModeration = lazy(() => import("./pages/admin/ContentModeration"));
const NotificationManagement = lazy(() => import("./pages/admin/NotificationManagement"));
const Analytics = lazy(() => import("./pages/admin/Analytics"));
const AIOpsDashboard = lazy(() => import("./pages/admin/AIOpsDashboard"));

// Lazy load: Heavy components
const SharedWhiteboard = lazy(() => import("./components/collaboration/SharedWhiteboard").then(m => ({ default: m.SharedWhiteboard })));
const ProblemLayout = lazy(() => import("./components/layout/ProblemLayout").then(m => ({ default: m.ProblemLayout })));

const queryClient = new QueryClient();

// Loading fallback for code-split chunks
const PageLoader = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      <p className="text-muted-foreground text-sm">Loading...</p>
    </div>
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
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
            <Route path="/bsd-laboratory" element={<BSDLaboratory />} />
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
            <Route path="/market" element={<InsightMarket />} />
            <Route 
              path="/market/whiteboard" 
              element={
                <Suspense fallback={<PageLoader />}>
                  <ProblemLayout slug="whiteboard" title="Collaborative Whiteboard">
                    <SharedWhiteboard />
                  </ProblemLayout>
                </Suspense>
              } 
            />

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
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
