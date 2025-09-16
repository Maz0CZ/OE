import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "@/components/ui/sonner";
import Layout from "@/components/Layout"; // Assuming you have a Layout component
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
import { setupDatabase } from "@/lib/setupDatabase"; // Import the setupDatabase function

function App() {
  React.useEffect(() => {
    // Call setupDatabase when the app mounts
    setupDatabase();
  }, []);

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
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
        <Toaster />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;