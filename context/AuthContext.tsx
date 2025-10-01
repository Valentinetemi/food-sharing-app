"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

// Define user type
export type User = {
  id: string;
  name: string;
  email: string;
  username?: string;
  avatar_url?: string;
};

// Define context type
export type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  resetPassword: (newPassword: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Subscribe to Supabase auth state
  useEffect(() => {
    const initializeAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser({
          id: user.id,
          name: user.user_metadata.full_name || user.email?.split("@")[0] || "User",
          email: user.email || "",
          username: user.email?.split("@")[0],
          avatar_url: user.user_metadata.avatar_url || "",
        });
      } else {
        setUser(null);
      }
      setIsLoading(false);
    };

    initializeAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        setUser({
          id: session.user.id,
          name: session.user.user_metadata.full_name || session.user.email?.split("@")[0] || "User",
          email: session.user.email || "",
          username: session.user.email?.split("@")[0],
          avatar_url: session.user.user_metadata.avatar_url || "",
        });
        setIsLoading(false);
      } else if (event === "SIGNED_OUT") {
        setUser(null);
        setIsLoading(false);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    }; 
  }, []);

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      throw new Error(error.message || "Failed to sign in");
    }
    router.push("/");
  };

  const signup = async (name: string, email: string, password: string) => {
    try {
      // Step 1: Sign up user in Supabase Auth
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: name }, // store name in user_metadata
        },
      });
  
      if (authError) {
        console.error("Auth signup error:", authError.message);
        throw new Error(authError.message || "Failed to sign up");
      }
  
      const user = data.user;
      if (!user) {
        throw new Error("No user returned from Supabase signup");
      }
  
      
      // Must match RLS: id = auth.uid()
      const { error: dbError } = await supabase
        .from("profiles")
        .upsert(
          {
            id: user.id, // Supabase Auth user ID
            email: user.email,
            name: name || user.email?.split("@")[0] || "User",
          },
          { onConflict: "id" } // avoid duplicate IDs
        );
  
      if (dbError) {
        console.error("Database error saving new user:", dbError.message, dbError.details);
        throw new Error(`Database error saving new user: ${dbError.message}`);
      }
  
      // Step 3: Redirect after signup
      router.push("/");
  
    } catch (error: any) {
      console.error("Signup error:", error.message || error);
      throw error;
    }
  };
  

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw new Error(error.message || "Failed to sign out");
    }
    router.push("/login");
  };

  const requestPasswordReset = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      throw new Error(error.message || "Failed to send reset email");
    }
  };

  const resetPassword = async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      throw new Error(error.message || "Failed to reset password");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        signup,
        logout,
        requestPasswordReset,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}