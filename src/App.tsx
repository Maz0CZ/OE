import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import Layout from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import ConflictsPage from "@/pages/ConflictsPage";
import Admin from "@/pages/Admin";
import Forum from "@/pages/Forum";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import NotFound from "@/pages/NotFound";
import CountriesPage from "./pages/CountriesPage";
import ViolationsPage from "./pages/ViolationsPage";
import UNDeclarationsPage from "./pages/UNDeclarationsPage";
import PostDetailPage from "./pages/PostDetailPage";
import ProfilePage from "./pages/ProfilePage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";

const queryClient = new QueryClient();

// Protected route for authenticated users
const UserProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// Protected route for admin/moderator users
const AdminProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { isAdmin, isModerator, isLoading } = useAuth();
  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }
  if (!isAdmin && !isModerator) {
    return <Navigate to="/" replace />; // Redirect to dashboard if not authorized
  }
  return children;
};

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <Router>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              
              {/* Public routes that use the Layout */}
              <Route path="/" element={<Layout />}>
                <Route index element={<Dashboard />} />
                <Route path="conflicts" element={<ConflictsPage />} />
                <Route path="forum" element={<Forum />} />
                <Route path="forum/:postId" element={<PostDetailPage />} />
                <Route path="countries" element={<CountriesPage />} />
                <Route path="violations" element={<ViolationsPage />} />
                <Route path="un-declarations" element={<UNDeclarationsPage />} />
                
                {/* Protected routes nested under Layout */}
                <Route path="profile" element={
                  <UserProtectedRoute>
                    <ProfilePage />
                  </UserProtectedRoute>
                } />
                <Route path="admin" element={
                  <AdminProtectedRoute>
                    <Admin />
                  </AdminProtectedRoute>
                } />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Router>
          <Toaster position="top-center" />
        </QueryClientProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;