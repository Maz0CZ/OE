import React from "react";
import { Link, useLocation } from "react-router-dom";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext"; // Import useAuth

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const { currentUser, logout, isAdmin, isModerator, isReporter } = useAuth();

  const navItems = [
    { name: "Dashboard", path: "/", roles: ["admin", "moderator", "reporter", "user"] },
    { name: "Conflicts", path: "/conflicts", roles: ["admin", "moderator", "reporter", "user"] },
    { name: "Countries", path: "/countries", roles: ["admin", "moderator", "reporter", "user"] },
    { name: "Violations", path: "/violations", roles: ["admin", "moderator", "reporter", "user"] },
    { name: "UN Declarations", path: "/un-declarations", roles: ["admin", "moderator", "reporter", "user"] },
    { name: "Forum", path: "/forum", roles: ["admin", "moderator", "reporter", "user"] },
    { name: "Admin", path: "/admin", roles: ["admin"] }, // Only admin can see this
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <header className="bg-primary text-primary-foreground p-4 shadow-md">
        <div className="container mx-auto flex flex-wrap justify-between items-center gap-4">
          <div className="flex flex-col">
            <Link to="/" className="text-2xl font-bold">
              Open<span className="text-highlight">Eyes</span>
            </Link>
            <span className="text-sm text-muted-foreground">Global Conflict Monitoring</span>
          </div>
          <nav className="flex-grow">
            <ul className="flex space-x-4 justify-center">
              {navItems.map((item) => (
                (item.roles.includes(currentUser?.role || "user")) && ( // Conditionally render based on role
                  <li key={item.name}>
                    <Link
                      to={item.path}
                      className={`hover:text-highlight transition-colors ${
                        location.pathname === item.path ? "text-highlight font-semibold" : ""
                      }`}
                    >
                      {item.name}
                    </Link>
                  </li>
                )
              ))}
            </ul>
          </nav>
          <div className="flex items-center space-x-2">
            {currentUser && (
              <span className="text-sm text-muted-foreground mr-2">
                Logged in as: <span className="font-semibold text-highlight">{currentUser.username} ({currentUser.role})</span>
              </span>
            )}
            <Button variant="outline" className="bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground">
              Debug
            </Button>
            <Input
              type="text"
              placeholder="Search conflicts, countries..."
              className="w-48 bg-secondary border-secondary-foreground text-primary-foreground placeholder:text-muted-foreground"
            />
            <Button className="bg-highlight hover:bg-purple-700 text-primary-foreground">
              Search
            </Button>
            {currentUser && (
              <Button variant="ghost" onClick={logout} className="text-muted-foreground hover:text-highlight">
                Logout
              </Button>
            )}
          </div>
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