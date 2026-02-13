"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Shield, Award, ChevronRight,
  LogOut, Settings, Heart, Clock, Edit3, Save, X, Check, MessageSquare, Camera,
  Target, Bell, BellOff
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getMyGroups, updateProfile } from "@/lib/database";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/Toast";
import {
  formatCurrency, getScoreColor, getScoreLabel,
} from "@/lib/types";
import type { GroupWithDetails } from "@/lib/types";
import LoadingSpinner from "@/components/LoadingSpinner";
import { usePushNotifications } from "@/hooks/usePushNotifications";

export default function ProfilePage() {
  const { user, profile, loading: authLoading, signOut, refreshProfile } = useAuth();
  const router = useRouter();
  const { success: toastSuccess, error: toastError } = useToast();
  const [groups, setGroups] = useState<GroupWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit mode state
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editBeneficiary, setEditBeneficiary] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const { supported: pushSupported, permission: pushPermission, subscribe, unsubscribe } = usePushNotifications();

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

  const startEditing = () => {
    setEditName(profile?.name || "");
    setEditPhone(profile?.phone || "");
    setEditBeneficiary(profile?.beneficiary_name || "");
    setEditing(true);
  };

  const cancelEditing = () => {
    setEditing(false);
    setSaveSuccess(false);
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await updateProfile(user.id, {
        name: editName,
        phone: editPhone,
        beneficiary_name: editBeneficiary || undefined,
      });
      if (error) {
        toastError(error.message || "Failed to update profile");
      } else {
        setSaveSuccess(true);
        await refreshProfile();
        setTimeout(() => {
          setEditing(false);
          setSaveSuccess(false);
        }, 1500);
      }
    } catch {
      toastError("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (file.size > 2 * 1024 * 1024) {
      toastError("Image must be under 2MB");
      return;
    }

    setUploadingAvatar(true);
    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop() || "jpg";
      const filePath = `${user.id}/avatar.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        toastError("Failed to upload image");
        return;
      }

      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      const avatarUrl = `${publicUrl}?t=${Date.now()}`;
      await updateProfile(user.id, { avatar_url: avatarUrl } as any);
      await refreshProfile();
    } catch {
      toastError("Failed to upload image");
    } finally {
      setUploadingAvatar(false);
    }
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

  const goalFunds = groups.filter(g => g.type === "goal");
  const stokvels = groups.filter(g => g.type !== "goal");
  const goalContributed = goalFunds.reduce((s, g) => s + (g.my_membership?.lifetime_contributed || 0), 0);
  const stokvelContributed = stokvels.reduce((s, g) => s + (g.my_membership?.lifetime_contributed || 0), 0);
  const hasBothTypes = goalFunds.length > 0 && stokvels.length > 0;

  return (
    <div className="max-w-lg mx-auto px-4 pt-12">
      {/* Profile Header */}
      <div className="text-center mb-6 relative">
        {!editing && (
          <button
            onClick={startEditing}
            className="absolute right-0 top-0 w-8 h-8 bg-kasi-green/10 rounded-lg flex items-center justify-center text-kasi-green hover:bg-kasi-green/20 transition-colors"
          >
            <Edit3 className="w-4 h-4" />
          </button>
        )}

        <div className="relative w-20 h-20 mx-auto mb-3">
          <label className="block relative cursor-pointer">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt={profile.name} className="w-20 h-20 rounded-full object-cover" />
            ) : (
              <div className="w-20 h-20 bg-kasi-green/10 rounded-full flex items-center justify-center">
                <span className="text-kasi-green font-bold text-2xl">{profile?.avatar_initials || "?"}</span>
              </div>
            )}
            <div className="absolute bottom-0 right-0 w-7 h-7 bg-kasi-green rounded-full flex items-center justify-center shadow-lg border-2 border-white">
              <Camera className="w-3.5 h-3.5 text-white" />
            </div>
            <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleAvatarUpload} className="hidden" />
          </label>
          {uploadingAvatar && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            </div>
          )}
        </div>

        {editing ? (
          <div className="space-y-3 text-left">
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Full Name</label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="input-field text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Phone Number</label>
              <input
                type="tel"
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
                className="input-field text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Beneficiary Name</label>
              <input
                type="text"
                value={editBeneficiary}
                onChange={(e) => setEditBeneficiary(e.target.value)}
                placeholder="Optional"
                className="input-field text-sm"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={cancelEditing}
                className="flex-1 py-2.5 border border-gray-200 text-gray-600 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-1.5"
              >
                <X className="w-4 h-4" /> Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !editName.trim() || !editPhone.trim()}
                className="flex-1 btn-primary text-sm flex items-center justify-center gap-1.5 disabled:opacity-60"
              >
                {saving ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : saveSuccess ? (
                  <><Check className="w-4 h-4" /> Saved!</>
                ) : (
                  <><Save className="w-4 h-4" /> Save</>
                )}
              </button>
            </div>
          </div>
        ) : (
          <>
            <h1 className="text-xl font-bold text-kasi-charcoal">{profile?.name || "User"}</h1>
            <p className="text-gray-500 text-sm">{profile?.phone || profile?.email || ""}</p>
            <p className="text-gray-400 text-xs mt-1">
              Member since {profile?.created_at ? new Date(profile.created_at).toLocaleDateString("en-ZA") : ""}
            </p>
          </>
        )}
      </div>

      {/* Commitment Score Ring */}
      {groups.length > 0 && !editing && (
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
                Average across {groups.length} group{groups.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Financial Passport */}
      {!editing && (
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
              {formatCurrency(totalContributed + totalReceived)} through Kasi2Kasi.
            </p>
          )}

          {hasBothTypes && (
            <div className="grid grid-cols-2 gap-3 mt-3">
              <div className="bg-kasi-green/5 rounded-xl p-3 text-center">
                <p className="text-[10px] text-gray-400 mb-1">Stokvel Contributions</p>
                <p className="text-sm font-bold text-kasi-green">{formatCurrency(stokvelContributed)}</p>
                <p className="text-[10px] text-gray-400">{stokvels.length} group{stokvels.length !== 1 ? "s" : ""}</p>
              </div>
              <div className="bg-amber-50 rounded-xl p-3 text-center">
                <p className="text-[10px] text-gray-400 mb-1">Goal Fund Contributions</p>
                <p className="text-sm font-bold text-amber-600">{formatCurrency(goalContributed)}</p>
                <p className="text-[10px] text-gray-400">{goalFunds.length} fund{goalFunds.length !== 1 ? "s" : ""}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Stokvel Memberships */}
      {groups.length > 0 && !editing && (
        <div className="card mb-4">
          <h3 className="font-semibold text-sm text-kasi-charcoal mb-3">My Memberships</h3>
          <div className="space-y-2">
            {groups.map((g) => {
              const isGoal = g.type === "goal";
              return (
                <Link
                  key={g.id}
                  href={`/groups/${g.id}`}
                  className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  {isGoal ? (
                    <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Target className="w-5 h-5 text-amber-500" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 bg-kasi-green/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <span className="text-kasi-green font-bold text-xs">
                        {g.name.split(" ").map((w: string) => w[0]).join("")}
                      </span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-kasi-charcoal truncate">{g.name}</p>
                    <p className="text-xs text-gray-400 capitalize">
                      {isGoal ? "Goal Fund" : `${g.my_membership?.role || "member"} · Score: ${Math.round(g.my_membership?.commitment_score || 0)}%`}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300" />
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Beneficiary */}
      {!editing && (
        <div className="card mb-4">
          <div className="flex items-center gap-2 mb-3">
            <Heart className="w-4 h-4 text-rose-500" />
            <h3 className="font-semibold text-sm text-kasi-charcoal">Beneficiary</h3>
          </div>
          <p className="text-sm text-gray-600">
            {profile?.beneficiary_name || "No beneficiary set"}
          </p>
        </div>
      )}

      {/* Settings */}
      {!editing && (
        <div className="card mb-4 space-y-1">
          <button
            onClick={startEditing}
            className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-gray-50 transition-colors text-left"
          >
            <span className="text-gray-400"><Settings className="w-4 h-4" /></span>
            <span className="text-sm font-medium text-kasi-charcoal flex-1">Account Settings</span>
            <ChevronRight className="w-4 h-4 text-gray-300" />
          </button>
          {pushSupported && (
            <button
              onClick={pushPermission === "granted" ? unsubscribe : subscribe}
              className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-gray-50 transition-colors text-left"
            >
              <span className="text-gray-400">
                {pushPermission === "granted" ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
              </span>
              <span className="text-sm font-medium text-kasi-charcoal flex-1">
                {pushPermission === "granted" ? "Notifications Enabled" : "Enable Notifications"}
              </span>
              <div className={`w-10 h-6 rounded-full flex items-center px-0.5 transition-colors ${pushPermission === "granted" ? "bg-kasi-green justify-end" : "bg-gray-300 justify-start"}`}>
                <div className="w-5 h-5 bg-white rounded-full shadow" />
              </div>
            </button>
          )}
          <Link
            href="/settlement"
            className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-gray-50 transition-colors text-left"
          >
            <span className="text-gray-400"><Clock className="w-4 h-4" /></span>
            <span className="text-sm font-medium text-kasi-charcoal flex-1">Settlement Calculator</span>
            <ChevronRight className="w-4 h-4 text-gray-300" />
          </Link>
          <Link
            href="/contact"
            className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-gray-50 transition-colors text-left"
          >
            <span className="text-gray-400"><MessageSquare className="w-4 h-4" /></span>
            <span className="text-sm font-medium text-kasi-charcoal flex-1">Help & Support</span>
            <ChevronRight className="w-4 h-4 text-gray-300" />
          </Link>
        </div>
      )}

      {/* Logout */}
      {!editing && (
        <button
          onClick={handleSignOut}
          className="flex items-center justify-center gap-2 text-red-500 font-medium text-sm py-4 w-full"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      )}
    </div>
  );
}
