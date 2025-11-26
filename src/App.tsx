import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import AIVisualChallenges from "./pages/AIVisualChallenges";
import ComingSoon from "./pages/ComingSoon";
import NotFound from "./pages/NotFound";

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
          
          {/* Millennium Problems - Coming Soon */}
          <Route path="/pvsnp" element={<ComingSoon />} />
          <Route path="/riemann" element={<ComingSoon />} />
          <Route path="/navier-stokes" element={<ComingSoon />} />
          <Route path="/yang-mills" element={<ComingSoon />} />
          <Route path="/hodge" element={<ComingSoon />} />
          <Route path="/birch-sd" element={<ComingSoon />} />
          <Route path="/poincare" element={<ComingSoon />} />
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
