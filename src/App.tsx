import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Forum from "./pages/Forum";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage"; // Import the new RegisterPage
import ConflictsPage from "./pages/ConflictsPage";
import { AuthProvider, useAuth, UserRole } from "./context/AuthContext";
import { ThemeProvider } from "./components/ThemeProvider"; // Import ThemeProvider
import { Button } from "./components/ui/button"; // Import Button for Access Denied page

const queryClient = new QueryClient();

// A wrapper for protected routes
const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRoles?: UserRole[] }> = ({
  children,
  allowedRoles,
}) => {
  const { isAuthenticated, currentUser, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <p className="text-xl">Loading authentication...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && currentUser && !allowedRoles.includes(currentUser.role)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground p-4">
        <h1 className="text-4xl font-bold mb-4">Access Denied</h1>
        <p className="text-xl text-muted-foreground text-center">You do not have permission to view this page.</p>
        <Button onClick={() => window.history.back()} className="mt-6 bg-highlight hover:bg-purple-700 text-primary-foreground">Go Back</Button>
      </div>
    );
  }

  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme"> {/* Wrap with ThemeProvider */}
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} /> {/* Add Register route */}
              {/* Publicly accessible routes */}
              <Route
                path="/"
                element={
                  <Layout>
                    <Dashboard />
                  </Layout>
                }
              />
              <Route
                path="/conflicts"
                element={
                  <Layout>
                    <ConflictsPage />
                  </Layout>
                }
              />
              <Route
                path="/countries"
                element={
                  <Layout>
                    <div className="text-foreground text-center text-2xl">Countries Page Placeholder</div>
                  </Layout>
                }
              />
              <Route
                path="/violations"
                element={
                  <Layout>
                    <div className="text-foreground text-center text-2xl">Violations Page Placeholder</div>
                  </Layout>
                }
              />
              <Route
                path="/un-declarations"
                element={
                  <Layout>
                    <div className="text-foreground text-center text-2xl">UN Declarations Page Placeholder</div>
                  </Layout>
                }
              />
              <Route
                path="/forum"
                element={
                  <Layout>
                    <Forum />
                  </Layout>
                }
              />
              {/* Protected Admin route */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={["admin", "moderator"]}> {/* Admin and Moderator can access */}
                    <Layout>
                      <Admin />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;