"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft, Users, BarChart3, FileText, Vote, Crown,
  Shield, BookOpen, CheckCircle, XCircle, Clock, AlertTriangle,
  ChevronRight, UserPlus, Share2
} from "lucide-react";
import {
  mockGroups, mockVotes, formatCurrency, getScoreColor, getScoreBg,
  getScoreLabel, getRoleBadgeColor, currentUser
} from "@/lib/mock-data";

type Tab = "ledger" | "members" | "constitution" | "votes";

export default function GroupDetailPage() {
  const params = useParams();
  const [activeTab, setActiveTab] = useState<Tab>("ledger");
  const group = mockGroups.find((g) => g.id === params.id) || mockGroups[0];
  const votes = mockVotes.filter((v) => v.groupId === group.id);

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "ledger", label: "Ledger", icon: <BarChart3 className="w-4 h-4" /> },
    { id: "members", label: "Members", icon: <Users className="w-4 h-4" /> },
    { id: "constitution", label: "Rules", icon: <BookOpen className="w-4 h-4" /> },
    { id: "votes", label: "Votes", icon: <Vote className="w-4 h-4" /> },
  ];

  const currentRoundTransactions = group.transactions.filter(
    (t) => t.round === group.currentRound && t.type === "contribution"
  );

  const payoutOrder = group.members.map((m, i) => ({
    member: m,
    round: i + 1,
    isPaid: i + 1 < group.currentRound,
    isCurrent: i + 1 === group.currentRound,
    isFuture: i + 1 > group.currentRound,
  }));

  return (
    <div className="max-w-lg mx-auto">
      {/* Header */}
      <div className="bg-kasi-green px-4 pt-10 pb-6 rounded-b-3xl">
        <div className="flex items-center gap-3 mb-4">
          <Link href="/groups" className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
            <ArrowLeft className="w-4 h-4 text-white" />
          </Link>
          <div className="flex-1">
            <h1 className="text-white font-bold text-lg">{group.name}</h1>
            <p className="text-white/60 text-xs">{group.description}</p>
          </div>
          <button className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
            <Share2 className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-white/10 rounded-xl p-3 text-center">
            <p className="text-white/60 text-[10px] mb-1">Pool</p>
            <p className="text-white font-bold text-sm">{formatCurrency(group.totalPool)}</p>
          </div>
          <div className="bg-white/10 rounded-xl p-3 text-center">
            <p className="text-white/60 text-[10px] mb-1">Round</p>
            <p className="text-white font-bold text-sm">{group.currentRound}/{group.totalRounds}</p>
          </div>
          <div className="bg-white/10 rounded-xl p-3 text-center">
            <p className="text-white/60 text-[10px] mb-1">Next Payout</p>
            <p className="text-kasi-gold font-bold text-sm">{formatCurrency(group.contributionAmount * group.totalMembers)}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 -mt-3">
        <div className="card !p-1 flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-kasi-green text-white shadow-sm"
                  : "text-gray-500 hover:text-kasi-charcoal"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="px-4 mt-4 space-y-4">
        {/* ===== LEDGER TAB ===== */}
        {activeTab === "ledger" && (
          <>
            {/* Round Robin Timeline */}
            <div className="card">
              <h3 className="font-semibold text-sm text-kasi-charcoal mb-4">Payout Rotation</h3>
              <div className="space-y-2">
                {payoutOrder.map(({ member, round, isPaid, isCurrent }) => (
                  <div
                    key={member.userId}
                    className={`flex items-center gap-3 p-2.5 rounded-xl transition-all ${
                      isCurrent ? "bg-kasi-gold/10 border border-kasi-gold/20" : ""
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                      isPaid ? "bg-emerald-100 text-emerald-600" :
                      isCurrent ? "bg-kasi-gold/20 text-kasi-gold-dark" :
                      "bg-gray-100 text-gray-400"
                    }`}>
                      {round}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-kasi-charcoal">{member.user.name}</p>
                      <p className="text-xs text-gray-400">
                        {isPaid ? "Paid out" : isCurrent ? "Current round" : `Round ${round}`}
                      </p>
                    </div>
                    <div>
                      {isPaid && <CheckCircle className="w-5 h-5 text-emerald-500" />}
                      {isCurrent && (
                        <span className="badge-gold text-[10px]">
                          Next: {formatCurrency(group.contributionAmount * group.totalMembers)}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Current Round Payments */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-sm text-kasi-charcoal">
                  Round {group.currentRound} Contributions
                </h3>
                <span className="text-xs text-gray-400">
                  {currentRoundTransactions.filter(t => t.status === "completed").length}/{group.totalMembers} paid
                </span>
              </div>
              <div className="space-y-2">
                {currentRoundTransactions.map((tx) => (
                  <div key={tx.id} className="flex items-center gap-3 py-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                      tx.status === "completed" ? "bg-emerald-50 text-emerald-600" :
                      tx.status === "late" ? "bg-amber-50 text-amber-600" :
                      tx.status === "pending" ? "bg-gray-100 text-gray-400" :
                      "bg-red-50 text-red-600"
                    }`}>
                      {tx.status === "completed" ? <CheckCircle className="w-4 h-4" /> :
                       tx.status === "late" ? <AlertTriangle className="w-4 h-4" /> :
                       tx.status === "pending" ? <Clock className="w-4 h-4" /> :
                       <XCircle className="w-4 h-4" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-kasi-charcoal">{tx.memberName}</p>
                      <p className="text-xs text-gray-400">
                        {tx.date || "Awaiting payment"}
                        {tx.status === "late" && " · Late"}
                      </p>
                    </div>
                    <span className={`text-sm font-semibold ${
                      tx.status === "completed" ? "text-emerald-600" :
                      tx.status === "late" ? "text-amber-600" :
                      "text-gray-400"
                    }`}>
                      {formatCurrency(tx.amount)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="card">
              <h3 className="font-semibold text-sm text-kasi-charcoal mb-4">Recent Activity</h3>
              <div className="space-y-2">
                {group.transactions
                  .filter(t => t.type === "payout")
                  .slice(-3)
                  .reverse()
                  .map((tx) => (
                  <div key={tx.id} className="flex items-center gap-3 py-2">
                    <div className="w-8 h-8 bg-kasi-gold/10 rounded-full flex items-center justify-center">
                      <Crown className="w-4 h-4 text-kasi-gold" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-kasi-charcoal">{tx.memberName}</p>
                      <p className="text-xs text-gray-400">Round {tx.round} payout · {tx.date}</p>
                    </div>
                    <span className="text-sm font-semibold text-kasi-gold">
                      {formatCurrency(tx.amount)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ===== MEMBERS TAB ===== */}
        {activeTab === "members" && (
          <>
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-sm text-kasi-charcoal">
                  Members ({group.totalMembers}/{group.maxMembers})
                </h3>
                <button className="text-xs text-kasi-green font-medium flex items-center gap-1">
                  <UserPlus className="w-3.5 h-3.5" /> Invite
                </button>
              </div>
              <div className="space-y-2">
                {group.members.map((member) => (
                  <div key={member.userId} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 transition-colors">
                    <div className="w-10 h-10 bg-kasi-green/10 rounded-full flex items-center justify-center">
                      <span className="text-kasi-green font-bold text-xs">{member.user.avatar}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-kasi-charcoal truncate">{member.user.name}</p>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium capitalize ${getRoleBadgeColor(member.role)}`}>
                          {member.role === "chairperson" && <Crown className="w-2.5 h-2.5 inline mr-0.5" />}
                          {member.role}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400">
                        Score: <span className={`font-semibold ${getScoreColor(member.commitmentScore)}`}>
                          {member.commitmentScore}%
                        </span>
                        {" · "}{member.cyclesCompleted} cycles
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ===== CONSTITUTION TAB ===== */}
        {activeTab === "constitution" && (
          <>
            <div className="card">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="w-5 h-5 text-kasi-green" />
                <h3 className="font-semibold text-sm text-kasi-charcoal">Digital Constitution</h3>
              </div>
              <p className="text-xs text-gray-400 mb-4">
                All members must agree to these rules before joining. Changes require a majority vote.
              </p>
              <div className="space-y-3">
                {group.constitution.map((rule, i) => (
                  <div key={rule.id} className="border border-gray-100 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <span className="w-6 h-6 bg-kasi-green/10 rounded-lg flex items-center justify-center text-xs font-bold text-kasi-green flex-shrink-0">
                        {i + 1}
                      </span>
                      <div className="flex-1">
                        <h4 className="font-medium text-sm text-kasi-charcoal mb-1">{rule.title}</h4>
                        <p className="text-xs text-gray-500 leading-relaxed">{rule.description}</p>
                        <p className="text-[10px] text-gray-400 mt-2">
                          ✓ Accepted by {rule.acceptedBy.length}/{group.totalMembers} members
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ===== VOTES TAB ===== */}
        {activeTab === "votes" && (
          <>
            {votes.map((vote) => {
              const totalVotes = vote.votesFor.length + vote.votesAgainst.length;
              const forPercent = totalVotes > 0 ? (vote.votesFor.length / totalVotes) * 100 : 0;
              const hasVoted = vote.votesFor.includes(currentUser.id) || vote.votesAgainst.includes(currentUser.id);

              return (
                <div key={vote.id} className="card">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {vote.status === "active" && <span className="badge-blue">Active</span>}
                        {vote.status === "passed" && <span className="badge-green">Passed</span>}
                        {vote.status === "rejected" && <span className="badge-red">Rejected</span>}
                        <span className="text-[10px] text-gray-400 capitalize">{vote.type.replace("_", " ")}</span>
                      </div>
                      <h3 className="font-semibold text-sm text-kasi-charcoal">{vote.title}</h3>
                      <p className="text-xs text-gray-500 mt-1">{vote.description}</p>
                    </div>
                  </div>

                  {/* Vote bar */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-emerald-600 font-medium">For: {vote.votesFor.length}</span>
                      <span className="text-red-500 font-medium">Against: {vote.votesAgainst.length}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden flex">
                      <div className="h-full bg-emerald-500 rounded-l-full" style={{ width: `${forPercent}%` }} />
                      <div className="h-full bg-red-400 rounded-r-full" style={{ width: `${100 - forPercent}%` }} />
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1">
                      {totalVotes}/{group.totalMembers} members voted · Expires {vote.expiryDate}
                    </p>
                  </div>

                  {/* Vote buttons */}
                  {vote.status === "active" && !hasVoted && (
                    <div className="flex gap-2">
                      <button className="flex-1 py-2 bg-emerald-50 text-emerald-600 text-sm font-medium rounded-xl hover:bg-emerald-100 transition-colors">
                        ✓ Vote For
                      </button>
                      <button className="flex-1 py-2 bg-red-50 text-red-500 text-sm font-medium rounded-xl hover:bg-red-100 transition-colors">
                        ✗ Vote Against
                      </button>
                    </div>
                  )}
                  {hasVoted && (
                    <p className="text-xs text-gray-400 text-center py-1">
                      You&apos;ve already voted on this proposal
                    </p>
                  )}
                </div>
              );
            })}

            {votes.length === 0 && (
              <div className="card text-center py-8">
                <Vote className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-400 text-sm">No active votes</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
