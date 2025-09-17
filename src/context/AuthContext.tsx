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
  title?: string; // New field
  work?: string; // New field
  website?: string; // New field
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

  const fetchUserProfile = async (user: SupabaseUser) => {
    console.log("fetchUserProfile: Starting for user ID:", user.id);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("username, role, avatar_url, status, title, work, website") // Include new fields
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("fetchUserProfile: Error fetching user profile:", error.message);
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
        console.log("fetchUserProfile: User profile set:", { id: user.id, email: user.email || 'N/A', ...data });
      }
    } catch (error) {
      console.error("fetchUserProfile: Unexpected error in fetchUserProfile:", error);
      setCurrentUser(null);
    } finally {
      setIsLoading(false); // Ensure isLoading is set to false after profile fetch attempt
      console.log("fetchUserProfile: isLoading set to false.");
    }
  };

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true); // Start loading state immediately
    console.log("AuthContext useEffect: Initializing, isLoading set to true.");

    const getInitialSession = async () => {
      console.log("AuthContext useEffect: getInitialSession starting.");
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("AuthContext useEffect: Error getting initial session:", error.message);
          logActivity(`Error getting initial session: ${error.message}`, 'error');
          if (isMounted) {
            setCurrentUser(null);
            setIsLoading(false); // Set false if initial session check fails
            console.log("AuthContext useEffect: Initial session error, isLoading set to false.");
          }
          return;
        }

        if (session?.user) {
          console.log("AuthContext useEffect: Initial session found, user:", session.user.email);
          await fetchUserProfile(session.user); // fetchUserProfile will set isLoading(false)
          logActivity(`Initial session found for user: ${session.user.email}`, 'info', session.user.id);
        } else {
          if (isMounted) {
            setCurrentUser(null);
            setIsLoading(false); // Set false if no initial session
            console.log("AuthContext useEffect: No initial session, isLoading set to false.");
          }
          logActivity('No initial active session found', 'info');
        }
      } catch (error) {
        console.error("AuthContext useEffect: Unexpected error in getInitialSession:", error);
        if (isMounted) {
          setCurrentUser(null);
          setIsLoading(false);
          console.log("AuthContext useEffect: Unexpected error in getInitialSession, isLoading set to false.");
        }
      }
    };

    getInitialSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return;
        
        console.log("AuthContext onAuthStateChange: Event:", event, "Session:", session);
        setIsLoading(true); // Set loading true again for any state change
        if (session?.user) {
          console.log("AuthContext onAuthStateChange: Session user found, fetching profile.");
          await fetchUserProfile(session.user); // fetchUserProfile will set isLoading(false)
          logActivity(`Auth state changed to authenticated for user: ${session.user.email}`, 'info', session.user.id);
        } else {
          setCurrentUser(null);
          setIsLoading(false); // Set false if unauthenticated
          console.log("AuthContext onAuthStateChange: No session user, isLoading set to false.");
          logActivity('Auth state changed to unauthenticated', 'info');
        }
      }
    );

    return () => {
      isMounted = false;
      authListener.subscription.unsubscribe();
      console.log("AuthContext useEffect: Cleanup, auth listener unsubscribed.");
    };
  }, []); // Empty dependency array

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    console.log("AuthContext login: Attempting login for:", email);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        toast.error(error.message);
        logActivity(`Login failed for ${email}: ${error.message}`, 'warning');
        setIsLoading(false);
        console.error("AuthContext login: Login error:", error.message);
        return false;
      }
      
      if (data.user) {
        console.log("AuthContext login: User data received, fetching profile.");
        await fetchUserProfile(data.user); // fetchUserProfile will set isLoading(false)
        toast.success("Logged in successfully!");
        logActivity(`User ${email} logged in successfully.`, 'info', data.user.id);
        return true;
      }
      setIsLoading(false);
      console.log("AuthContext login: No user data after sign-in, isLoading set to false.");
      return false;
    } catch (error) {
      console.error("AuthContext login: Unexpected error in login:", error);
      toast.error("An unexpected error occurred during login");
      setIsLoading(false);
      return false;
    }
  };

  const register = async (email: string, password: string, username: string): Promise<boolean> => {
    setIsLoading(true);
    console.log("AuthContext register: Attempting registration for:", email);
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({ 
        email, 
        password,
      });

      if (authError) {
        toast.error(authError.message);
        logActivity(`Registration failed for ${email}: ${authError.message}`, 'warning');
        setIsLoading(false);
        console.error("AuthContext register: Registration error:", authError.message);
        return false;
      }

      if (authData.user) {
        console.log("AuthContext register: User created, attempting profile creation.");
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
          console.error("AuthContext register: Error creating user profile:", profileError.message);
          toast.error(`Registration successful, but failed to create profile: ${profileError.message}. Please try logging in.`);
          logActivity(`Failed to create profile for new user ${email}: ${profileError.message}`, 'error', authData.user.id);
          setIsLoading(false);
          return false;
        }

        await fetchUserProfile(authData.user); // fetchUserProfile will set isLoading(false)
        toast.success("Registration successful! Welcome to OpenEyes.");
        logActivity(`New user registered: ${email} (ID: ${authData.user.id})`, 'info', authData.user.id);
        return true;
      }
      setIsLoading(false);
      console.log("AuthContext register: No user data after sign-up, isLoading set to false.");
      return false;
    } catch (error) {
      console.error("AuthContext register: Unexpected error in register:", error);
      toast.error("An unexpected error occurred during registration");
      setIsLoading(false);
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    setIsLoading(true);
    console.log("AuthContext logout: Attempting logout for user:", currentUser?.email);
    try {
      const userId = currentUser?.id;
      const username = currentUser?.username;
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        toast.error(error.message);
        logActivity(`Logout failed for user ${username}: ${error.message}`, 'error', userId);
        console.error("AuthContext logout: Logout error:", error.message);
      } else {
        setCurrentUser(null);
        toast.info("Logged out.");
        logActivity(`User ${username} logged out.`, 'info', userId);
        console.log("AuthContext logout: User successfully logged out.");
      }
    } catch (error) {
      console.error("AuthContext logout: Unexpected error in logout:", error);
      toast.error("An unexpected error occurred during logout");
    } finally {
      setIsLoading(false);
      console.log("AuthContext logout: isLoading set to false.");
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