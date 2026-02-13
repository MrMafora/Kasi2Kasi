"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Target, Users, Info } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { createGoalGroup } from "@/lib/database";

export default function NewGoalGroupPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    description: "",
    goal_description: "",
    goal_monthly_target: "",
    max_members: "10",
    goal_recurring: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setError("");
    setLoading(true);

    const { group, error: createError } = await createGoalGroup(user.id, {
      name: form.name,
      description: form.description,
      goal_description: form.goal_description,
      goal_monthly_target: parseFloat(form.goal_monthly_target),
      max_members: parseInt(form.max_members),
      goal_recurring: form.goal_recurring,
    });

    setLoading(false);

    if (createError) {
      setError(createError.message || "Failed to create group");
      return;
    }

    if (group) {
      router.push(`/groups/${group.id}`);
    }
  };

  return (
    <div className="max-w-lg mx-auto pt-6 pb-24 px-4">
      <Link href="/dashboard" className="inline-flex items-center gap-2 text-gray-500 hover:text-kasi-green text-sm mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>

      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
          <Target className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-kasi-charcoal">New Goal Fund</h1>
          <p className="text-gray-500 text-sm">Pool money toward a shared goal</p>
        </div>
      </div>

      <div className="card p-4 mb-6 bg-amber-50 border-amber-200">
        <div className="flex gap-3">
          <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-amber-800">
            <p className="font-semibold mb-1">How Goal Funds work</p>
            <p>Unlike a Stokvel, contributions are flexible — each member can contribute different amounts. The money pools toward your shared goal (medical bills, school fees, etc.) and you track expenses against it.</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="card p-4 mb-6 bg-red-50 border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-kasi-charcoal mb-1.5">Group Name *</label>
          <input
            type="text"
            className="input-field"
            placeholder="e.g. Dad's Dialysis Fund"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-kasi-charcoal mb-1.5">Description</label>
          <textarea
            className="input-field min-h-[80px]"
            placeholder="What is this fund for?"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-kasi-charcoal mb-1.5">Goal Description *</label>
          <input
            type="text"
            className="input-field"
            placeholder="e.g. Monthly dialysis payments for our father"
            value={form.goal_description}
            onChange={(e) => setForm({ ...form, goal_description: e.target.value })}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-kasi-charcoal mb-1.5">Monthly Target Amount (R) *</label>
          <input
            type="number"
            className="input-field"
            placeholder="e.g. 19000"
            value={form.goal_monthly_target}
            onChange={(e) => setForm({ ...form, goal_monthly_target: e.target.value })}
            required
            min="1"
            step="0.01"
          />
          <p className="text-xs text-gray-400 mt-1">The approximate amount needed each month</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-kasi-charcoal mb-1.5">Max Members</label>
          <input
            type="number"
            className="input-field"
            value={form.max_members}
            onChange={(e) => setForm({ ...form, max_members: e.target.value })}
            min="2"
            max="50"
          />
        </div>

        <div className="flex items-center gap-3 p-4 rounded-xl bg-gray-50">
          <input
            type="checkbox"
            id="recurring"
            checked={form.goal_recurring}
            onChange={(e) => setForm({ ...form, goal_recurring: e.target.checked })}
            className="w-4 h-4 rounded border-gray-300 text-kasi-green focus:ring-kasi-green"
          />
          <label htmlFor="recurring" className="text-sm text-kasi-charcoal">
            <span className="font-medium">Recurring monthly goal</span>
            <br />
            <span className="text-gray-500">The target resets each month (e.g. ongoing medical costs)</span>
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          {loading ? "Creating..." : "Create Goal Fund"}
        </button>
      </form>
    </div>
  );
}
