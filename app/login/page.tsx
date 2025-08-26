"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSignInWithEmailAndPassword } from "react-firebase-hooks/auth";
import { auth } from "@/app/firebase/config";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

export default function LoginPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [SignInUserWithEmailAndPassword, user, loading, firebaseError] =
    useSignInWithEmailAndPassword(auth);

  useEffect(() => {
    if (user) {
      console.log("signIn successful!", user.user);
      toast({
        title: "Welcome back",
        description: `Welcome back ${user.user.displayName || user.user.email}`,
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
      console.log("Firebase Error", firebaseError);
      setError(firebaseError.message || "Failed to signIn");
      setIsLoading(false);
    }
  }, [firebaseError]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // Use the login function from firebase
      const logIn = await SignInUserWithEmailAndPassword(email, password);
      if (email && password) {
        await import("firebase/auth");
        // No need to redirect here as the login function handles it
      } else {
        setError("Please enter both email and password");
        setIsLoading(false);
      }
    } catch (err) {
      setError("Failed to login. Please check your email or password.");
      console.error(err);
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

      {/* Right side - Login form */}
      <div className="flex flex-col justify-center items-center w-full md:w-1/2 p-6 md:p-12">
        <div className="w-full max-w-md">
          {/* Logo and heading */}
          <div className="text-center mb-8">
            <div className="inline-block mb-4">
              <Image
                src="/Image3.png"
                alt="FoodShare Logo"
                width={60}
                height={60}
                className="mx-auto"
              />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Welcome back</h1>
            <p className="text-gray-400">
              Sign in to continue sharing delicious moments
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div className="bg-red-900/30 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* Login form */}
          <form onSubmit={handleSubmit} className="space-y-6">
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
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-white"
                placeholder="you@example.com"
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-300"
                >
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-sm text-orange-500 hover:text-orange-400"
                >
                  Forgot password?
                </Link>
              </div>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-white"
                placeholder="••••••••"
                required
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg transition duration-200 flex items-center justify-center"
            >
              {isLoading ? <>Signing in...</> : "Sign in"}
            </button>
          </form>

          {/* Sign up link */}
          <div className="mt-8 text-center">
            <p className="text-gray-400">
              Don't have an account?{" "}
              <Link
                href="/signup"
                className="text-orange-500 hover:text-orange-400 font-medium"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
