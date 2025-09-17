import React from "react";
import { useTheme } from "next-themes";
import Header from "@/components/Header";
import { Toaster } from "@/components/ui/sonner";
import { useAuth } from "@/context/AuthContext";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { theme } = useTheme();
  const { isLoading } = useAuth();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null; // Render nothing until theme is mounted to prevent FOUC
  }

  return (
    <div className={`min-h-screen flex flex-col bg-background text-foreground`}>
      <Header />
      <div className="flex flex-1">
        <main className="flex-1 p-6 lg:p-8 overflow-auto">
          <div className="max-w-7xl mx-auto">
            {!isLoading && children}
          </div>
        </main>
      </div>
      <Toaster position="top-center" />
    </div>
  );
};

export default Layout;