"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Users, ArrowRight, AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { createGroup } from "@/lib/database";

export default function CreateGroupPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    contribution: "",
    frequency: "monthly" as "weekly" | "monthly",
    maxMembers: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (step < 2) {
      if (!formData.name || !formData.maxMembers) {
        setError("Please fill in all required fields");
        return;
      }
      setStep(step + 1);
    } else {
      if (!formData.contribution) {
        setError("Please set a contribution amount");
        return;
      }
      if (!user) {
        setError("You must be logged in");
        return;
      }

      setLoading(true);
      try {
        const { group, error: createError } = await createGroup(user.id, {
          name: formData.name,
          description: formData.description,
          contribution_amount: Number(formData.contribution),
          frequency: formData.frequency,
          max_members: Number(formData.maxMembers),
        });

        if (createError) {
          setError(createError.message || "Failed to create group");
        } else if (group) {
          router.push(`/groups/${group.id}`);
        }
      } catch (err: any) {
        setError("Something went wrong. Please try again.");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4 pt-10">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/groups" className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
          <ArrowLeft className="w-4 h-4 text-gray-600" />
        </Link>
        <h1 className="text-xl font-bold text-kasi-charcoal">Create Stokvel</h1>
      </div>

      <div className="flex gap-2 mb-8">
        <div className={`h-1 flex-1 rounded-full ${step >= 1 ? "bg-kasi-green" : "bg-gray-200"}`} />
        <div className={`h-1 flex-1 rounded-full ${step >= 2 ? "bg-kasi-green" : "bg-gray-200"}`} />
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-kasi-charcoal mb-1">Group Details</h2>
            <p className="text-sm text-gray-500 mb-4">Name your Stokvel and set the basics</p>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Group Name *</label>
              <input
                type="text"
                className="input-field"
                placeholder='e.g. "Legacy Builders"'
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
              <textarea
                className="input-field min-h-[80px] resize-none"
                placeholder="What is this Stokvel for?"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Max Members *</label>
              <input
                type="number"
                className="input-field"
                placeholder="e.g. 10"
                value={formData.maxMembers}
                onChange={(e) => setFormData({ ...formData, maxMembers: e.target.value })}
                min={2}
                max={50}
                required
              />
            </div>

            <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2">
              Continue <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-kasi-charcoal mb-1">Financial Setup</h2>
            <p className="text-sm text-gray-500 mb-4">Set your contribution and frequency</p>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Contribution Amount (R) *</label>
              <input
                type="number"
                className="input-field"
                placeholder="e.g. 1000"
                value={formData.contribution}
                onChange={(e) => setFormData({ ...formData, contribution: e.target.value })}
                min={50}
                step={50}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Frequency</label>
              <div className="grid grid-cols-2 gap-3">
                {(["weekly", "monthly"] as const).map((freq) => (
                  <button
                    key={freq}
                    type="button"
                    onClick={() => setFormData({ ...formData, frequency: freq })}
                    className={`py-3 rounded-xl text-sm font-medium border-2 transition-all capitalize ${
                      formData.frequency === freq
                        ? "border-kasi-green bg-kasi-green/5 text-kasi-green"
                        : "border-gray-200 text-gray-500"
                    }`}
                  >
                    {freq}
                  </button>
                ))}
              </div>
            </div>

            {formData.contribution && formData.maxMembers && (
              <div className="bg-kasi-green/5 rounded-xl p-4 border border-kasi-green/10">
                <h3 className="text-sm font-medium text-kasi-charcoal mb-2">Summary</h3>
                <div className="space-y-1 text-xs text-gray-600">
                  <p>• {formData.maxMembers} members × R{formData.contribution} = <strong>R{Number(formData.maxMembers) * Number(formData.contribution)}</strong> per payout</p>
                  <p>• Cycle length: <strong>{formData.maxMembers} {formData.frequency === "monthly" ? "months" : "weeks"}</strong></p>
                  <p>• You will be assigned as <strong>Chairperson</strong></p>
                </div>
              </div>
            )}

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
                  <><Users className="w-4 h-4" /> Create Group</>
                )}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
