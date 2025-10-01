"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isTokenPresent, setIsTokenPresent] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Check for reset token in URL
  useEffect(() => {
    const accessToken = searchParams.get("access_token");
    const type = searchParams.get("type");
    if (accessToken && type === "recovery") {
      setIsTokenPresent(true);
      // Verify the session
      supabase.auth.getSession().then(({ data: { session }, error }) => {
        if (error || !session) {
          setError("Invalid or expired reset link. Please request a new one.");
          setIsTokenPresent(false);
        }
      });
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);
    setError(null);

    if (!email) {
      setError("Please enter your email.");
      return;
    }

    if (isTokenPresent) {
      // Update password if token is present
      if (!password || !confirmPassword) {
        setError("Please enter both password fields.");
        return;
      }
      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        return;
      }
      if (password.length < 8) {
        setError("Password must be at least 8 characters.");
        return;
      }

      setIsLoading(true);
      try {
        const { error } = await supabase.auth.updateUser({ password });
        if (error) {
          throw error;
        }
        setStatus("Your password has been updated. You can now sign in.");
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      } catch (err: any) {
        setError(err.message || "Unable to reset password. Please try again.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    } else {
      // Send password reset email
      setIsLoading(true);
      try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) {
          throw error;
        }
        setStatus("A password reset link has been sent to your email.");
      } catch (err: any) {
        setError(err.message || "Unable to send reset email. Please try again.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-6 py-10">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0E0E16]/80 p-6 shadow-xl backdrop-blur"
      >
        <h1 className="text-2xl font-bold text-white">
          {isTokenPresent ? "Set New Password" : "Reset Password"}
        </h1>
        <p className="mt-2 text-sm text-white/70">
          {isTokenPresent
            ? "Enter your email and new password."
            : "Enter your email to receive a password reset link."}
        </p>

        {status && (
          <div className="mt-4 rounded-lg border border-emerald-400/20 bg-emerald-500/10 px-3 py-2 text-emerald-200">
            {status}
          </div>
        )}
        {error && (
          <div className="mt-4 rounded-lg border border-red-400/20 bg-red-500/10 px-3 py-2 text-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="email" className="mb-1 block text-sm text-white/80">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-[#111118] px-4 py-3 text-white placeholder-white/40 outline-none transition focus:ring-2 focus:ring-orange-500"
              placeholder="you@example.com"
              required
              disabled={isLoading}
            />
          </div>

          {isTokenPresent && (
            <>
              <div>
                <label
                  htmlFor="password"
                  className="mb-1 block text-sm text-white/80"
                >
                  New password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#111118] px-4 py-3 text-white placeholder-white/40 outline-none transition focus:ring-2 focus:ring-orange-500"
                  placeholder="••••••••"
                  required
                  disabled={isLoading}
                />
                <p className="mt-1 text-xs text-white/50">
                  At least 8 characters.
                </p>
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="mb-1 block text-sm text-white/80"
                >
                  Confirm new password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#111118] px-4 py-3 text-white placeholder-white/40 outline-none transition focus:ring-2 focus:ring-purple-500"
                  placeholder="••••••••"
                  required
                  disabled={isLoading}
                />
              </div>
            </>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isLoading}
            className="w-full rounded-xl bg-gradient-to-r from-orange-500 to-purple-600 px-4 py-3 font-semibold text-white shadow-lg disabled:opacity-60"
          >
            {isLoading
              ? isTokenPresent
                ? "Updating..."
                : "Sending..."
              : isTokenPresent
              ? "Reset Password"
              : "Send Reset Link"}
          </motion.button>
        </form>

        <div className="mt-6 text-center text-sm text-white/70">
          <Link className="text-orange-300 hover:text-orange-200" href="/login">
            Back to sign in
          </Link>
        </div>
      </motion.div>
    </div>
  );
}