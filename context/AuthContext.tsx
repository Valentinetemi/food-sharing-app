"use client";

import React, { createContext, useContext, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuthState } from "react-firebase-hooks/auth";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  setPersistence,
  browserLocalPersistence,
  sendPasswordResetEmail,
  updatePassword,
} from "firebase/auth";
import { auth } from "@/app/firebase/config";

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
  resetPassword: (email: string, newPassword: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();

  // Ensure session persists across reloads
  React.useEffect(() => {
    setPersistence(auth, browserLocalPersistence).catch(console.error);
  }, []);

  // Subscribe to Firebase auth state
  const [fbUser, loading] = useAuthState(auth);

  const user: User | null = fbUser
    ? {
        id: fbUser.uid,
        name: fbUser.displayName ?? fbUser.email?.split("@")[0] ?? "User",
        email: fbUser.email ?? "",
      }
    : null;

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
    router.push("/");
  };

  const signup = async (name: string, email: string, password: string) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    if (cred.user && name) {
      await updateProfile(cred.user, { displayName: name });
    }
    router.push("/");
  };

  const logout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  const requestPasswordReset = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const resetPassword = async (email: string, newPassword: string) => {
    if (!auth.currentUser || auth.currentUser.email !== email) {
      throw new Error("No authenticated user or email mismatch");
    }
    await updatePassword(auth.currentUser, newPassword);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading: loading,
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
