"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { ArrowLeft, Send, CheckCircle, Mail, MessageSquare, AlertCircle } from "lucide-react";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useAuth } from "@/contexts/AuthContext";

export default function ContactPage() {
    const { user, profile } = useAuth();
    const [formData, setFormData] = useState({
        name: profile?.name || "",
        email: user?.email || "",
        subject: "",
        message: "",
    });
    const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
    const [errorMessage, setErrorMessage] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus("submitting");
        setErrorMessage("");

        try {
            const res = await fetch("/api/email", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    type: "support",
                    userEmail: formData.email,
                    userName: formData.name,
                    subject: formData.subject,
                    message: formData.message,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to send message");
            }

            setStatus("success");
        } catch (err: any) {
            console.error(err);
            setStatus("error");
            setErrorMessage(err.message || "Something went wrong. Please try again.");
        }
    };

    if (status === "success") {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-sm text-center animate-slide-up">
                    <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-8 h-8" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Message Sent!</h1>
                    <p className="text-gray-600 mb-8">
                        Thanks for reaching out, {formData.name}. We&apos;ve received your message and sent a confirmation to <strong>{formData.email}</strong>.
                    </p>
                    <Link href="/dashboard" className="btn-primary w-full flex items-center justify-center">
                        Return to Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <div className="gradient-hero px-4 pt-8 pb-20 relative overflow-hidden">
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-kasi-green/20 rounded-full blur-3xl animate-float" />
                <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-kasi-gold/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "1.5s" }} />

                <div className="max-w-2xl mx-auto relative z-10">
                    <div className="flex items-center gap-4 mb-8">
                        <Link href="/" className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center text-white hover:bg-white/20 transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div className="flex items-center gap-2">
                            <Image src="/icons/logo.png" alt="K2K" width={32} height={32} className="rounded-lg" />
                            <span className="font-bold text-lg text-white">Kasi2Kasi</span>
                        </div>
                    </div>

                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 animate-slide-up">Get in Touch</h1>
                    <p className="text-white/60 text-lg animate-slide-up" style={{ animationDelay: "0.1s" }}>
                        Have a question about Kasi2Kasi? We&apos;re here to help you get the most out of your Stokvel.
                    </p>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-2xl mx-auto px-4 -mt-10 relative z-20 pb-20 animate-slide-up" style={{ animationDelay: "0.2s" }}>
                <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-6 md:p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {status === "error" && (
                            <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex items-start gap-3 text-red-700 text-sm">
                                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                <p>{errorMessage}</p>
                            </div>
                        )}

                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Your Name</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        className="input-field pl-10"
                                        placeholder="e.g. Winston Mafora"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                    />
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                        <div className="w-5 h-5 bg-gray-200 rounded-full" /> {/* Avatar placeholder */}
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                                <div className="relative">
                                    <input
                                        type="email"
                                        className="input-field pl-10"
                                        placeholder="you@example.com"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        required
                                    />
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                            <select
                                className="input-field appearance-none"
                                value={formData.subject}
                                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                required
                            >
                                <option value="" disabled>Select a topic...</option>
                                <option value="Account Support">Account Support</option>
                                <option value="Payment Issue">Payment / Payout Issue</option>
                                <option value="Feature Request">Feature Request</option>
                                <option value="Report a Bug">Report a Bug</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                            <div className="relative">
                                <textarea
                                    className="input-field pl-10 h-32 resize-none"
                                    placeholder="How can we help you?"
                                    value={formData.message}
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                    required
                                />
                                <MessageSquare className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                            </div>
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={status === "submitting"}
                                className="btn-primary w-full flex items-center justify-center gap-2"
                            >
                                {status === "submitting" ? (
                                    <LoadingSpinner message="Sending..." />
                                ) : (
                                    <>
                                        Send Message <Send className="w-4 h-4" />
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Contact Info */}
                <div className="mt-12 grid md:grid-cols-2 gap-6">
                    <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 text-center">
                        <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center mx-auto mb-4 text-kasi-green">
                            <Mail className="w-6 h-6" />
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-1">Email Us Directly</h3>
                        <p className="text-sm text-gray-500 mb-4">We usually respond within 24 hours</p>
                        <a href="mailto:support@kasi2kasi.co.za" className="text-kasi-green font-medium hover:underline">
                            support@kasi2kasi.co.za
                        </a>
                    </div>

                    <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 text-center">
                        <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center mx-auto mb-4 text-kasi-gold">
                            <MessageSquare className="w-6 h-6" />
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-1">Live Chat</h3>
                        <p className="text-sm text-gray-500 mb-4">Coming soon to the dashboard</p>
                        <span className="px-3 py-1 bg-gray-200 text-gray-600 text-xs font-medium rounded-full">
                            Unavailable
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
