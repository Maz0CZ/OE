import React from "react";
import Header from "@/components/Header";
import { Toaster } from "@/components/ui/sonner"; // Assuming sonner Toaster is used for notifications

interface AuthLayoutProps {
  children: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />
      <main className="flex-1 flex items-center justify-center p-4">
        {children}
      </main>
      <Toaster />
    </div>
  );
};

export default AuthLayout;