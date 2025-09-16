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
import LoginPage from "./pages/LoginPage"; // Import the new LoginPage
import ConflictsPage from "./pages/ConflictsPage"; // Will be created next
import { AuthProvider, useAuth, UserRole } from "./context/AuthContext"; // Import AuthProvider and useAuth

const queryClient = new QueryClient();

// A wrapper for protected routes
const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRoles?: UserRole[] }> = ({
  children,
  allowedRoles,
}) => {
  const { isAuthenticated, currentUser } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && currentUser && !allowedRoles.includes(currentUser.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <h1 className="text-4xl font-bold">Access Denied</h1>
        <p className="text-xl text-muted-foreground">You do not have permission to view this page.</p>
      </div>
    );
  }

  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider> {/* Wrap the entire app with AuthProvider */}
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/conflicts"
              element={
                <ProtectedRoute>
                  <Layout>
                    <ConflictsPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/countries"
              element={
                <ProtectedRoute>
                  <Layout>
                    <div className="text-foreground text-center text-2xl">Countries Page Placeholder</div>
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/violations"
              element={
                <ProtectedRoute>
                  <Layout>
                    <div className="text-foreground text-center text-2xl">Violations Page Placeholder</div>
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/un-declarations"
              element={
                <ProtectedRoute>
                  <Layout>
                    <div className="text-foreground text-center text-2xl">UN Declarations Page Placeholder</div>
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/forum"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Forum />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={["admin"]}> {/* Only admin can access */}
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
  </QueryClientProvider>
);

export default App;