"use client";

import Link from "next/link";
import { TrendingUp, Users, Calendar, ArrowRight, Bell, Plus, ChevronRight } from "lucide-react";
import { mockGroups, mockNotifications, currentUser, formatCurrency } from "@/lib/mock-data";

export default function DashboardPage() {
  const totalContributed = mockGroups.reduce((sum, g) => {
    const member = g.members.find((m) => m.userId === currentUser.id);
    return sum + (member?.lifetimeContributed || 0);
  }, 0);

  const totalReceived = mockGroups.reduce((sum, g) => {
    const member = g.members.find((m) => m.userId === currentUser.id);
    return sum + (member?.lifetimeReceived || 0);
  }, 0);

  const unreadNotifications = mockNotifications.filter((n) => !n.read).length;
  const myMember = mockGroups[0]?.members.find((m) => m.userId === currentUser.id);

  return (
    <div className="max-w-lg mx-auto">
      {/* Header */}
      <div className="bg-kasi-green px-4 pt-12 pb-8 rounded-b-3xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-white/70 text-sm">Welcome back</p>
            <h1 className="text-white text-xl font-bold">{currentUser.name}</h1>
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
        <div className="grid grid-cols-2 gap-3">
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

      <div className="px-4 -mt-4 space-y-4">
        {/* Commitment Score Card */}
        {myMember && (
          <div className="card flex items-center gap-4">
            <div className="relative w-16 h-16 flex-shrink-0">
              <svg className="w-16 h-16 progress-ring" viewBox="0 0 64 64">
                <circle
                  cx="32" cy="32" r="28"
                  fill="none" stroke="#e5e7eb" strokeWidth="4"
                />
                <circle
                  cx="32" cy="32" r="28"
                  fill="none"
                  stroke={myMember.commitmentScore >= 90 ? "#10b981" : myMember.commitmentScore >= 70 ? "#f59e0b" : "#ef4444"}
                  strokeWidth="4"
                  strokeDasharray={`${(myMember.commitmentScore / 100) * 175.93} 175.93`}
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-sm font-bold">
                {myMember.commitmentScore}
              </span>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-kasi-charcoal text-sm">Commitment Score</h3>
              <p className="text-gray-500 text-xs mt-0.5">
                {myMember.totalOnTime}/{myMember.totalPayments} payments on time
              </p>
              <p className="text-gray-400 text-xs">
                {myMember.cyclesCompleted} cycle{myMember.cyclesCompleted !== 1 ? "s" : ""} completed
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
            <Link href="/groups" className="text-sm text-kasi-green font-medium flex items-center gap-1">
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {mockGroups.map((group) => (
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
                      {group.totalMembers}/{group.maxMembers}
                    </span>
                    <span className="flex items-center gap-1 text-gray-500">
                      <Calendar className="w-3.5 h-3.5" />
                      Round {group.currentRound}/{group.totalRounds}
                    </span>
                  </div>
                  <span className="font-semibold text-kasi-charcoal">
                    {formatCurrency(group.contributionAmount)}/mo
                  </span>
                </div>

                {/* Progress bar */}
                <div className="mt-3">
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-kasi-green rounded-full transition-all"
                      style={{ width: `${(group.currentRound / group.totalRounds) * 100}%` }}
                    />
                  </div>
                </div>
              </Link>
            ))}

            {/* Create new */}
            <Link
              href="/groups/new"
              className="card-hover border-dashed border-2 border-gray-200 flex items-center justify-center gap-2 text-gray-400 hover:text-kasi-green hover:border-kasi-green/30"
            >
              <Plus className="w-5 h-5" />
              <span className="font-medium text-sm">Create New Stokvel</span>
            </Link>
          </div>
        </div>

        {/* Upcoming */}
        <div>
          <h2 className="font-semibold text-kasi-charcoal mb-3">Upcoming</h2>
          <div className="space-y-2">
            {mockGroups.map((group) => (
              <div key={group.id} className="card flex items-center gap-3">
                <div className="w-10 h-10 bg-kasi-gold/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-5 h-5 text-kasi-gold" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-kasi-charcoal truncate">
                    Next payout: {group.nextPayoutMember}
                  </p>
                  <p className="text-xs text-gray-500">
                    {group.name} · {group.nextPayoutDate}
                  </p>
                </div>
                <span className="text-sm font-semibold text-kasi-green whitespace-nowrap">
                  {formatCurrency(group.contributionAmount * group.totalMembers)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
