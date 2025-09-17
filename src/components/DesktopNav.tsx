import React from "react";
import { NavLink } from "react-router-dom";
import { LayoutDashboard, Swords, ShieldAlert, Landmark, Users, MessageSquareText, Globe, BookOpen, CloudLightning } from "lucide-react"; // Added CloudLightning
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

export const DesktopNav: React.FC = () => {
  const { isAdmin, isModerator, isReporter, isAuthenticated } = useAuth();

  const navItems = [
    {
      name: "Dashboard",
      href: "/",
      icon: <LayoutDashboard className="h-5 w-5" />,
      roles: ["admin", "moderator", "reporter", "user", "guest"],
    },
    {
      name: "Conflicts",
      href: "/conflicts",
      icon: <Swords className="h-5 w-5" />,
      roles: ["admin", "moderator", "reporter", "user", "guest"],
    },
    {
      name: "Natural Disasters", // New item
      href: "/natural-disasters",
      icon: <CloudLightning className="h-5 w-5" />, // New icon
      roles: ["admin", "moderator", "reporter", "user", "guest"],
    },
    {
      name: "Violations",
      href: "/violations",
      icon: <ShieldAlert className="h-5 w-5" />,
      roles: ["admin", "moderator", "reporter", "user", "guest"],
    },
    {
      name: "UN Declarations",
      href: "/un-declarations",
      icon: <Landmark className="h-5 w-5" />,
      roles: ["admin", "moderator", "reporter", "user", "guest"],
    },
    {
      name: "Countries",
      href: "/countries",
      icon: <Globe className="h-5 w-5" />,
      roles: ["admin", "moderator", "reporter", "user", "guest"],
    },
    {
      name: "Forum",
      href: "/forum",
      icon: <MessageSquareText className="h-5 w-5" />,
      roles: ["admin", "moderator", "reporter", "user", "guest"],
    },
    {
      name: "Admin Panel",
      href: "/admin",
      icon: <Users className="h-5 w-5" />,
      roles: ["admin", "moderator"],
    },
    {
      name: "Data Importer",
      href: "/data-import",
      icon: <BookOpen className="h-5 w-5" />,
      roles: ["admin"],
    },
  ];

  const filteredNavItems = navItems.filter(item => {
    if (!isAuthenticated && item.roles.includes("guest")) return true;
    if (isAdmin && item.roles.includes("admin")) return true;
    if (isModerator && item.roles.includes("moderator")) return true;
    if (isReporter && item.roles.includes("reporter")) return true;
    if (isAuthenticated && item.roles.includes("user")) return true;
    return false;
  });

  return (
    <nav className="hidden lg:flex items-center space-x-4">
      {filteredNavItems.map((item) => (
        <NavLink
          key={item.name}
          to={item.href}
          className={({ isActive }) =>
            cn(
              "flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground",
              isActive && "text-highlight" // Highlight active link
            )
          }
        >
          {item.icon}
          {item.name}
        </NavLink>
      ))}
    </nav>
  );
};