import React from "react";
import { Link } from "react-router-dom";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { LogOut, Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Sidebar } from "@/components/Sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"; // Import Avatar components

const Header: React.FC = () => {
  const { isAuthenticated, currentUser, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-highlight/20 bg-card">
      <div className="container flex h-16 items-center justify-between py-4">
        <div className="flex items-center space-x-4">
          {/* Mobile Sidebar Toggle */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden">
                <Menu className="h-6 w-6 text-foreground" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 bg-sidebar-background border-r border-sidebar-border p-0">
              <Sidebar />
            </SheetContent>
          </Sheet>

          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-foreground">
              Open<span className="text-highlight">Eyes</span>
            </span>
          </Link>
        </div>

        <div className="flex items-center space-x-4">
          {isAuthenticated && currentUser ? (
            <>
              <span className="text-muted-foreground hidden md:inline">
                Welcome, <span className="font-semibold text-foreground">{currentUser.username}</span>!
              </span>
              <Avatar className="h-8 w-8">
                <AvatarImage src={currentUser.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${currentUser.username}`} alt={currentUser.username} />
                <AvatarFallback>{currentUser.username.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
            </>
          ) : null}
          <ThemeToggle />
          {isAuthenticated ? (
            <Button variant="ghost" size="icon" onClick={logout} className="text-muted-foreground hover:text-destructive">
              <LogOut className="h-5 w-5" />
              <span className="sr-only">Logout</span>
            </Button>
          ) : (
            <Button asChild variant="outline" className="border-highlight text-highlight hover:bg-highlight hover:text-primary-foreground">
              <Link to="/login">Login</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;