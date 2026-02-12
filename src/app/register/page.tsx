"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ArrowRight, AlertCircle, ArrowLeft, Users, CheckCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function RegisterPage() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
    beneficiary: "",
  });

  // Password strength
  const hasLength = formData.password.length >= 8;
  const hasUpper = /[A-Z]/.test(formData.password);
  const hasNumber = /[0-9]/.test(formData.password);
  const passwordStrength = [hasLength, hasUpper, hasNumber].filter(Boolean).length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (step === 1) {
      if (!formData.name || !formData.email || !formData.password) {
        setError("Please fill in all required fields");
        return;
      }
      if (!hasLength) { setError("Password must be at least 8 characters"); return; }
      if (!hasUpper) { setError("Password must contain at least one uppercase letter"); return; }
      if (!hasNumber) { setError("Password must contain at least one number"); return; }
      setStep(2);
    } else {
      setLoading(true);
      try {
        const { error } = await signUp(formData.email, formData.password, {
          name: formData.name,
          phone: formData.phone,
          beneficiary: formData.beneficiary || undefined,
        });

        if (error) {
          setError(error.message || "Failed to create account");
        } else {
          try {
            await fetch("/api/email", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                type: "welcome",
                to: formData.email,
                name: formData.name,
              }),
            });
          } catch (err) {
            console.error("Failed to send welcome email:", err);
          }
          router.push("/dashboard");
        }
      } catch (err: any) {
        setError("Something went wrong. Please try again.");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side — Branding Panel (hidden on mobile) */}
      <div className="hidden md:flex md:w-1/2 gradient-hero relative overflow-hidden items-center justify-center p-12">
        <div className="absolute -top-20 -left-20 w-72 h-72 bg-kasi-gold/15 rounded-full blur-3xl animate-float" />
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-kasi-green/20 rounded-full blur-3xl animate-float" style={{ animationDelay: "1.5s" }} />

        <div className="relative z-10 text-center max-w-sm">
          <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-6 border border-white/10">
            <Users className="w-8 h-8 text-kasi-gold" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">Join the Movement</h2>
          <p className="text-white/50 leading-relaxed">
            Thousands of South Africans are already saving smarter with digital Stokvels. Create your account and start building financial resilience together.
          </p>
          <div className="mt-10 space-y-3">
            {["Track every Rand", "Automated payout rotation", "Democratic group governance"].map((item) => (
              <div key={item} className="flex items-center gap-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl py-3 px-4">
                <CheckCircle className="w-4 h-4 text-kasi-gold flex-shrink-0" />
                <p className="text-white/70 text-sm">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Side — Form */}
      <div className="flex-1 flex flex-col bg-white">
        {/* Top bar */}
        <div className="p-4 flex items-center justify-between">
          <button onClick={() => step === 2 ? setStep(1) : router.push("/")} className="flex items-center gap-2 text-gray-400 hover:text-kasi-charcoal transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">{step === 2 ? "Back" : "Home"}</span>
          </button>
          <Link href="/" className="flex items-center gap-2">
            <Image src="/icons/logo.png" alt="K2K" width={32} height={32} className="rounded-xl" />
          </Link>
        </div>

        {/* Progress */}
        <div className="px-6 max-w-sm mx-auto w-full">
          <div className="flex gap-2 mb-2">
            <div className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${step >= 1 ? "bg-kasi-green" : "bg-gray-200"}`} />
            <div className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${step >= 2 ? "bg-kasi-green" : "bg-gray-200"}`} />
          </div>
          <p className="text-xs text-gray-400 text-right mb-6">Step {step} of 2</p>
        </div>

        {/* Form */}
        <div className="flex-1 flex items-start justify-center px-6 pb-10">
          <div className="w-full max-w-sm animate-slide-up" key={step}>
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 animate-scale-in">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {step === 1 ? (
              <>
                <h1 className="text-2xl font-bold text-kasi-charcoal mb-2">Create your account</h1>
                <p className="text-gray-400 mb-8 text-sm">Join the Kasi2Kasi community</p>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Full Name *</label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="e.g. Winston Mafora"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Phone Number</label>
                    <input
                      type="tel"
                      className="input-field"
                      placeholder="+27 71 234 5678"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Email Address *</label>
                    <input
                      type="email"
                      className="input-field"
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Password *</label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        className="input-field pr-12"
                        placeholder="Min 8 characters"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required
                        minLength={8}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {/* Password strength indicator */}
                    {formData.password.length > 0 && (
                      <div className="mt-2 space-y-1.5 animate-fade-in">
                        <div className="flex gap-1">
                          {[1, 2, 3].map((level) => (
                            <div
                              key={level}
                              className={`h-1 flex-1 rounded-full transition-all duration-300 ${passwordStrength >= level
                                ? passwordStrength === 3 ? "bg-emerald-500" : passwordStrength === 2 ? "bg-amber-500" : "bg-red-400"
                                : "bg-gray-200"
                                }`}
                            />
                          ))}
                        </div>
                        <div className="flex flex-wrap gap-x-3 gap-y-0.5">
                          {[
                            { check: hasLength, label: "8+ chars" },
                            { check: hasUpper, label: "Uppercase" },
                            { check: hasNumber, label: "Number" },
                          ].map((req) => (
                            <span key={req.label} className={`text-[10px] font-medium transition-colors ${req.check ? "text-emerald-600" : "text-gray-400"}`}>
                              {req.check ? "✓" : "○"} {req.label}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2 !py-3.5">
                    Continue <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              </>
            ) : (
              <>
                <h1 className="text-2xl font-bold text-kasi-charcoal mb-2">Almost done!</h1>
                <p className="text-gray-400 mb-8 text-sm">Set up your beneficiary for peace of mind</p>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Beneficiary Name</label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="Who should inherit your Stokvel position?"
                      value={formData.beneficiary}
                      onChange={(e) => setFormData({ ...formData, beneficiary: e.target.value })}
                    />
                    <p className="text-xs text-gray-400 mt-1.5">
                      This person will be contacted if you can no longer participate in a Stokvel.
                    </p>
                  </div>

                  <div className="bg-kasi-green/5 rounded-xl p-4 border border-kasi-green/10">
                    <h3 className="font-medium text-kasi-charcoal text-sm mb-3">By signing up, you agree to:</h3>
                    <ul className="space-y-2 text-sm text-gray-600">
                      {[
                        "Kasi2Kasi Terms of Service",
                        "POPIA Privacy Policy",
                        "Each Stokvel's Digital Constitution (upon joining)",
                      ].map((item) => (
                        <li key={item} className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-kasi-green mt-0.5 flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    type="submit"
                    className="btn-primary w-full flex items-center justify-center gap-2 !py-3.5"
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      "Create Account"
                    )}
                  </button>
                </form>
              </>
            )}

            <p className="text-center text-sm text-gray-400 mt-8">
              Already have an account?{" "}
              <Link href="/login" className="text-kasi-green font-semibold hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
