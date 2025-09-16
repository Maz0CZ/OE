import React, { createContext, useState, useContext, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabaseClient";
import { User as SupabaseUser } from "@supabase/supabase-js";

export type UserRole = "admin" | "moderator" | "reporter" | "user" | "guest";

interface UserProfile {
  id: string;
  username: string;
  role: UserRole;
  avatar_url?: string;
}

interface AuthContextType {
  currentUser: UserProfile | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, username: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isModerator: boolean;
  isReporter: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          await fetchUserProfile(session.user);
        } else {
          setCurrentUser(null);
        }
        setIsLoading(false);
      }
    );

    const getSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (session?.user) {
        await fetchUserProfile(session.user);
      } else {
        setCurrentUser(null);
      }
      setIsLoading(false);
      if (error) console.error("Error getting session:", error.message);
    };

    getSession();

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (user: SupabaseUser) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("username, role, avatar_url")
      .eq("id", user.id)
      .single();

    if (error) {
      console.error("Error fetching user profile:", error.message);
      return;
    }

    if (data) {
      setCurrentUser({ id: user.id, ...data });
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    setIsLoading(false);

    if (error) {
      toast.error(error.message);
      return false;
    }
    if (data.user) {
      await fetchUserProfile(data.user);
      toast.success("Logged in successfully!");
      return true;
    }
    return false;
  };

  const register = async (email: string, password: string, username: string): Promise<boolean> => {
    setIsLoading(true);
    const { data, error } = await supabase.auth.signUp({ 
      email, 
      password,
      options: {
        data: {
          username,
          role: 'user'
        }
      }
    });
    setIsLoading(false);

    if (error) {
      toast.error(error.message);
      return false;
    }

    if (data.user) {
      toast.success("Registration successful! Welcome to OpenEyes.");
      return true;
    }
    return false;
  };

  const logout = async (): Promise<void> => {
    setIsLoading(true);
    const { error } = await supabase.auth.signOut();
    setIsLoading(false);

    if (error) {
      toast.error(error.message);
    } else {
      setCurrentUser(null);
      toast.info("Logged out.");
    }
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
        register,
        logout,
        isAuthenticated,
        isAdmin,
        isModerator,
        isReporter,
        isLoading,
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