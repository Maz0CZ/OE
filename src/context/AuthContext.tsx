import React, { createContext, useState, useContext, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabaseClient";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { logActivity } from "@/utils/logger";

export type UserRole = "admin" | "moderator" | "reporter" | "user" | "guest";

interface UserProfile {
  id: string;
  username: string;
  role: UserRole;
  avatar_url?: string;
  email: string;
  status: "active" | "banned";
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
    const getSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error getting session:", error.message);
          logActivity(`Error getting session: ${error.message}`, 'error');
          setIsLoading(false);
          return;
        }

        if (session?.user) {
          await fetchUserProfile(session.user);
          logActivity(`Session found for user: ${session.user.email}`, 'info', session.user.id);
        } else {
          setCurrentUser(null);
          logActivity('No active session found', 'info');
        }
      } catch (error) {
        console.error("Unexpected error in getSession:", error);
      } finally {
        setIsLoading(false);
      }
    };

    getSession();

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

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (user: SupabaseUser) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("username, role, avatar_url, status")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Error fetching user profile:", error.message);
        logActivity(`Error fetching profile for user ${user.id}: ${error.message}`, 'error', user.id);
        setCurrentUser(null);
        return;
      }

      if (data) {
        setCurrentUser({ 
          id: user.id, 
          email: user.email || 'N/A', 
          ...data 
        });
      }
    } catch (error) {
      console.error("Unexpected error in fetchUserProfile:", error);
      setCurrentUser(null);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
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
    } catch (error) {
      console.error("Unexpected error in login:", error);
      toast.error("An unexpected error occurred during login");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, username: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({ 
        email, 
        password,
      });

      if (authError) {
        toast.error(authError.message);
        logActivity(`Registration failed for ${email}: ${authError.message}`, 'warning');
        return false;
      }

      if (authData.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            username: username,
            email: email,
            role: 'user',
            status: 'active'
          });

        if (profileError) {
          console.error("Error creating user profile:", profileError.message);
          toast.error(`Registration successful, but failed to create profile: ${profileError.message}. Please try logging in.`);
          logActivity(`Failed to create profile for new user ${email}: ${profileError.message}`, 'error', authData.user.id);
          return false;
        }

        await fetchUserProfile(authData.user);
        toast.success("Registration successful! Welcome to OpenEyes.");
        logActivity(`New user registered: ${email} (ID: ${authData.user.id})`, 'info', authData.user.id);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Unexpected error in register:", error);
      toast.error("An unexpected error occurred during registration");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setIsLoading(true);
    try {
      const userId = currentUser?.id;
      const username = currentUser?.username;
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        toast.error(error.message);
        logActivity(`Logout failed for user ${username}: ${error.message}`, 'error', userId);
      } else {
        setCurrentUser(null);
        toast.info("Logged out.");
        logActivity(`User ${username} logged out.`, 'info', userId);
      }
    } catch (error) {
      console.error("Unexpected error in logout:", error);
      toast.error("An unexpected error occurred during logout");
    } finally {
      setIsLoading(false);
    }
  };

  const isAuthenticated = !!currentUser && !isLoading;
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