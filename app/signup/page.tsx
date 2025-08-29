"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCreateUserWithEmailAndPassword } from "react-firebase-hooks/auth";
import { auth } from "@/app/firebase/config";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { supabase } from "@/lib/supabase";
export default function SignupPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [createUserWithEmailAndPassword, user, loading, firebaseError] =
    useCreateUserWithEmailAndPassword(auth);

  useEffect(() => {
    if (user) {
      console.log("Signup successful! Redirecting...", user.user);
      toast({
        title: "Account created",
        description: `Welcome ${user.user.displayName || user.user.email}`,
        duration: 3000,
      });
      setTimeout(() => {
        router.push("/");
      }, 100);
    }
  }, [user, router, toast]);
  //to handle firebase errors
  useEffect(() => {
    if (firebaseError) {
      console.error("Firebase error:", firebaseError);
      setError(firebaseError.message || "Failed to create account");
      setIsLoading(false);
    }
  }, [firebaseError]);

  const validateForm = () => {
    setError("");

    if (!name || !email || !password || !confirmPassword) {
      setError("All fields are required");
      return false;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return false;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Create account with Firebase
      const userCredential = await createUserWithEmailAndPassword(
        email,
        password
      );
      // Optional: set displayName so it appears in your app
      if (userCredential?.user && name) {
        try {
          const { updateProfile } = await import("firebase/auth");
          await updateProfile(userCredential.user, { displayName: name });
          console.log("displayName updated successfully", name);
        } catch (error) {
          setError("Please enter both email and password");
          console.error("Error updating display profile:", error);
        }
      }

      if (!userCredential?.user) {
        setIsLoading(false);
        setError("Failed to create account");
        return;
      }
      console.log(userCredential.user);

      async function syncUserWithSupabase(user: any) {
        try {
          const { uid, email, displayName } = user;
          const { data, error } = await supabase.from("users").upsert([
            {
              firebase_uid: uid,
              email,
              name: displayName || null,
              created_at: new Date().toISOString(),
            },
          ]);
          if (error) {
            console.error("Supabase sync error", error);
    
            // Just log it for debugging
            console.warn(
              "User account created but Supabase sync failed:",
              error.message
            );
          } else {
            console.log("User synced with Supabase successfully", data);
          }
        } catch (syncError) {
          console.error("Unexpected error during Supabase sync:", syncError);
          // Don't fail the signup process for Supabase sync issues
        }
      }

      await syncUserWithSupabase(userCredential.user);
      setIsLoading(false);
    } catch (error: any) {
      console.error("Error creating account:", error);
      setError(error.message || "Failed to create account");
      setIsLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-gray-950 flex flex-col md:flex-row">
      {/* Left side - Image (hidden on mobile) */}

      <div className="hidden md:flex md:w-1/2 bg-gray-950 items-center justify-center p-8">
        <div className="flex items-center justify-center gap- w-full max-w-2xl">
          {/* First phone mockup*/}
          <div className="relative w-[220px] md:w-[280px] lg:w-[360px] xl:w-[400px] aspect-[9/16] rounded-3xl overflow-hidden shadow-2xl border border-gray-950">
            <Image
              src="/Image2.png"
              alt="FoodShare App"
              fill
              className="object-cover"
              priority
            />
          </div>
          {/*2nd phone mockup*/}
          <div className="relative w-[220px] md:w-[280px] lg:w-[360px] xl:w-[400px] aspect-[9/16] rounded-3xl overflow-hidden shadow-2xl border border-gray-950">
            <Image
              src="/Image4.png"
              alt="FoodShare App"
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>
      </div>

      {/* Right side - Signup form */}
      <div className="flex flex-col justify-center items-center w-full md:w-1/2 p-6 md:p-12">
        <div className="w-full max-w-md">
          {/* Logo and heading */}
          <div className="text-center mb-6">
            <div className="inline-block mb-3">
              <Image
                src="/favicon.ico"
                alt="FoodShare Logo"
                width={60}
                height={60}
                className="mx-auto"
                priority
              />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              Welcome To FoodShare
            </h1>
            <p className="text-gray-200 text-sm">
              Share your culinary moment with friends and food enthusiasts
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div className="bg-red-900/30 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* Signup form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="name"
                className="block  font-medium text-gray-300 mb-1"
              >
                Full Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:ring-orange-500 focus:border-orange-500 text-white"
                placeholder="Enter Your FullName  "
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:ring-orange-500 focus:border-orange-500 text-white"
                placeholder="Enter Your Email"
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 bg-gray-900 border border-gray-700 rounded-lg focus:ring-orange-500 focus:border-orange-500 text-white"
                  placeholder="••••••••"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-300"
                  onClick={() => setShowPassword((prev) => !prev)}
                >
                  {showPassword ? <FiEye size={20} /> : <FiEyeOff size={20} />}
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Must be at least 8 characters long
              </p>
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 bg-gray-900 border border-gray-700 rounded-lg focus:ring-orange-500 focus:border-orange-500 text-white"
                  placeholder="••••••••"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-300"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                >
                  {showConfirmPassword ? (
                    <FiEye size={20} />
                  ) : (
                    <FiEyeOff size={20} />
                  )}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg transition duration-200 flex items-center justify-center"
              >
                {isLoading ? <>Preparing Your Journey...</> : "Create account"}
              </button>
            </div>
          </form>

          {/* Sign in link */}
          <div className="mt-6 text-center">
            <p className="text-gray-400">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-orange-500 hover:text-orange-400 font-medium"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
