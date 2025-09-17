import React from "react";
import { Link } from "react-router-dom";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { LogOut, Menu, UserCircle } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Sidebar } from "@/components/Sidebar";
import { DesktopNav } from "@/components/DesktopNav";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton"; // Import Skeleton for loading state
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Header: React.FC = () => {
  const { isAuthenticated, currentUser, logout, isLoading } = useAuth();

  // Add console logs for debugging
  console.log("Header Render - isLoading:", isLoading);
  console.log("Header Render - isAuthenticated:", isAuthenticated);
  console.log("Header Render - currentUser:", currentUser);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-highlight/20 bg-card">
      <div className="container flex h-16 items-center justify-between py-4">
        <div className="flex items-center space-x-4">
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

          <DesktopNav />
        </div>

        <div className="flex items-center space-x-4">
          <ThemeToggle />
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-auto px-2 flex items-center space-x-2 text-muted-foreground hover:text-foreground">
                  {isLoading && !currentUser ? (
                    <Skeleton className="h-8 w-8 rounded-full" />
                  ) : (
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={currentUser?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${currentUser?.username}`} alt={currentUser?.username} />
                      <AvatarFallback>{currentUser?.username?.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                  )}
                  <span className="hidden md:inline font-semibold">
                    {isLoading && !currentUser ? <Skeleton className="h-4 w-20" /> : currentUser?.username}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-card border-highlight/20" align="end" forceMount>
                {isLoading && !currentUser ? (
                  <div className="p-2">
                    <Skeleton className="h-4 w-3/4 mb-1" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                ) : (
                  <>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none text-foreground">{currentUser?.username}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {currentUser?.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-highlight/20" />
                    <DropdownMenuItem asChild className="hover:bg-accent hover:text-accent-foreground">
                      <Link to="/profile" className="flex items-center">
                        <UserCircle className="mr-2 h-4 w-4" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-highlight/20" />
                    <DropdownMenuItem 
                      onClick={logout} 
                      className="text-destructive hover:bg-destructive/20 hover:text-destructive flex items-center"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Log out
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild variant="outline" className="border-highlight text-highlight hover:bg-highlight hover:text-primary-foreground" disabled={isLoading}>
              <Link to="/login">Login</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;