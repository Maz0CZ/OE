import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/context/AuthContext";
import Layout from "@/components/Layout";
import AuthLayout from "@/components/AuthLayout"; // Keep AuthLayout for login/register
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
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <Router>
            <Routes>
              <Route
                path="/login"
                element={
                  <AuthLayout>
                    <LoginPage />
                  </AuthLayout>
                }
              />
              <Route
                path="/register"
                element={
                  <AuthLayout>
                    <RegisterPage />
                  </AuthLayout>
                }
              />
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
                path="/admin"
                element={
                  <Layout>
                    <Admin />
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
              <Route
                path="/forum/:postId"
                element={
                  <Layout>
                    <PostDetailPage />
                  </Layout>
                }
              />
              <Route
                path="/countries"
                element={
                  <Layout>
                    <CountriesPage />
                  </Layout>
                }
              />
              <Route
                path="/violations"
                element={
                  <Layout>
                    <ViolationsPage />
                  </Layout>
                }
              />
              <Route
                path="/un-declarations"
                element={
                  <Layout>
                    <UNDeclarationsPage />
                  </Layout>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Router>
        </QueryClientProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;