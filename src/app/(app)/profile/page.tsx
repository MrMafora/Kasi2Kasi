"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Shield, Award, ChevronRight,
  LogOut, Settings, Heart, Clock
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getMyGroups } from "@/lib/database";
import {
  formatCurrency, getScoreColor, getScoreLabel,
} from "@/lib/types";
import type { GroupWithDetails } from "@/lib/types";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function ProfilePage() {
  const { user, profile, loading: authLoading, signOut } = useAuth();
  const router = useRouter();
  const [groups, setGroups] = useState<GroupWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!user) return;
      try {
        const data = await getMyGroups(user.id);
        setGroups(data);
      } catch (err) {
        console.error("Failed to load profile data:", err);
      } finally {
        setLoading(false);
      }
    }
    if (!authLoading) loadData();
  }, [user, authLoading]);

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  if (authLoading || loading) {
    return (
      <div className="max-w-lg mx-auto pt-20">
        <LoadingSpinner message="Loading profile..." />
      </div>
    );
  }

  const totalContributed = groups.reduce((s, g) => s + (g.my_membership?.lifetime_contributed || 0), 0);
  const totalReceived = groups.reduce((s, g) => s + (g.my_membership?.lifetime_received || 0), 0);
  const totalCycles = groups.reduce((s, g) => s + (g.my_membership?.cycles_completed || 0), 0);
  const avgScore = groups.length > 0
    ? Math.round(groups.reduce((s, g) => s + (g.my_membership?.commitment_score || 0), 0) / groups.length)
    : 0;

  return (
    <div className="max-w-lg mx-auto px-4 pt-12">
      {/* Profile Header */}
      <div className="text-center mb-6">
        <div className="w-20 h-20 bg-kasi-green/10 rounded-full flex items-center justify-center mx-auto mb-3">
          <span className="text-kasi-green font-bold text-2xl">{profile?.avatar_initials || "?"}</span>
        </div>
        <h1 className="text-xl font-bold text-kasi-charcoal">{profile?.name || "User"}</h1>
        <p className="text-gray-500 text-sm">{profile?.phone || profile?.email || ""}</p>
        <p className="text-gray-400 text-xs mt-1">
          Member since {profile?.created_at ? new Date(profile.created_at).toLocaleDateString("en-ZA") : ""}
        </p>
      </div>

      {/* Commitment Score Ring */}
      {groups.length > 0 && (
        <div className="card mb-4">
          <div className="flex items-center gap-4">
            <div className="relative w-20 h-20 flex-shrink-0">
              <svg className="w-20 h-20 progress-ring" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="34" fill="none" stroke="#e5e7eb" strokeWidth="5" />
                <circle
                  cx="40" cy="40" r="34"
                  fill="none"
                  stroke={avgScore >= 90 ? "#10b981" : avgScore >= 70 ? "#f59e0b" : "#ef4444"}
                  strokeWidth="5"
                  strokeDasharray={`${(avgScore / 100) * 213.63} 213.63`}
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-lg font-bold">
                {avgScore}
              </span>
            </div>
            <div>
              <h3 className="font-semibold text-kasi-charcoal">Commitment Score</h3>
              <p className={`text-sm font-medium ${getScoreColor(avgScore)}`}>
                {getScoreLabel(avgScore)}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Average across {groups.length} Stokvel{groups.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Financial Passport */}
      <div className="card mb-4">
        <div className="flex items-center gap-2 mb-4">
          <Award className="w-5 h-5 text-kasi-gold" />
          <h2 className="font-semibold text-kasi-charcoal">Financial Passport</h2>
        </div>

        <div className="bg-gradient-to-br from-kasi-charcoal to-kasi-slate rounded-2xl p-5 text-white">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Image src="/icons/logo.png" alt="K2K" width={32} height={32} className="rounded-lg" />
              <span className="font-semibold text-sm">Kasi2Kasi</span>
            </div>
            <Shield className="w-5 h-5 text-kasi-gold" />
          </div>

          <p className="text-white/60 text-xs mb-1">Total Orchestrated</p>
          <p className="text-2xl font-bold mb-4">{formatCurrency(totalContributed + totalReceived)}</p>

          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-white/10">
            <div>
              <p className="text-white/50 text-[10px]">Contributed</p>
              <p className="font-semibold text-sm">{formatCurrency(totalContributed)}</p>
            </div>
            <div>
              <p className="text-white/50 text-[10px]">Received</p>
              <p className="font-semibold text-sm text-kasi-gold">{formatCurrency(totalReceived)}</p>
            </div>
            <div>
              <p className="text-white/50 text-[10px]">Cycles</p>
              <p className="font-semibold text-sm">{totalCycles}</p>
            </div>
          </div>
        </div>

        {groups.length > 0 && (
          <p className="text-xs text-gray-400 text-center mt-3">
            You have successfully completed {totalCycles} cycle{totalCycles !== 1 ? "s" : ""} and orchestrated{" "}
            {formatCurrency(totalContributed + totalReceived)} through your Kasi2Kasi Stokvels.
          </p>
        )}
      </div>

      {/* Stokvel Memberships */}
      {groups.length > 0 && (
        <div className="card mb-4">
          <h3 className="font-semibold text-sm text-kasi-charcoal mb-3">My Memberships</h3>
          <div className="space-y-2">
            {groups.map((g) => (
              <Link
                key={g.id}
                href={`/groups/${g.id}`}
                className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <div className="w-10 h-10 bg-kasi-green/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-kasi-green font-bold text-xs">
                    {g.name.split(" ").map((w: string) => w[0]).join("")}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-kasi-charcoal truncate">{g.name}</p>
                  <p className="text-xs text-gray-400 capitalize">
                    {g.my_membership?.role || "member"} · Score: {Math.round(g.my_membership?.commitment_score || 0)}%
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300" />
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Beneficiary */}
      <div className="card mb-4">
        <div className="flex items-center gap-2 mb-3">
          <Heart className="w-4 h-4 text-rose-500" />
          <h3 className="font-semibold text-sm text-kasi-charcoal">Beneficiary</h3>
        </div>
        <p className="text-sm text-gray-600">
          {profile?.beneficiary_name || "No beneficiary set"}
        </p>
      </div>

      {/* Settings */}
      <div className="card mb-4 space-y-1">
        {[
          { icon: <Settings className="w-4 h-4" />, label: "Account Settings" },
          { icon: <Shield className="w-4 h-4" />, label: "Privacy & Security" },
          { icon: <Clock className="w-4 h-4" />, label: "Payment History" },
        ].map((item, i) => (
          <button
            key={i}
            className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-gray-50 transition-colors text-left"
          >
            <span className="text-gray-400">{item.icon}</span>
            <span className="text-sm font-medium text-kasi-charcoal flex-1">{item.label}</span>
            <ChevronRight className="w-4 h-4 text-gray-300" />
          </button>
        ))}
      </div>

      {/* Logout */}
      <button
        onClick={handleSignOut}
        className="flex items-center justify-center gap-2 text-red-500 font-medium text-sm py-4 w-full"
      >
        <LogOut className="w-4 h-4" />
        Sign Out
      </button>
    </div>
  );
}
