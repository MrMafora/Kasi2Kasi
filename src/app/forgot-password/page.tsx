"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Mail, CheckCircle, KeyRound } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!email.trim()) {
            setError("Please enter your email address");
            return;
        }

        setLoading(true);
        try {
            const supabase = createClient();
            const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/login`,
            });
            if (resetError) {
                setError(resetError.message);
            } else {
                setSent(true);
            }
        } catch {
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-kasi-charcoal to-kasi-slate flex flex-col">
            <div className="px-4 pt-10 pb-6">
                <Link href="/login" className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center mb-6 inline-flex">
                    <ArrowLeft className="w-4 h-4 text-white" />
                </Link>
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-kasi-gold/20 rounded-xl flex items-center justify-center">
                        <KeyRound className="w-5 h-5 text-kasi-gold" />
                    </div>
                    <div>
                        <h1 className="text-white text-xl font-bold">Reset Password</h1>
                        <p className="text-white/60 text-xs">We&apos;ll send you a reset link</p>
                    </div>
                </div>
            </div>

            <div className="flex-1 bg-white rounded-t-3xl px-6 pt-8 pb-6">
                {sent ? (
                    <div className="text-center py-8">
                        <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="w-8 h-8 text-emerald-500" />
                        </div>
                        <h2 className="text-lg font-bold text-kasi-charcoal mb-2">Check Your Email</h2>
                        <p className="text-sm text-gray-500 mb-1">
                            We&apos;ve sent a password reset link to
                        </p>
                        <p className="text-sm font-semibold text-kasi-charcoal mb-6">{email}</p>
                        <p className="text-xs text-gray-400 mb-6">
                            Didn&apos;t receive the email? Check your spam folder or try again.
                        </p>
                        <div className="flex flex-col gap-3">
                            <button
                                onClick={() => { setSent(false); setEmail(""); }}
                                className="btn-outline text-sm"
                            >
                                Try a different email
                            </button>
                            <Link href="/login" className="text-sm text-kasi-green font-medium text-center">
                                Back to Sign In
                            </Link>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <p className="text-sm text-gray-500">
                            Enter the email address associated with your account and we&apos;ll send you a link to reset your password.
                        </p>

                        {error && (
                            <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                                <p className="text-sm text-red-600">{error}</p>
                            </div>
                        )}

                        <div>
                            <label className="text-xs font-medium text-gray-600 mb-1 block">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="your@email.com"
                                    className="input-field !pl-10 text-sm"
                                    autoFocus
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60"
                        >
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Sending...
                                </>
                            ) : (
                                "Send Reset Link"
                            )}
                        </button>

                        <p className="text-center text-sm text-gray-500">
                            Remember your password?{" "}
                            <Link href="/login" className="text-kasi-green font-medium">Sign in</Link>
                        </p>
                    </form>
                )}
            </div>
        </div>
    );
}
