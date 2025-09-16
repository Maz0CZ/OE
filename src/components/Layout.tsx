import React from "react";
import { Link, useLocation } from "react-router-dom";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle"; // Import ThemeToggle

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const { currentUser, logout, isLoading } = useAuth();

  const navItems = [
    { name: "Dashboard", path: "/", roles: ["admin", "moderator", "reporter", "user", "guest"] },
    { name: "Conflicts", path: "/conflicts", roles: ["admin", "moderator", "reporter", "user", "guest"] },
    { name: "Countries", path: "/countries", roles: ["admin", "moderator", "reporter", "user", "guest"] },
    { name: "Violations", path: "/violations", roles: ["admin", "moderator", "reporter", "user", "guest"] },
    { name: "UN Declarations", path: "/un-declarations", roles: ["admin", "moderator", "reporter", "user", "guest"] },
    { name: "Forum", path: "/forum", roles: ["admin", "moderator", "reporter", "user", "guest"] },
    { name: "Admin", path: "/admin", roles: ["admin", "moderator"] }, // Admin and Moderator can see this
  ];

  const currentRole = currentUser?.role || "guest";

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <header className="bg-primary text-primary-foreground p-4 shadow-md">
        <div className="container mx-auto flex flex-wrap items-center justify-between gap-4">
          {/* Logo and Title */}
          <div className="flex flex-col">
            <Link to="/" className="text-2xl font-bold">
              Open<span className="text-highlight">Eyes</span>
            </Link>
            <span className="text-sm text-muted-foreground">Global Conflict Monitoring</span>
          </div>

          {/* Mobile Navigation Toggle */}
          <div className="lg:hidden flex items-center space-x-2">
            {currentUser && (
              <span className="text-sm text-muted-foreground">
                <span className="font-semibold text-highlight">{currentUser.username}</span>
              </span>
            )}
            <ThemeToggle /> {/* Theme Toggle for mobile */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Toggle navigation menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="bg-card p-6">
                <nav className="flex flex-col space-y-4">
                  {navItems.map((item) => (
                    (item.roles.includes(currentRole)) && (
                      <Link
                        key={item.name}
                        to={item.path}
                        className={`text-lg hover:text-highlight transition-colors ${
                          location.pathname === item.path ? "text-highlight font-semibold" : ""
                        }`}
                      >
                        {item.name}
                      </Link>
                    )
                  ))}
                  <div className="pt-4 border-t border-border">
                    {currentUser ? (
                      <Button variant="ghost" onClick={logout} className="w-full justify-start text-muted-foreground hover:text-highlight" disabled={isLoading}>
                        Logout
                      </Button>
                    ) : (
                      <Link to="/login">
                        <Button className="w-full bg-highlight hover:bg-purple-700 text-primary-foreground" disabled={isLoading}>
                          Login
                        </Button>
                      </Link>
                    )}
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex flex-grow justify-center">
            <ul className="flex space-x-4">
              {navItems.map((item) => (
                (item.roles.includes(currentRole)) && (
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

          {/* Right-side actions (Desktop) */}
          <div className="hidden lg:flex items-center space-x-2">
            {currentUser && (
              <span className="text-sm text-muted-foreground mr-2">
                Logged in as: <span className="font-semibold text-highlight">{currentUser.username} ({currentUser.role})</span>
              </span>
            )}
            <ThemeToggle /> {/* Theme Toggle for desktop */}
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
            {currentUser ? (
              <Button variant="ghost" onClick={logout} className="text-muted-foreground hover:text-highlight" disabled={isLoading}>
                Logout
              </Button>
            ) : (
              <Link to="/login">
                <Button className="bg-highlight hover:bg-purple-700 text-primary-foreground" disabled={isLoading}>
                  Login
                </Button>
              </Link>
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