import React, { createContext, useState, useContext, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabaseClient"; // Import Supabase client
import { User as SupabaseUser } from "@supabase/supabase-js";

export type UserRole = "admin" | "moderator" | "reporter" | "user" | "guest";

interface UserProfile {
  id: string;
  username: string;
  role: UserRole;
  avatar_url?: string; // Added avatar_url
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

    // Initial check for session
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
      .select("username, role, avatar_url") // Select avatar_url
      .eq("id", user.id)
      .single();

    if (error) {
      console.error("Error fetching user profile:", error.message);
      // If profile not found, create a default one (e.g., for new registrations)
      if (error.code === "PGRST116") { // No rows found
        const defaultProfile: UserProfile = {
          id: user.id,
          username: user.email?.split("@")[0] || "New User",
          role: "user",
          avatar_url: undefined, // Default avatar_url
        };
        const { error: insertError } = await supabase.from("profiles").insert({
          id: user.id,
          username: defaultProfile.username,
          role: defaultProfile.role,
          avatar_url: defaultProfile.avatar_url,
        });
        if (insertError) {
          console.error("Error creating default profile:", insertError.message);
          toast.error("Failed to create user profile.");
          setCurrentUser(null);
          return;
        }
        setCurrentUser(defaultProfile);
        toast.success(`Welcome, ${defaultProfile.username}!`);
        return;
      }
      setCurrentUser(null);
      return;
    }

    if (data) {
      setCurrentUser({ id: user.id, ...data });
    } else {
      setCurrentUser(null);
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
    const { data, error } = await supabase.auth.signUp({ email, password });
    setIsLoading(false);

    if (error) {
      toast.error(error.message);
      return false;
    }

    if (data.user) {
      // Insert into profiles table
      const { error: profileError } = await supabase.from("profiles").insert({
        id: data.user.id,
        username: username,
        role: "user", // Default role for new registrations
        avatar_url: null, // Default avatar_url
      });

      if (profileError) {
        console.error("Error creating user profile:", profileError.message);
        toast.error("Registration successful, but failed to create user profile. Please contact support.");
        // Optionally, you might want to delete the auth user here if profile creation fails
        // await supabase.auth.admin.deleteUser(data.user.id); // This would require admin privileges or a server function
        return false;
      }

      await fetchUserProfile(data.user);
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