import React from "react";
import { Link } from "react-router-dom";
import { MadeWithDyad } from "@/components/made-with-dyad";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <header className="bg-primary text-primary-foreground p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold">
            Open<span className="text-highlight">Eyes</span>
          </Link>
          <nav>
            <ul className="flex space-x-4">
              <li>
                <Link to="/forum" className="hover:text-highlight transition-colors">
                  Forum
                </Link>
              </li>
              <li>
                <Link to="/admin" className="hover:text-highlight transition-colors">
                  Admin
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </header>
      <main className="flex-grow container mx-auto p-4">
        {children}
      </main>
      <footer className="p-4 text-center text-muted-foreground">
        <MadeWithDyad />
      </footer>
    </div>
  );
};

export default Layout;