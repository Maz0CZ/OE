import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/context/AuthContext";
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

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <Router>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/" element={<Layout />}>
                <Route index element={<Dashboard />} />
                <Route path="conflicts" element={<ConflictsPage />} />
                <Route path="admin" element={<Admin />} />
                <Route path="forum" element={<Forum />} />
                <Route path="forum/:postId" element={<PostDetailPage />} />
                <Route path="countries" element={<CountriesPage />} />
                <Route path="violations" element={<ViolationsPage />} />
                <Route path="un-declarations" element={<UNDeclarationsPage />} />
                <Route path="profile" element={<ProfilePage />} />
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