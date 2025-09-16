import React from "react";
import { useTheme } from "next-themes";
import Header from "@/components/Header";
// import { Sidebar } from "@/components/Sidebar"; // No longer needed for desktop layout
import { Toaster } from "@/components/ui/sonner";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { theme } = useTheme();
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
        {/* Removed Desktop Sidebar */}
        <main className="flex-1 p-6 lg:p-8 overflow-auto">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
      <Toaster position="top-center" /> {/* Add Toaster here */}
    </div>
  );
};

export default Layout;