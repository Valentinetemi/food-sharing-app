"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";

export default function ForgotPasswordPage() {
  const { requestPasswordReset } = useAuth();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);
    setError(null);
    if (!email) return;
    setIsLoading(true);
    try {
      await requestPasswordReset(email);
      setStatus("If an account exists for this email, a reset link has been sent.");
    } catch (err) {
      setError("Unable to send reset link. Please try again.");
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
        <h1 className="text-2xl font-bold text-white">Forgot password</h1>
        <p className="mt-2 text-sm text-white/70">
          Enter your email and we will send you a link to reset your password.
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

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isLoading}
            className="w-full rounded-xl bg-gradient-to-r from-orange-500 to-purple-600 px-4 py-3 font-semibold text-white shadow-lg disabled:opacity-60"
          >
            {isLoading ? "Sending..." : "Send reset link"}
          </motion.button>
        </form>

        <div className="mt-6 text-center text-sm text-white/70">
          Remembered your password? {" "}
          <Link className="text-orange-300 hover:text-orange-200" href="/login">
            Sign in
          </Link>
        </div>
      </motion.div>
    </div>
  );
}