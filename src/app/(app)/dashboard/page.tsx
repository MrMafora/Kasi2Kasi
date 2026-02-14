"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  TrendingUp, Users, Calendar, ArrowRight, Bell, Plus, ChevronRight,
  UserPlus, LinkIcon, Sparkles, ArrowUpRight, XCircle, Target,
  Wallet, PiggyBank, Activity, Clock, Star, Zap, BarChart3
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getMyGroups, getNotifications } from "@/lib/database";
import { formatCurrency } from "@/lib/types";
import type { GroupWithDetails, Notification } from "@/lib/types";
import { DashboardSkeleton } from "@/components/Skeleton";

export default function DashboardPage() {
  const router = useRouter();
  const { user, profile, loading: authLoading } = useAuth();
  const [groups, setGroups] = useState<GroupWithDetails[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinLink, setJoinLink] = useState("");
  const [joinError, setJoinError] = useState("");
  const [greeting, setGreeting] = useState("Welcome");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 17) setGreeting("Good afternoon");
    else setGreeting("Good evening");
  }, []);

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

  const totalContributed = groups.reduce((sum, g) => sum + (g.my_membership?.lifetime_contributed || 0), 0);
  const totalReceived = groups.reduce((sum, g) => sum + (g.my_membership?.lifetime_received || 0), 0);
  const unreadNotifications = notifications.filter((n) => !n.read).length;
  const myMember = groups[0]?.my_membership;
  const stokvels = groups.filter(g => g.type !== "goal");
  const goalFunds = groups.filter(g => g.type === "goal");

  const handleJoinWithLink = () => {
    setJoinError("");
    const uuidPattern = /groups\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i;
    const match = joinLink.match(uuidPattern);
    if (match) {
      router.push(`/groups/${match[1]}/join`);
    } else if (/^[0-9a-f]{8}-[0-9a-f]{4}-/i.test(joinLink.trim())) {
      router.push(`/groups/${joinLink.trim()}/join`);
    } else {
      setJoinError("Invalid invite link. Ask your group admin to share the link again.");
    }
  };

  const firstName = profile?.name?.split(" ")[0] || user?.user_metadata?.name?.split(" ")[0] || "there";

  if (authLoading || loading) {
    return (
      <DashboardSkeleton />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 pb-24">
      {/* Hero Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero" />
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -right-20 w-72 h-72 bg-kasi-gold/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-kasi-green-light/15 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-lg mx-auto px-4 pt-10 pb-8">
          {/* Top Bar */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="text-white/50 text-sm font-medium">{greeting}</p>
              <h1 className="text-white text-2xl font-bold tracking-tight">{firstName} 👋</h1>
            </div>
            <Link
              href="/notifications"
              className="relative w-11 h-11 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center transition-all"
            >
              <Bell className="w-5 h-5 text-white/80" />
              {unreadNotifications > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-kasi-charcoal">
                  {unreadNotifications}
                </span>
              )}
            </Link>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/[0.08] hover:bg-white/[0.12] backdrop-blur-md rounded-2xl p-4 border border-white/[0.06] transition-all">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-emerald-400/20 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                </div>
                <span className="text-white/50 text-xs font-medium">Contributed</span>
              </div>
              <p className="text-white font-bold text-xl tracking-tight">{formatCurrency(totalContributed)}</p>
            </div>
            <div className="bg-white/[0.08] hover:bg-white/[0.12] backdrop-blur-md rounded-2xl p-4 border border-white/[0.06] transition-all">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-kasi-gold/20 rounded-xl flex items-center justify-center">
                  <Wallet className="w-4 h-4 text-kasi-gold" />
                </div>
                <span className="text-white/50 text-xs font-medium">Received</span>
              </div>
              <p className="text-white font-bold text-xl tracking-tight">{formatCurrency(totalReceived)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-lg mx-auto px-4 -mt-2 space-y-5">

        {/* Commitment Score */}
        {myMember && (
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100/80">
            <div className="flex items-center gap-4">
              <div className="relative w-16 h-16 flex-shrink-0">
                <svg className="w-16 h-16 progress-ring" viewBox="0 0 64 64">
                  <circle cx="32" cy="32" r="28" fill="none" stroke="#f3f4f6" strokeWidth="5" />
                  <circle
                    cx="32" cy="32" r="28"
                    fill="none"
                    stroke={myMember.commitment_score >= 90 ? "#10b981" : myMember.commitment_score >= 70 ? "#f59e0b" : "#ef4444"}
                    strokeWidth="5"
                    strokeDasharray={`${(myMember.commitment_score / 100) * 175.93} 175.93`}
                    strokeLinecap="round"
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-kasi-charcoal">
                  {Math.round(myMember.commitment_score)}
                </span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-kasi-charcoal">Commitment Score</h3>
                  {myMember.commitment_score >= 90 && <Star className="w-4 h-4 text-kasi-gold fill-kasi-gold" />}
                </div>
                <p className="text-gray-400 text-xs">
                  {myMember.total_on_time}/{myMember.total_payments} on time · {myMember.cycles_completed} cycle{myMember.cycles_completed !== 1 ? "s" : ""}
                </p>
              </div>
              <Link href="/profile" className="w-9 h-9 rounded-xl bg-gray-50 hover:bg-gray-100 flex items-center justify-center transition-colors">
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </Link>
            </div>
          </div>
        )}

        {/* Quick Actions (when user has no groups) */}
        {groups.length === 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100/80 overflow-hidden">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 bg-gradient-to-br from-kasi-green to-kasi-green-light rounded-2xl flex items-center justify-center shadow-lg shadow-kasi-green/20">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-kasi-charcoal text-lg">Welcome to Kasi2Kasi!</h3>
                  <p className="text-xs text-gray-400">Your community savings platform</p>
                </div>
              </div>

              <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                Save together with your community. Create a Stokvel for rotating payouts, or a Goal Fund for shared expenses like medical bills, school fees, or events.
              </p>

              {/* How it works - compact */}
              <div className="flex items-center justify-between bg-gray-50 rounded-xl p-3 mb-6">
                {[
                  { icon: <Plus className="w-3.5 h-3.5" />, label: "Create" },
                  { icon: <UserPlus className="w-3.5 h-3.5" />, label: "Invite" },
                  { icon: <PiggyBank className="w-3.5 h-3.5" />, label: "Save" },
                  { icon: <Zap className="w-3.5 h-3.5" />, label: "Grow" },
                ].map((s, i) => (
                  <div key={i} className="flex flex-col items-center gap-1.5">
                    <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center text-kasi-green shadow-sm">
                      {s.icon}
                    </div>
                    <span className="text-[10px] font-medium text-gray-400">{s.label}</span>
                  </div>
                ))}
              </div>

              {/* Action buttons */}
              <div className="space-y-2.5">
                <div className="grid grid-cols-2 gap-2.5">
                  <Link
                    href="/groups/new"
                    className="btn-primary text-sm !py-3.5 flex items-center justify-center gap-1.5 !rounded-xl"
                  >
                    <Plus className="w-4 h-4" /> Stokvel
                  </Link>
                  <Link
                    href="/goals/new"
                    className="text-sm py-3.5 rounded-xl font-semibold text-amber-700 bg-gradient-to-br from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 border border-amber-200/50 transition-all flex items-center justify-center gap-1.5"
                  >
                    <Target className="w-4 h-4" /> Goal Fund
                  </Link>
                </div>
                <button
                  onClick={() => setShowJoinModal(true)}
                  className="w-full py-3.5 rounded-xl font-medium text-sm text-gray-500 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-center gap-1.5 border border-gray-100"
                >
                  <LinkIcon className="w-4 h-4" /> Join with Invite Link
                </button>
              </div>
            </div>
          </div>
        )}

        {/* My Stokvels */}
        {stokvels.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-kasi-charcoal">My Stokvels</h2>
                <span className="text-xs bg-kasi-green/10 text-kasi-green font-medium px-2 py-0.5 rounded-full">{stokvels.length}</span>
              </div>
              <Link href="/groups" className="text-sm text-kasi-green font-medium flex items-center gap-1 hover:gap-2 transition-all">
                View all <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="space-y-3">
              {stokvels.map((group) => (
                <Link key={group.id} href={`/groups/${group.id}`} className="block bg-white rounded-2xl p-5 shadow-sm border border-gray-100/80 hover:shadow-md hover:border-kasi-green/10 transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-kasi-charcoal">{group.name}</h3>
                      <p className="text-gray-400 text-xs mt-0.5">{group.description}</p>
                    </div>
                    <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full uppercase tracking-wider">{group.status}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm mb-3">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1.5 text-gray-400 text-xs">
                        <Users className="w-3.5 h-3.5" /> {group.member_count}/{group.max_members}
                      </span>
                      <span className="flex items-center gap-1.5 text-gray-400 text-xs">
                        <Activity className="w-3.5 h-3.5" /> Round {group.current_round}/{group.total_rounds}
                      </span>
                    </div>
                    <span className="font-bold text-kasi-charcoal text-sm">
                      {formatCurrency(group.contribution_amount)}<span className="text-gray-400 font-normal text-xs">/mo</span>
                    </span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-kasi-green to-kasi-green-light rounded-full transition-all"
                      style={{ width: `${Math.max(3, (group.current_round / group.total_rounds) * 100)}%` }}
                    />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* My Goal Funds */}
        {goalFunds.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-kasi-charcoal">Goal Funds</h2>
                <span className="text-xs bg-amber-100 text-amber-700 font-medium px-2 py-0.5 rounded-full">{goalFunds.length}</span>
              </div>
            </div>
            <div className="space-y-3">
              {goalFunds.map((group) => (
                <Link key={group.id} href={`/groups/${group.id}`} className="block bg-white rounded-2xl p-5 shadow-sm border border-gray-100/80 hover:shadow-md hover:border-amber-200/50 transition-all">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Target className="w-5 h-5 text-amber-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-kasi-charcoal">{group.name}</h3>
                      <p className="text-gray-400 text-xs mt-0.5 truncate">{group.goal_description || group.description}</p>
                    </div>
                    <span className="text-[10px] font-semibold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full uppercase tracking-wider">Goal</span>
                  </div>
                  <div className="flex items-center justify-between text-sm mb-3">
                    <span className="flex items-center gap-1.5 text-gray-400 text-xs">
                      <Users className="w-3.5 h-3.5" /> {group.member_count} member{group.member_count !== 1 ? "s" : ""}
                    </span>
                    <span className="font-bold text-kasi-charcoal text-sm">
                      Target: {formatCurrency(group.goal_monthly_target || 0)}<span className="text-gray-400 font-normal text-xs">/mo</span>
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-xs text-gray-400 mb-1.5">
                      <span>Pool: {formatCurrency(group.total_pool)}</span>
                      <span className="font-medium text-amber-600">{group.goal_monthly_target ? Math.round((group.total_pool / group.goal_monthly_target) * 100) : 0}%</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-400 to-orange-400 rounded-full transition-all"
                        style={{ width: `${Math.min(100, Math.max(3, group.goal_monthly_target ? (group.total_pool / group.goal_monthly_target) * 100 : 0))}%` }}
                      />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Quick Create (when user has groups) */}
        {groups.length > 0 && (
          <div className="grid grid-cols-3 gap-2.5">
            <Link
              href="/groups/new"
              className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100/80 border-dashed hover:border-kasi-green/30 hover:shadow-md flex flex-col items-center gap-2 transition-all group"
            >
              <div className="w-10 h-10 bg-kasi-green/10 group-hover:bg-kasi-green/20 rounded-xl flex items-center justify-center transition-colors">
                <Plus className="w-5 h-5 text-kasi-green" />
              </div>
              <span className="text-xs font-medium text-gray-500 group-hover:text-kasi-green transition-colors">New Stokvel</span>
            </Link>
            <Link
              href="/goals/new"
              className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100/80 border-dashed hover:border-amber-200 hover:shadow-md flex flex-col items-center gap-2 transition-all group"
            >
              <div className="w-10 h-10 bg-amber-50 group-hover:bg-amber-100 rounded-xl flex items-center justify-center transition-colors">
                <Target className="w-5 h-5 text-amber-600" />
              </div>
              <span className="text-xs font-medium text-gray-500 group-hover:text-amber-600 transition-colors">Goal Fund</span>
            </Link>
            <button
              onClick={() => setShowJoinModal(true)}
              className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100/80 border-dashed hover:border-blue-200 hover:shadow-md flex flex-col items-center gap-2 transition-all group"
            >
              <div className="w-10 h-10 bg-blue-50 group-hover:bg-blue-100 rounded-xl flex items-center justify-center transition-colors">
                <UserPlus className="w-5 h-5 text-blue-500" />
              </div>
              <span className="text-xs font-medium text-gray-500 group-hover:text-blue-500 transition-colors">Join Group</span>
            </button>
          </div>
        )}

        {/* Upcoming Events */}
        {groups.length > 0 && (
          <div>
            <h2 className="font-bold text-kasi-charcoal mb-3">Upcoming</h2>
            <div className="space-y-2">
              {groups.filter(g => g.next_payout_date).map((group) => (
                <div key={group.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100/80 flex items-center gap-3">
                  <div className="w-10 h-10 bg-kasi-gold/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-kasi-gold" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-kasi-charcoal truncate">Next payout</p>
                    <p className="text-xs text-gray-400">{group.name} · {group.next_payout_date}</p>
                  </div>
                  <span className="text-sm font-bold text-kasi-green whitespace-nowrap">
                    {formatCurrency(group.contribution_amount * group.max_members)}
                  </span>
                </div>
              ))}
              {groups.filter(g => g.next_payout_date).length === 0 && (
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100/80 text-center">
                  <Clock className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                  <p className="text-gray-400 text-xs">No upcoming payouts scheduled</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Join Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4 modal-backdrop" onClick={() => { setShowJoinModal(false); setJoinLink(""); setJoinError(""); }}>
          <div className="bg-white rounded-3xl w-full max-w-md p-6 space-y-4 modal-content shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg text-kasi-charcoal">Join a Group</h3>
              <button onClick={() => { setShowJoinModal(false); setJoinLink(""); setJoinError(""); }} className="w-8 h-8 rounded-xl bg-gray-50 hover:bg-gray-100 flex items-center justify-center transition-colors">
                <XCircle className="w-4 h-4 text-gray-400" />
              </button>
            </div>
            <p className="text-sm text-gray-500">Paste the invite link you received from your group admin.</p>
            <div>
              <input
                type="text"
                value={joinLink}
                onChange={(e) => { setJoinLink(e.target.value); setJoinError(""); }}
                placeholder="https://... or paste group ID"
                className="input-field text-sm"
                autoFocus
              />
              {joinError && <p className="text-xs text-red-500 mt-1.5">{joinError}</p>}
            </div>
            <button
              onClick={handleJoinWithLink}
              disabled={!joinLink.trim()}
              className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowUpRight className="w-4 h-4" /> Go to Group
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
