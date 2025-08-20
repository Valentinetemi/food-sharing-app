"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";

// Define user type
type User = {
  id: string;
  name: string;
  email: string;
  // Add other user properties as needed
};

// Define context type
type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  requestPasswordReset: (email: string) => Promise<void>;
  resetPassword: (email: string, newPassword: string) => Promise<void>;
};

// Create context with default values
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Check if user is logged in on initial load
  useEffect(() => {
    // In a real app, you would check for a token in localStorage or cookies
    // and validate it with your backend
    const checkUserLoggedIn = async () => {
      try {
        // Simulate checking user session
        const storedUser = localStorage.getItem("foodshare_user");

        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error("Failed to restore user session:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkUserLoggedIn();
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    setIsLoading(true);

    try {
      // In a real app, you would make an API call to your backend
      // For demo purposes, we'll simulate a successful login
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Create a mock user
      const mockUser: User = {
        id: "user_" + Math.random().toString(36).substr(2, 9),
        name: email.split("@")[0], // Use part of email as name for demo
        email,
      };

      // Save user to state and localStorage
      setUser(mockUser);
      localStorage.setItem("foodshare_user", JSON.stringify(mockUser));

      // Redirect to home page
      router.push("/");
    } catch (error) {
      console.error("Login failed:", error);
      throw new Error("Login failed. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  // Signup function
  const signup = async (name: string, email: string, password: string) => {
    setIsLoading(true);

    try {
      // In a real app, you would make an API call to your backend
      // For demo purposes, we'll simulate a successful signup
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Create a new user
      const newUser: User = {
        id: "user_" + Math.random().toString(36).substr(2, 9),
        name,
        email,
      };

      // Save user to state and localStorage
      setUser(newUser);
      localStorage.setItem("foodshare_user", JSON.stringify(newUser));

      // Redirect to home page
      router.push("/");
    } catch (error) {
      console.error("Signup failed:", error);
      throw new Error("Failed to create account. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    // Clear user from state and localStorage
    setUser(null);
    localStorage.removeItem("foodshare_user");

    // Redirect to login page
    router.push("/login");
  };

  // Password reset (demo implementation)
  const requestPasswordReset = async (email: string) => {
    // In a real app, call your backend to send an email with a reset link/token
    await new Promise((r) => setTimeout(r, 800));
    console.info(`Password reset link sent to ${email} (demo)`);
  };

  const resetPassword = async (email: string, newPassword: string) => {
    // In a real app, verify token and update password on backend
    await new Promise((r) => setTimeout(r, 800));

    // If the current stored user matches, update local password (no-op for demo)
    const stored = localStorage.getItem("foodshare_user");
    if (stored) {
      const u = JSON.parse(stored);
      if (u.email === email) {
        // No password stored in demo; just log
        console.info(`Password updated for ${email} (demo)`);
      }
    }
  };

  // Create context value
  const value = {
    user,
    isLoading,
    login,
    signup,
    logout,
    requestPasswordReset,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
