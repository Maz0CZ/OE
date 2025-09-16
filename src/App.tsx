import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard"; // Import the new Dashboard page
import Forum from "./pages/Forum";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} /> {/* Set Dashboard as the default route */}
            <Route path="/forum" element={<Forum />} />
            <Route path="/admin" element={<Admin />} />
            {/* Placeholder routes for new navigation items */}
            <Route path="/conflicts" element={<div className="text-foreground text-center text-2xl">Conflicts Page Placeholder</div>} />
            <Route path="/countries" element={<div className="text-foreground text-center text-2xl">Countries Page Placeholder</div>} />
            <Route path="/violations" element={<div className="text-foreground text-center text-2xl">Violations Page Placeholder</div>} />
            <Route path="/un-declarations" element={<div className="text-foreground text-center text-2xl">UN Declarations Page Placeholder</div>} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;