"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ArrowRight, AlertCircle } from "lucide-react";
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (step === 1) {
      if (!formData.name || !formData.email || !formData.password) {
        setError("Please fill in all required fields");
        return;
      }
      if (formData.password.length < 6) {
        setError("Password must be at least 6 characters");
        return;
      }
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
    <div className="min-h-screen bg-white flex flex-col">
      {/* Top bar */}
      <div className="p-4">
        <Link href="/" className="flex items-center gap-2 w-fit">
          <Image src="/icons/logo.png" alt="K2K" width={36} height={36} className="rounded-xl" />
          <span className="font-bold text-xl text-kasi-charcoal">Kasi2Kasi</span>
        </Link>
      </div>

      {/* Progress */}
      <div className="px-4 max-w-sm mx-auto w-full">
        <div className="flex gap-2 mb-8">
          <div className={`h-1 flex-1 rounded-full ${step >= 1 ? "bg-kasi-green" : "bg-gray-200"}`} />
          <div className={`h-1 flex-1 rounded-full ${step >= 2 ? "bg-kasi-green" : "bg-gray-200"}`} />
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 flex items-start justify-center px-4 pb-10">
        <div className="w-full max-w-sm">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {step === 1 ? (
            <>
              <h1 className="text-2xl font-bold text-kasi-charcoal mb-2">Create your account</h1>
              <p className="text-gray-500 mb-8">Join the Kasi2Kasi community</p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name *</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g. Thabo Molefe"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number</label>
                  <input
                    type="tel"
                    className="input-field"
                    placeholder="+27 71 234 5678"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address *</label>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Password *</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      className="input-field pr-12"
                      placeholder="Min 6 characters"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2">
                  Continue <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-kasi-charcoal mb-2">Almost done!</h1>
              <p className="text-gray-500 mb-8">Set up your beneficiary for peace of mind</p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Beneficiary Name</label>
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
                  <h3 className="font-medium text-kasi-charcoal text-sm mb-2">By signing up, you agree to:</h3>
                  <ul className="space-y-1.5 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                      <span className="text-kasi-green mt-0.5">✓</span>
                      Kasi2Kasi Terms of Service
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-kasi-green mt-0.5">✓</span>
                      POPIA Privacy Policy
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-kasi-green mt-0.5">✓</span>
                      Each Stokvel&apos;s Digital Constitution (upon joining)
                    </li>
                  </ul>
                </div>

                <div className="flex gap-3">
                  <button type="button" onClick={() => setStep(1)} className="btn-secondary flex-1">
                    Back
                  </button>
                  <button
                    type="submit"
                    className="btn-primary flex-1 flex items-center justify-center gap-2"
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      "Create Account"
                    )}
                  </button>
                </div>
              </form>
            </>
          )}

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-kasi-green font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
