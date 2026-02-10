"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft, Users, BarChart3, Vote, Crown,
  Shield, BookOpen, CheckCircle, XCircle, Clock, AlertTriangle,
  ChevronRight, UserPlus, Share2
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  getGroupById, getGroupTransactions, getConstitutionRules,
  getRuleAcceptances, getGroupVotes, castVote as castVoteDb
} from "@/lib/database";
import {
  formatCurrency, getScoreColor, getRoleBadgeColor
} from "@/lib/types";
import type { GroupWithDetails, Transaction, ConstitutionRule, Vote as VoteType } from "@/lib/types";
import LoadingSpinner from "@/components/LoadingSpinner";

type Tab = "ledger" | "members" | "constitution" | "votes";

export default function GroupDetailPage() {
  const params = useParams();
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("ledger");
  const [group, setGroup] = useState<GroupWithDetails | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [rules, setRules] = useState<ConstitutionRule[]>([]);
  const [ruleAcceptances, setRuleAcceptances] = useState<Record<string, string[]>>({});
  const [votes, setVotes] = useState<VoteType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!params.id) return;
      try {
        const groupData = await getGroupById(params.id as string);
        if (groupData) {
          setGroup(groupData);
          const [txData, rulesData, votesData] = await Promise.all([
            getGroupTransactions(groupData.id),
            getConstitutionRules(groupData.id),
            getGroupVotes(groupData.id),
          ]);
          setTransactions(txData);
          setRules(rulesData);
          setVotes(votesData);

          if (rulesData.length > 0) {
            const acceptances = await getRuleAcceptances(rulesData.map((r) => r.id));
            setRuleAcceptances(acceptances);
          }
        }
      } catch (err) {
        console.error("Failed to load group:", err);
      } finally {
        setLoading(false);
      }
    }
    if (!authLoading) loadData();
  }, [params.id, authLoading]);

  const handleVote = async (voteId: string, value: "for" | "against") => {
    if (!user) return;
    await castVoteDb(voteId, user.id, value);
    // Refresh votes
    if (group) {
      const votesData = await getGroupVotes(group.id);
      setVotes(votesData);
    }
  };

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "ledger", label: "Ledger", icon: <BarChart3 className="w-4 h-4" /> },
    { id: "members", label: "Members", icon: <Users className="w-4 h-4" /> },
    { id: "constitution", label: "Rules", icon: <BookOpen className="w-4 h-4" /> },
    { id: "votes", label: "Votes", icon: <Vote className="w-4 h-4" /> },
  ];

  if (authLoading || loading) {
    return (
      <div className="max-w-lg mx-auto pt-20">
        <LoadingSpinner message="Loading group..." />
      </div>
    );
  }

  if (!group) {
    return (
      <div className="max-w-lg mx-auto pt-20 text-center px-4">
        <Users className="w-10 h-10 text-gray-300 mx-auto mb-3" />
        <h2 className="font-semibold text-kasi-charcoal mb-1">Group not found</h2>
        <p className="text-gray-400 text-sm mb-4">This Stokvel doesn&apos;t exist or you don&apos;t have access</p>
        <Link href="/groups" className="btn-primary text-sm inline-block">Back to Stokvels</Link>
      </div>
    );
  }

  const currentRoundTransactions = transactions.filter(
    (t) => t.round === group.current_round && t.type === "contribution"
  );

  const payoutOrder = group.members.map((m, i) => ({
    member: m,
    round: m.payout_position || i + 1,
    isPaid: (m.payout_position || i + 1) < group.current_round,
    isCurrent: (m.payout_position || i + 1) === group.current_round,
    isFuture: (m.payout_position || i + 1) > group.current_round,
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

        <div className="grid grid-cols-3 gap-2">
          <div className="bg-white/10 rounded-xl p-3 text-center">
            <p className="text-white/60 text-[10px] mb-1">Pool</p>
            <p className="text-white font-bold text-sm">{formatCurrency(group.total_pool)}</p>
          </div>
          <div className="bg-white/10 rounded-xl p-3 text-center">
            <p className="text-white/60 text-[10px] mb-1">Round</p>
            <p className="text-white font-bold text-sm">{group.current_round}/{group.total_rounds}</p>
          </div>
          <div className="bg-white/10 rounded-xl p-3 text-center">
            <p className="text-white/60 text-[10px] mb-1">Next Payout</p>
            <p className="text-kasi-gold font-bold text-sm">{formatCurrency(group.contribution_amount * group.max_members)}</p>
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
            <div className="card">
              <h3 className="font-semibold text-sm text-kasi-charcoal mb-4">Payout Rotation</h3>
              {payoutOrder.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-4">No members yet</p>
              ) : (
                <div className="space-y-2">
                  {payoutOrder.map(({ member, round, isPaid, isCurrent }) => (
                    <div
                      key={member.user_id}
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
                        <p className="text-sm font-medium text-kasi-charcoal">{member.profile?.name || "Member"}</p>
                        <p className="text-xs text-gray-400">
                          {isPaid ? "Paid out" : isCurrent ? "Current round" : `Round ${round}`}
                        </p>
                      </div>
                      <div>
                        {isPaid && <CheckCircle className="w-5 h-5 text-emerald-500" />}
                        {isCurrent && (
                          <span className="badge-gold text-[10px]">
                            Next: {formatCurrency(group.contribution_amount * group.max_members)}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {currentRoundTransactions.length > 0 && (
              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-sm text-kasi-charcoal">
                    Round {group.current_round} Contributions
                  </h3>
                  <span className="text-xs text-gray-400">
                    {currentRoundTransactions.filter((t) => t.status === "completed").length}/{group.member_count} paid
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
                        <p className="text-sm font-medium text-kasi-charcoal">{tx.member_name}</p>
                        <p className="text-xs text-gray-400">
                          {tx.created_at ? new Date(tx.created_at).toLocaleDateString("en-ZA") : "Awaiting payment"}
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
            )}

            {/* Recent payouts */}
            {transactions.filter((t) => t.type === "payout").length > 0 && (
              <div className="card">
                <h3 className="font-semibold text-sm text-kasi-charcoal mb-4">Recent Payouts</h3>
                <div className="space-y-2">
                  {transactions
                    .filter((t) => t.type === "payout")
                    .slice(0, 5)
                    .map((tx) => (
                      <div key={tx.id} className="flex items-center gap-3 py-2">
                        <div className="w-8 h-8 bg-kasi-gold/10 rounded-full flex items-center justify-center">
                          <Crown className="w-4 h-4 text-kasi-gold" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-kasi-charcoal">{tx.member_name}</p>
                          <p className="text-xs text-gray-400">Round {tx.round} · {new Date(tx.created_at).toLocaleDateString("en-ZA")}</p>
                        </div>
                        <span className="text-sm font-semibold text-kasi-gold">
                          {formatCurrency(tx.amount)}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {transactions.length === 0 && (
              <div className="card text-center py-8">
                <BarChart3 className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-400 text-sm">No transactions yet</p>
                <p className="text-gray-300 text-xs mt-1">Contributions will appear here</p>
              </div>
            )}
          </>
        )}

        {/* ===== MEMBERS TAB ===== */}
        {activeTab === "members" && (
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-sm text-kasi-charcoal">
                Members ({group.member_count}/{group.max_members})
              </h3>
              <button className="text-xs text-kasi-green font-medium flex items-center gap-1">
                <UserPlus className="w-3.5 h-3.5" /> Invite
              </button>
            </div>
            {group.members.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-8">No members yet. Share the invite link!</p>
            ) : (
              <div className="space-y-2">
                {group.members.map((member) => (
                  <div key={member.user_id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 transition-colors">
                    <div className="w-10 h-10 bg-kasi-green/10 rounded-full flex items-center justify-center">
                      <span className="text-kasi-green font-bold text-xs">{member.profile?.avatar_initials || "?"}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-kasi-charcoal truncate">{member.profile?.name || "Member"}</p>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium capitalize ${getRoleBadgeColor(member.role)}`}>
                          {member.role === "chairperson" && <Crown className="w-2.5 h-2.5 inline mr-0.5" />}
                          {member.role}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400">
                        Score: <span className={`font-semibold ${getScoreColor(member.commitment_score)}`}>
                          {Math.round(member.commitment_score)}%
                        </span>
                        {" · "}{member.cycles_completed} cycles
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ===== CONSTITUTION TAB ===== */}
        {activeTab === "constitution" && (
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5 text-kasi-green" />
              <h3 className="font-semibold text-sm text-kasi-charcoal">Digital Constitution</h3>
            </div>
            <p className="text-xs text-gray-400 mb-4">
              All members must agree to these rules before joining. Changes require a majority vote.
            </p>
            {rules.length === 0 ? (
              <div className="text-center py-8">
                <BookOpen className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-400 text-sm">No rules set yet</p>
                <p className="text-gray-300 text-xs mt-1">The chairperson can add constitution rules</p>
              </div>
            ) : (
              <div className="space-y-3">
                {rules.map((rule, i) => (
                  <div key={rule.id} className="border border-gray-100 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <span className="w-6 h-6 bg-kasi-green/10 rounded-lg flex items-center justify-center text-xs font-bold text-kasi-green flex-shrink-0">
                        {i + 1}
                      </span>
                      <div className="flex-1">
                        <h4 className="font-medium text-sm text-kasi-charcoal mb-1">{rule.title}</h4>
                        <p className="text-xs text-gray-500 leading-relaxed">{rule.description}</p>
                        <p className="text-[10px] text-gray-400 mt-2">
                          ✓ Accepted by {(ruleAcceptances[rule.id] || []).length}/{group.member_count} members
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ===== VOTES TAB ===== */}
        {activeTab === "votes" && (
          <>
            {votes.length === 0 ? (
              <div className="card text-center py-8">
                <Vote className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-400 text-sm">No votes yet</p>
                <p className="text-gray-300 text-xs mt-1">Proposals will appear here when submitted</p>
              </div>
            ) : (
              votes.map((vote) => {
                const totalVotes = (vote.votes_for?.length || 0) + (vote.votes_against?.length || 0);
                const forPercent = totalVotes > 0 ? ((vote.votes_for?.length || 0) / totalVotes) * 100 : 0;
                const hasVoted = user && (vote.votes_for?.includes(user.id) || vote.votes_against?.includes(user.id));

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

                    <div className="mb-3">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-emerald-600 font-medium">For: {vote.votes_for?.length || 0}</span>
                        <span className="text-red-500 font-medium">Against: {vote.votes_against?.length || 0}</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden flex">
                        <div className="h-full bg-emerald-500 rounded-l-full" style={{ width: `${forPercent}%` }} />
                        <div className="h-full bg-red-400 rounded-r-full" style={{ width: `${100 - forPercent}%` }} />
                      </div>
                      <p className="text-[10px] text-gray-400 mt-1">
                        {totalVotes}/{group.member_count} members voted · Expires {new Date(vote.expires_at).toLocaleDateString("en-ZA")}
                      </p>
                    </div>

                    {vote.status === "active" && !hasVoted && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleVote(vote.id, "for")}
                          className="flex-1 py-2 bg-emerald-50 text-emerald-600 text-sm font-medium rounded-xl hover:bg-emerald-100 transition-colors"
                        >
                          ✓ Vote For
                        </button>
                        <button
                          onClick={() => handleVote(vote.id, "against")}
                          className="flex-1 py-2 bg-red-50 text-red-500 text-sm font-medium rounded-xl hover:bg-red-100 transition-colors"
                        >
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
              })
            )}
          </>
        )}
      </div>
    </div>
  );
}
