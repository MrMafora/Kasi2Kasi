"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Users, ArrowRight } from "lucide-react";

export default function CreateGroupPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    contribution: "",
    frequency: "monthly",
    maxMembers: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 2) {
      setStep(step + 1);
    } else {
      // Mock creation
      router.push("/groups/g1");
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4 pt-10">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/groups" className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
          <ArrowLeft className="w-4 h-4 text-gray-600" />
        </Link>
        <h1 className="text-xl font-bold text-kasi-charcoal">Create Stokvel</h1>
      </div>

      {/* Progress */}
      <div className="flex gap-2 mb-8">
        <div className={`h-1 flex-1 rounded-full ${step >= 1 ? "bg-kasi-green" : "bg-gray-200"}`} />
        <div className={`h-1 flex-1 rounded-full ${step >= 2 ? "bg-kasi-green" : "bg-gray-200"}`} />
      </div>

      <form onSubmit={handleSubmit}>
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-kasi-charcoal mb-1">Group Details</h2>
            <p className="text-sm text-gray-500 mb-4">Name your Stokvel and set the basics</p>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Group Name</label>
              <input
                type="text"
                className="input-field"
                placeholder='e.g. "Legacy Builders"'
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Max Members</label>
              <input
                type="number"
                className="input-field"
                placeholder="e.g. 10"
                value={formData.maxMembers}
                onChange={(e) => setFormData({ ...formData, maxMembers: e.target.value })}
                min={2}
                max={50}
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
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Contribution Amount (R)</label>
              <input
                type="number"
                className="input-field"
                placeholder="e.g. 1000"
                value={formData.contribution}
                onChange={(e) => setFormData({ ...formData, contribution: e.target.value })}
                min={50}
                step={50}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Frequency</label>
              <div className="grid grid-cols-2 gap-3">
                {["weekly", "monthly"].map((freq) => (
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
              <button type="submit" className="btn-primary flex-1 flex items-center justify-center gap-2">
                <Users className="w-4 h-4" /> Create Group
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
