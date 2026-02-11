"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, AlertCircle, Shield, ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><LoadingSpinner message="Loading..." /></div>}>
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const redirect = searchParams.get("redirect") || "/dashboard";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { error } = await signIn(email, password);
      if (error) {
        setError(error.message || "Invalid email or password");
      } else {
        router.push(redirect);
      }
    } catch (err: any) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side — Branding Panel (hidden on mobile) */}
      <div className="hidden md:flex md:w-1/2 gradient-hero relative overflow-hidden items-center justify-center p-12">
        {/* Decorative blobs */}
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-kasi-green/20 rounded-full blur-3xl animate-float" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-kasi-gold/15 rounded-full blur-3xl animate-float" style={{ animationDelay: "1.5s" }} />

        <div className="relative z-10 text-center max-w-sm">
          <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-6 border border-white/10">
            <Shield className="w-8 h-8 text-kasi-gold" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">Welcome Back</h2>
          <p className="text-white/50 leading-relaxed">
            Your community savings are waiting. Sign in to track contributions, manage payouts, and stay connected with your Stokvel.
          </p>
          <div className="mt-10 grid grid-cols-3 gap-4">
            {["Secure", "Transparent", "Community"].map((tag) => (
              <div key={tag} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl py-2 px-3">
                <p className="text-white/70 text-xs font-medium">{tag}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Side — Form */}
      <div className="flex-1 flex flex-col bg-white">
        {/* Top bar */}
        <div className="p-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-gray-400 hover:text-kasi-charcoal transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back</span>
          </Link>
          <Link href="/" className="flex items-center gap-2">
            <Image src="/icons/logo.png" alt="K2K" width={32} height={32} className="rounded-xl" />
            <span className="font-bold text-lg text-kasi-charcoal md:hidden">Kasi2Kasi</span>
          </Link>
        </div>

        {/* Form */}
        <div className="flex-1 flex items-center justify-center px-6 pb-10">
          <div className="w-full max-w-sm animate-slide-up">
            <h1 className="text-2xl font-bold text-kasi-charcoal mb-2">Sign in</h1>
            <p className="text-gray-400 mb-8 text-sm">Enter your credentials to continue</p>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 animate-scale-in">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Email Address</label>
                <input
                  type="email"
                  className="input-field"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">Password</label>
                  <Link href="/forgot-password" className="text-xs text-kasi-green font-medium hover:underline">
                    Forgot?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    className="input-field pr-12"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="btn-primary w-full mt-2 flex items-center justify-center !py-3.5"
                disabled={loading}
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  "Sign In"
                )}
              </button>
            </form>

            <p className="text-center text-sm text-gray-400 mt-8">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="text-kasi-green font-semibold hover:underline">
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
