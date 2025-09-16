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
  email: string;
  status: "active" | "banned"; // Added status to UserProfile
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
      .select("username, role, avatar_url, status") // Select status as well
      .eq("id", user.id)
      .single();

    if (error) {
      console.error("Error fetching user profile:", error.message);
      logActivity(`Error fetching profile for user ${user.id}: ${error.message}`, 'error', user.id);
      setCurrentUser(null); // Ensure currentUser is null if profile fetch fails
      return;
    }

    if (data) {
      setCurrentUser({ id: user.id, email: user.email || 'N/A', ...data });
    } else {
      setCurrentUser(null); // If no profile data, set current user to null
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
    // First, sign up the user with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({ 
      email, 
      password,
      // Removed options.data as it's for auth.users metadata, not for the profiles table
    });
    setIsLoading(false);

    if (authError) {
      toast.error(authError.message);
      logActivity(`Registration failed for ${email}: ${authError.message}`, 'warning');
      return false;
    }

    if (authData.user) {
      // Explicitly create a profile entry in the 'profiles' table
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          username: username,
          email: email, // Store email in profile for easier access
          role: 'user', // Default role
          status: 'active' // Default status
        });

      if (profileError) {
        console.error("Error creating user profile:", profileError.message);
        toast.error(`Registration successful, but failed to create profile: ${profileError.message}. Please try logging in.`);
        logActivity(`Failed to create profile for new user ${email}: ${profileError.message}`, 'error', authData.user.id);
        // Optionally, you might want to sign out the user if profile creation is critical
        // await supabase.auth.signOut();
        // return false;
      }

      await fetchUserProfile(authData.user);
      toast.success("Registration successful! Welcome to OpenEyes.");
      logActivity(`New user registered: ${email} (ID: ${authData.user.id})`, 'info', authData.user.id);
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