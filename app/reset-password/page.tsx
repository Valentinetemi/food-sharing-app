"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";

export default function ResetPasswordPage() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);
    setError(null);

    if (!email || !password || !confirmPassword) {
      setError("Please fill in all fields.");
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
      await resetPassword(email, password);
      setStatus("Your password has been updated. You can now sign in.");
    } catch (err) {
      setError("Unable to reset password. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
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
        <h1 className="text-2xl font-bold text-white">Reset password</h1>
        <p className="mt-2 text-sm text-white/70">
          Enter your email and new password.
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
            <p className="mt-1 text-xs text-white/50">At least 8 characters.</p>
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

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isLoading}
            className="w-full rounded-xl bg-gradient-to-r from-orange-500 to-purple-600 px-4 py-3 font-semibold text-white shadow-lg disabled:opacity-60"
          >
            {isLoading ? "Updating..." : "Reset password"}
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
