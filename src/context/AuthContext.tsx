import React, { createContext, useState, useContext, useEffect } from "react";
import { toast } from "sonner";

export type UserRole = "admin" | "moderator" | "reporter" | "user";

interface User {
  username: string;
  role: UserRole;
}

interface AuthContextType {
  currentUser: User | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isModerator: boolean;
  isReporter: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    // Initialize from localStorage if available
    const storedUser = localStorage.getItem("currentUser");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  useEffect(() => {
    // Persist user to localStorage
    if (currentUser) {
      localStorage.setItem("currentUser", JSON.stringify(currentUser));
    } else {
      localStorage.removeItem("currentUser");
    }
  }, [currentUser]);

  const login = (username: string, password: string): boolean => {
    // This is a simulated login. In a real app, you'd call an API.
    if (username === "admin" && password === "admin") {
      const user: User = { username: "admin", role: "admin" };
      setCurrentUser(user);
      toast.success("Logged in as Admin!");
      return true;
    } else if (username === "moderator" && password === "password") {
      const user: User = { username: "moderator", role: "moderator" };
      setCurrentUser(user);
      toast.success("Logged in as Moderator!");
      return true;
    } else if (username === "reporter" && password === "password") {
      const user: User = { username: "reporter", role: "reporter" };
      setCurrentUser(user);
      toast.success("Logged in as Reporter!");
      return true;
    } else if (username === "user" && password === "password") {
      const user: User = { username: "user", role: "user" };
      setCurrentUser(user);
      toast.success("Logged in as User!");
      return true;
    }
    toast.error("Invalid username or password.");
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    toast.info("Logged out.");
  };

  const isAuthenticated = !!currentUser;
  const isAdmin = currentUser?.role === "admin";
  const isModerator = currentUser?.role === "moderator";
  const isReporter = currentUser?.role === "reporter";

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        login,
        logout,
        isAuthenticated,
        isAdmin,
        isModerator,
        isReporter,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};