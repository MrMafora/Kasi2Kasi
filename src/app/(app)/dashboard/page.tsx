"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { TrendingUp, Users, Calendar, ArrowRight, Bell, Plus, ChevronRight, UserPlus, LinkIcon, Sparkles, ArrowUpRight, XCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getMyGroups, getNotifications } from "@/lib/database";
import { formatCurrency } from "@/lib/types";
import type { GroupWithDetails, Notification } from "@/lib/types";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function DashboardPage() {
  const router = useRouter();
  const { user, profile, loading: authLoading } = useAuth();
  const [groups, setGroups] = useState<GroupWithDetails[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  // Join modal state
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinLink, setJoinLink] = useState("");
  const [joinError, setJoinError] = useState("");

  useEffect(() => {
    async function loadData() {
      if (!user) return;
      try {
        const [groupsData, notifData] = await Promise.all([
          getMyGroups(user.id),
          getNotifications(user.id),
        ]);
        setGroups(groupsData);
        setNotifications(notifData);
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }
    if (!authLoading) loadData();
  }, [user, authLoading]);

  const totalContributed = groups.reduce((sum, g) => {
    return sum + (g.my_membership?.lifetime_contributed || 0);
  }, 0);

  const totalReceived = groups.reduce((sum, g) => {
    return sum + (g.my_membership?.lifetime_received || 0);
  }, 0);

  const unreadNotifications = notifications.filter((n) => !n.read).length;

  const myMember = groups[0]?.my_membership;

  const handleJoinWithLink = () => {
    setJoinError("");
    // Extract group ID from URL like /groups/UUID/join or /groups/UUID
    const uuidPattern = /groups\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i;
    const match = joinLink.match(uuidPattern);
    if (match) {
      router.push(`/groups/${match[1]}/join`);
    } else if (/^[0-9a-f]{8}-[0-9a-f]{4}-/i.test(joinLink.trim())) {
      // Looks like a raw UUID
      router.push(`/groups/${joinLink.trim()}/join`);
    } else {
      setJoinError("Invalid invite link. Ask your group admin to share the link again.");
    }
  };

  if (authLoading || loading) {
    return (
      <div className="max-w-lg mx-auto pt-20">
        <LoadingSpinner message="Loading dashboard..." />
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      {/* Header */}
      <div className="gradient-green px-4 pt-12 pb-8 rounded-b-3xl relative overflow-hidden">
        {/* Decorative */}
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-white/5 rounded-full blur-2xl" />
        <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-kasi-gold/10 rounded-full blur-2xl" />
        <div className="flex items-center justify-between mb-6 relative z-10">
          <div>
            <p className="text-white/70 text-sm">Welcome back</p>
            <h1 className="text-white text-xl font-bold">{profile?.name || "User"}</h1>
          </div>
          <Link
            href="/notifications"
            className="relative w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center"
          >
            <Bell className="w-5 h-5 text-white" />
            {unreadNotifications > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {unreadNotifications}
              </span>
            )}
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 relative z-10">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-white/70" />
              <span className="text-white/70 text-xs">Contributed</span>
            </div>
            <p className="text-white font-bold text-lg">{formatCurrency(totalContributed)}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-kasi-gold" />
              <span className="text-white/70 text-xs">Received</span>
            </div>
            <p className="text-white font-bold text-lg">{formatCurrency(totalReceived)}</p>
          </div>
        </div>
      </div>

      <div className="px-4 -mt-4 space-y-4 animate-slide-up">
        {/* Commitment Score Card */}
        {myMember && (
          <div className="card flex items-center gap-4">
            <div className="relative w-16 h-16 flex-shrink-0">
              <svg className="w-16 h-16 progress-ring" viewBox="0 0 64 64">
                <circle cx="32" cy="32" r="28" fill="none" stroke="#e5e7eb" strokeWidth="4" />
                <circle
                  cx="32" cy="32" r="28"
                  fill="none"
                  stroke={myMember.commitment_score >= 90 ? "#10b981" : myMember.commitment_score >= 70 ? "#f59e0b" : "#ef4444"}
                  strokeWidth="4"
                  strokeDasharray={`${(myMember.commitment_score / 100) * 175.93} 175.93`}
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-sm font-bold">
                {Math.round(myMember.commitment_score)}
              </span>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-kasi-charcoal text-sm">Commitment Score</h3>
              <p className="text-gray-500 text-xs mt-0.5">
                {myMember.total_on_time}/{myMember.total_payments} payments on time
              </p>
              <p className="text-gray-400 text-xs">
                {myMember.cycles_completed} cycle{myMember.cycles_completed !== 1 ? "s" : ""} completed
              </p>
            </div>
            <Link href="/profile" className="text-gray-400">
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        )}

        {/* My Stokvels */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-kasi-charcoal">My Stokvels</h2>
            {groups.length > 0 && (
              <Link href="/groups" className="text-sm text-kasi-green font-medium flex items-center gap-1">
                View all <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>

          <div className="space-y-3 stagger-children">
            {groups.length === 0 ? (
              <>
                {/* Onboarding Welcome Card */}
                <div className="card bg-gradient-to-br from-kasi-green/5 to-kasi-gold/5 border border-kasi-green/10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-kasi-green/10 rounded-2xl flex items-center justify-center">
                      <Sparkles className="w-6 h-6 text-kasi-green" />
                    </div>
                    <div>
                      <h3 className="font-bold text-kasi-charcoal">Welcome to Kasi2Kasi!</h3>
                      <p className="text-xs text-gray-500">Your community savings platform</p>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 mb-4">
                    Stokvels help communities save together. Each member contributes monthly, and the pool rotates to one member at a time.
                  </p>

                  {/* How it works */}
                  <div className="grid grid-cols-4 gap-2 mb-5">
                    {[
                      { step: "1", label: "Create or Join" },
                      { step: "2", label: "Contribute" },
                      { step: "3", label: "Build Pool" },
                      { step: "4", label: "Get Payout" },
                    ].map((s) => (
                      <div key={s.step} className="text-center">
                        <div className="w-8 h-8 bg-kasi-green/10 rounded-full flex items-center justify-center text-xs font-bold text-kasi-green mx-auto mb-1">
                          {s.step}
                        </div>
                        <p className="text-[10px] text-gray-500">{s.label}</p>
                      </div>
                    ))}
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-2">
                    <Link
                      href="/groups/new"
                      className="flex-1 btn-primary text-sm !py-3 flex items-center justify-center gap-1.5"
                    >
                      <Plus className="w-4 h-4" /> Create Stokvel
                    </Link>
                    <button
                      onClick={() => setShowJoinModal(true)}
                      className="flex-1 py-3 rounded-xl font-medium text-sm text-kasi-green bg-kasi-green/10 hover:bg-kasi-green/20 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <LinkIcon className="w-4 h-4" /> Join with Link
                    </button>
                  </div>
                </div>
              </>
            ) : (
              groups.map((group) => (
                <Link key={group.id} href={`/groups/${group.id}`} className="card-hover block">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-kasi-charcoal">{group.name}</h3>
                      <p className="text-gray-500 text-xs mt-0.5">{group.description}</p>
                    </div>
                    <span className="badge-green">{group.status}</span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1 text-gray-500">
                        <Users className="w-3.5 h-3.5" />
                        {group.member_count}/{group.max_members}
                      </span>
                      <span className="flex items-center gap-1 text-gray-500">
                        <Calendar className="w-3.5 h-3.5" />
                        Round {group.current_round}/{group.total_rounds}
                      </span>
                    </div>
                    <span className="font-semibold text-kasi-charcoal">
                      {formatCurrency(group.contribution_amount)}/mo
                    </span>
                  </div>

                  <div className="mt-3">
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-kasi-green rounded-full transition-all"
                        style={{ width: `${(group.current_round / group.total_rounds) * 100}%` }}
                      />
                    </div>
                  </div>
                </Link>
              ))
            )}

            {/* Create new / Join — shown when user already has groups */}
            {groups.length > 0 && (
              <div className="flex gap-2">
                <Link
                  href="/groups/new"
                  className="flex-1 card-hover border-dashed border-2 border-gray-200 flex items-center justify-center gap-2 text-gray-400 hover:text-kasi-green hover:border-kasi-green/30"
                >
                  <Plus className="w-4 h-4" />
                  <span className="font-medium text-xs">Create</span>
                </Link>
                <button
                  onClick={() => setShowJoinModal(true)}
                  className="flex-1 card-hover border-dashed border-2 border-gray-200 flex items-center justify-center gap-2 text-gray-400 hover:text-kasi-green hover:border-kasi-green/30"
                >
                  <UserPlus className="w-4 h-4" />
                  <span className="font-medium text-xs">Join</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Upcoming */}
        {groups.length > 0 && (
          <div>
            <h2 className="font-semibold text-kasi-charcoal mb-3">Upcoming</h2>
            <div className="space-y-2">
              {groups.filter(g => g.next_payout_date).map((group) => (
                <div key={group.id} className="card flex items-center gap-3">
                  <div className="w-10 h-10 bg-kasi-gold/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-5 h-5 text-kasi-gold" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-kasi-charcoal truncate">
                      Next payout
                    </p>
                    <p className="text-xs text-gray-500">
                      {group.name} · {group.next_payout_date}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-kasi-green whitespace-nowrap">
                    {formatCurrency(group.contribution_amount * group.max_members)}
                  </span>
                </div>
              ))}
              {groups.filter(g => g.next_payout_date).length === 0 && (
                <div className="card text-center py-4">
                  <p className="text-gray-400 text-xs">No upcoming payouts scheduled</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ===== JOIN WITH LINK MODAL ===== */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg text-kasi-charcoal">Join a Stokvel</h3>
              <button onClick={() => { setShowJoinModal(false); setJoinLink(""); setJoinError(""); }} className="text-gray-400 hover:text-gray-600">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-gray-500">
              Paste the invite link you received from your group admin.
            </p>

            <div>
              <input
                type="text"
                value={joinLink}
                onChange={(e) => { setJoinLink(e.target.value); setJoinError(""); }}
                placeholder="https://... or paste group ID"
                className="input-field text-sm"
              />
              {joinError && (
                <p className="text-xs text-red-500 mt-1.5">{joinError}</p>
              )}
            </div>

            <button
              onClick={handleJoinWithLink}
              disabled={!joinLink.trim()}
              className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60"
            >
              <ArrowUpRight className="w-4 h-4" /> Go to Group
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

