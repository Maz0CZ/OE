import React, { createContext, useState, useContext, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabaseClient";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { logActivity } from "@/utils/logger"; // Import the new logger

export type UserRole = "admin" | "moderator" | "reporter" | "user" | "guest";

interface UserProfile {
  id: string;
  username: string;
  role: UserRole;
  avatar_url?: string;
  email: string; // Added email to UserProfile
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
          logActivity(`User authenticated: ${session.user.email}`, 'info', session.user.id);
        } else {
          setCurrentUser(null);
          logActivity('User unauthenticated', 'info');
        }
        setIsLoading(false);
      }
    );

    const getSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (session?.user) {
        await fetchUserProfile(session.user);
        logActivity(`Session found for user: ${session.user.email}`, 'info', session.user.id);
      } else {
        setCurrentUser(null);
        logActivity('No active session found', 'info');
      }
      setIsLoading(false);
      if (error) {
        console.error("Error getting session:", error.message);
        logActivity(`Error getting session: ${error.message}`, 'error');
      }
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
      logActivity(`Error fetching profile for user ${user.id}: ${error.message}`, 'error', user.id);
      return;
    }

    if (data) {
      setCurrentUser({ id: user.id, email: user.email || 'N/A', ...data });
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    setIsLoading(false);

    if (error) {
      toast.error(error.message);
      logActivity(`Login failed for ${email}: ${error.message}`, 'warning');
      return false;
    }
    if (data.user) {
      await fetchUserProfile(data.user);
      toast.success("Logged in successfully!");
      logActivity(`User ${email} logged in successfully.`, 'info', data.user.id);
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
      logActivity(`Registration failed for ${email}: ${error.message}`, 'warning');
      return false;
    }

    if (data.user) {
      // Supabase automatically creates a profile on signup if options.data is used
      // We still need to fetch it to set currentUser correctly
      await fetchUserProfile(data.user);
      toast.success("Registration successful! Welcome to OpenEyes.");
      logActivity(`New user registered: ${email} (ID: ${data.user.id})`, 'info', data.user.id);
      return true;
    }
    return false;
  };

  const logout = async (): Promise<void> => {
    setIsLoading(true);
    const userId = currentUser?.id;
    const username = currentUser?.username;
    const { error } = await supabase.auth.signOut();
    setIsLoading(false);

    if (error) {
      toast.error(error.message);
      logActivity(`Logout failed for user ${username}: ${error.message}`, 'error', userId);
    } else {
      setCurrentUser(null);
      toast.info("Logged out.");
      logActivity(`User ${username} logged out.`, 'info', userId);
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