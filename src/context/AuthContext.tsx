import React, { createContext, useState, useContext, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabaseClient";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { useNavigate } from "react-router-dom";

export type UserRole = "admin" | "moderator" | "reporter" | "user" | "guest";

interface UserProfile {
  id: string;
  username: string;
  role: UserRole;
  avatar_url?: string;
  email?: string;
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
  const navigate = useNavigate();

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          await fetchUserProfile(session.user);
          navigate('/');
        } else if (event === 'SIGNED_OUT') {
          setCurrentUser(null);
          navigate('/login');
        }
        setIsLoading(false);
      }
    );

    const getSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (session?.user) {
        await fetchUserProfile(session.user);
      }
      setIsLoading(false);
    };

    getSession();

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate]);

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

    setCurrentUser({ 
      id: user.id, 
      email: user.email,
      ...data 
    });
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      return !!data.user;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Login failed');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, username: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: { username, role: 'user' }
        }
      });
      if (error) throw error;
      toast.success("Registration successful! Please check your email for confirmation.");
      return !!data.user;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Registration failed');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success("Logged out successfully");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Logout failed');
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    currentUser,
    login,
    register,
    logout,
    isAuthenticated: !!currentUser,
    isAdmin: currentUser?.role === "admin",
    isModerator: currentUser?.role === "moderator",
    isReporter: currentUser?.role === "reporter",
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};