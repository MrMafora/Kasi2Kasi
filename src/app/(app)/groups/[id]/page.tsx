"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft, Users, BarChart3, Vote, Crown,
  Shield, BookOpen, CheckCircle, XCircle, Clock, AlertTriangle,
  ChevronRight, UserPlus, Share2, Plus, Send, Copy, Check, Banknote,
  Target, Receipt, MessageCircle
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { createClient } from "@/lib/supabase/client";
import {
  getGroupById, getGroupTransactions, getConstitutionRules,
  getRuleAcceptances, getGroupVotes, castVote as castVoteDb,
  recordContribution, createVote as createVoteDb,
  addConstitutionRule, acceptRule as acceptRuleDb,
  processPayout, notifyGroupMembers,
  recordGoalContribution, getGroupExpenses, recordExpense
} from "@/lib/database";
import {
  formatCurrency, getScoreColor, getRoleBadgeColor
} from "@/lib/types";
import type { GroupWithDetails, Transaction, ConstitutionRule, Vote as VoteType, Expense } from "@/lib/types";
import { HeaderSkeleton, ListSkeleton } from "@/components/Skeleton";
import ActivityFeed from "@/components/ActivityFeed";
import { useToast } from "@/components/Toast";

type StokvelTab = "ledger" | "members" | "constitution" | "votes";
type GoalTab = "contributions" | "expenses" | "members";

export default function GroupDetailPage() {
  const params = useParams();
  const { user, profile, loading: authLoading } = useAuth();
  const { success: toastSuccess, error: toastError, warning: toastWarning } = useToast();
  const [activeTab, setActiveTab] = useState<StokvelTab | GoalTab>("ledger");
  const [group, setGroup] = useState<GroupWithDetails | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [rules, setRules] = useState<ConstitutionRule[]>([]);
  const [ruleAcceptances, setRuleAcceptances] = useState<Record<string, string[]>>({});
  const [votes, setVotes] = useState<VoteType[]>([]);
  const [loading, setLoading] = useState(true);

  // Contribution modal state
  const [showContributeModal, setShowContributeModal] = useState(false);
  const [contributionNote, setContributionNote] = useState("");
  const [contributionAmount, setContributionAmount] = useState("");
  const [contributionSubmitting, setContributionSubmitting] = useState(false);
  const [contributionSuccess, setContributionSuccess] = useState(false);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [uploadingReceipt, setUploadingReceipt] = useState(false);

  // Expense modal state
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [expenseDesc, setExpenseDesc] = useState("");
  const [expenseAmount, setExpenseAmount] = useState("");
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split("T")[0]);
  const [expenseSubmitting, setExpenseSubmitting] = useState(false);

  // Create vote modal state
  const [showCreateVoteModal, setShowCreateVoteModal] = useState(false);
  const [voteTitle, setVoteTitle] = useState("");
  const [voteDescription, setVoteDescription] = useState("");
  const [voteType, setVoteType] = useState<"general" | "role_change" | "rule_change" | "member_exit">("general");
  const [voteSubmitting, setVoteSubmitting] = useState(false);

  // Add rule state
  const [showAddRuleModal, setShowAddRuleModal] = useState(false);
  const [ruleTitle, setRuleTitle] = useState("");
  const [ruleDescription, setRuleDescription] = useState("");
  const [ruleSubmitting, setRuleSubmitting] = useState(false);

  // Share state
  const [copied, setCopied] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);

  // Member detail state
  const [selectedMember, setSelectedMember] = useState<any>(null);

  // Payout modal state
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [payoutSubmitting, setPayoutSubmitting] = useState(false);
  const [payoutSuccess, setPayoutSuccess] = useState(false);

  const isGoal = group?.type === "goal";

  useEffect(() => {
    async function loadData() {
      if (!params.id) return;
      try {
        const groupData = await getGroupById(params.id as string);
        if (groupData) {
          setGroup(groupData);
          // Set default tab based on type
          if (groupData.type === "goal") {
            setActiveTab("contributions");
          }
          const [txData, rulesData, votesData] = await Promise.all([
            getGroupTransactions(groupData.id),
            getConstitutionRules(groupData.id),
            getGroupVotes(groupData.id),
          ]);
          setTransactions(txData);
          setRules(rulesData);
          setVotes(votesData);

          // Load expenses for goal funds
          if (groupData.type === "goal") {
            const expData = await getGroupExpenses(groupData.id);
            setExpenses(expData);
          }

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

  const refreshData = async () => {
    if (!group) return;
    const promises: Promise<any>[] = [
      getGroupTransactions(group.id),
      getConstitutionRules(group.id),
      getGroupVotes(group.id),
      getGroupById(group.id),
    ];
    if (isGoal) promises.push(getGroupExpenses(group.id));

    const results = await Promise.all(promises);
    setTransactions(results[0]);
    setRules(results[1]);
    setVotes(results[2]);
    if (results[3]) setGroup(results[3]);
    if (isGoal && results[4]) setExpenses(results[4]);
    if (results[1].length > 0) {
      const acceptances = await getRuleAcceptances(results[1].map((r: ConstitutionRule) => r.id));
      setRuleAcceptances(acceptances);
    }
  };

  // ===== HANDLERS =====

  const handleVote = async (voteId: string, value: "for" | "against") => {
    if (!user) return;
    await castVoteDb(voteId, user.id, value);
    if (group) {
      const votesData = await getGroupVotes(group.id);
      setVotes(votesData);
    }
  };

  const uploadReceipt = async (): Promise<string | null> => {
    if (!receiptFile || !user) return null;
    setUploadingReceipt(true);
    try {
      const supabase = createClient();
      const ext = receiptFile.name.split(".").pop() || "jpg";
      const filePath = `${group!.id}/${user.id}/${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("receipts").upload(filePath, receiptFile);
      if (error) {
        console.error("Receipt upload failed:", error);
        return null;
      }
      const { data: { publicUrl } } = supabase.storage.from("receipts").getPublicUrl(filePath);
      return publicUrl;
    } catch (err) {
      console.error("Receipt upload failed:", err);
      return null;
    } finally {
      setUploadingReceipt(false);
    }
  };

  const handleContribute = async () => {
    if (!user || !group) return;
    setContributionSubmitting(true);
    try {
      // Upload receipt if attached
      const receiptUrl = await uploadReceipt();
      const noteWithReceipt = receiptUrl
        ? `[Receipt: ${receiptUrl}]${contributionNote ? ` ${contributionNote}` : ""}`
        : contributionNote || undefined;

      if (isGoal) {
        const amount = parseFloat(contributionAmount);
        if (!amount || amount <= 0) {
          toastWarning("Please enter a valid amount");
          setContributionSubmitting(false);
          return;
        }
        const { error } = await recordGoalContribution({
          group_id: group.id,
          member_id: user.id,
          amount,
          note: noteWithReceipt,
        });
        if (error) {
          toastError(error.message || "Failed to record contribution");
        } else {
          setContributionSuccess(true);
          setContributionNote("");
          setContributionAmount("");
          setReceiptFile(null);
          await notifyGroupMembers(
            group.id,
            "Contribution Received",
            `${profile?.name || "A member"} contributed ${formatCurrency(amount)} to the goal fund`,
            "payment",
            user.id
          );
          await refreshData();
          setTimeout(() => {
            setShowContributeModal(false);
            setContributionSuccess(false);
          }, 2000);
        }
      } else {
        const { error } = await recordContribution({
          group_id: group.id,
          member_id: user.id,
          amount: group.contribution_amount,
          round: group.current_round,
          note: noteWithReceipt,
        });
        if (error) {
          toastError(error.message || "Failed to record contribution");
        } else {
          setContributionSuccess(true);
          setContributionNote("");
          setReceiptFile(null);
          await notifyGroupMembers(
            group.id,
            "Contribution Received",
            `${profile?.name || "A member"} contributed ${formatCurrency(group.contribution_amount)} for Round ${group.current_round}`,
            "payment",
            user.id
          );
          try {
            if (user.email) {
              await fetch("/api/email", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  type: "contribution",
                  to: user.email,
                  name: profile?.name || "Member",
                  groupName: group.name,
                  amount: group.contribution_amount,
                  round: group.current_round,
                }),
              });
            }
          } catch (err) {
            console.error("Failed to send contribution receipt:", err);
          }
          await refreshData();
          setTimeout(() => {
            setShowContributeModal(false);
            setContributionSuccess(false);
          }, 2000);
        }
      }
    } catch {
      toastError("Failed to record contribution");
    } finally {
      setContributionSubmitting(false);
    }
  };

  const handleRecordExpense = async () => {
    if (!group) return;
    setExpenseSubmitting(true);
    try {
      const amount = parseFloat(expenseAmount);
      if (!amount || amount <= 0 || !expenseDesc.trim()) {
        toastWarning("Please fill in all fields");
        setExpenseSubmitting(false);
        return;
      }
      const { error } = await recordExpense({
        group_id: group.id,
        description: expenseDesc,
        amount,
        date: expenseDate,
      });
      if (error) {
        toastError(error.message || "Failed to record expense");
      } else {
        await notifyGroupMembers(
          group.id,
          "Expense Recorded",
          `Expense: ${expenseDesc} — ${formatCurrency(amount)}`,
          "payment"
        );
        setExpenseDesc("");
        setExpenseAmount("");
        setExpenseDate(new Date().toISOString().split("T")[0]);
        setShowExpenseModal(false);
        await refreshData();
      }
    } catch {
      toastError("Failed to record expense");
    } finally {
      setExpenseSubmitting(false);
    }
  };

  const handleCreateVote = async () => {
    if (!user || !group) return;
    setVoteSubmitting(true);
    try {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);
      const { error } = await createVoteDb({
        group_id: group.id,
        title: voteTitle,
        description: voteDescription,
        proposed_by: user.id,
        type: voteType,
        expires_at: expiresAt.toISOString(),
      });
      if (error) {
        toastError(error.message || "Failed to create vote");
      } else {
        await notifyGroupMembers(group.id, "New Proposal", `${profile?.name || "A member"} proposed: "${voteTitle}"`, "vote", user.id);
        setVoteTitle("");
        setVoteDescription("");
        setVoteType("general");
        setShowCreateVoteModal(false);
        await refreshData();
      }
    } catch {
      toastError("Failed to create vote");
    } finally {
      setVoteSubmitting(false);
    }
  };

  const handleAddRule = async () => {
    if (!group) return;
    setRuleSubmitting(true);
    try {
      const { error } = await addConstitutionRule(group.id, ruleTitle, ruleDescription, rules.length + 1);
      if (error) {
        toastError(error.message || "Failed to add rule");
      } else {
        setRuleTitle("");
        setRuleDescription("");
        setShowAddRuleModal(false);
        await refreshData();
      }
    } catch {
      toastError("Failed to add rule");
    } finally {
      setRuleSubmitting(false);
    }
  };

  const handleAcceptRule = async (ruleId: string) => {
    if (!user || !group) return;
    const { error } = await acceptRuleDb(ruleId, user.id);
    if (error) return;

    await refreshData();

    // Find the rule that was accepted
    const rule = rules.find(r => r.id === ruleId);
    if (!rule) return;

    const acceptedCount = (ruleAcceptances[ruleId]?.length || 0) + 1;
    const signerName = profile?.name || "A member";

    // Notify other members (in-app)
    try {
      await notifyGroupMembers(
        group.id,
        "Constitution Rule Signed ✍️",
        `${signerName} accepted "${rule.title}" (${acceptedCount}/${group.member_count} signed)`,
        "system",
        user.id
      );
    } catch {}

    // Email other members (fire-and-forget)
    const otherMembers = (group.members || []).filter(
      (m: any) => m.user_id !== user.id && m.profile?.email
    );
    for (const member of otherMembers) {
      fetch("/api/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "rule_accepted",
          to: member.profile?.email,
          recipientName: member.profile?.name || "Member",
          signerName,
          groupName: group.name,
          ruleTitle: rule.title,
          acceptedCount,
          totalMembers: group.member_count,
        }),
      }).catch(() => {}); // fire-and-forget
    }
  };

  const handleCopyLink = async () => {
    const inviteUrl = `${window.location.origin}/groups/${group?.id}/join`;
    try {
      await navigator.clipboard.writeText(inviteUrl);
    } catch {
      // Fallback for HTTP (no clipboard API)
      const textArea = document.createElement("textarea");
      textArea.value = inviteUrl;
      textArea.style.position = "fixed";
      textArea.style.opacity = "0";
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
    }
    setCopied(true);
    setShowShareMenu(false);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareWhatsApp = () => {
    const inviteUrl = `${window.location.origin}/groups/${group?.id}/join`;
    const text = `Join my ${isGoal ? "Goal Fund" : "Stokvel"} "${group?.name}" on Kasi2Kasi! ${inviteUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
    setShowShareMenu(false);
  };

  const handleShare = () => {
    setShowShareMenu(!showShareMenu);
  };

  const handlePayout = async () => {
    if (!user || !group) return;
    const currentRecipient = payoutOrder.find((p) => p.isCurrent);
    if (!currentRecipient) return;
    setPayoutSubmitting(true);
    try {
      const { error } = await processPayout({
        group_id: group.id,
        recipient_id: currentRecipient.member.user_id,
      });
      if (error) {
        toastError(error.message || "Failed to process payout");
      } else {
        setPayoutSuccess(true);
        const payoutAmount = group.contribution_amount * group.max_members;
        await notifyGroupMembers(group.id, "Payout Processed! 🎉", `${currentRecipient.member.profile?.name || "A member"} received ${formatCurrency(payoutAmount)} for Round ${group.current_round}`, "payout");
        await refreshData();
        setTimeout(() => { setShowPayoutModal(false); setPayoutSuccess(false); }, 2500);
      }
    } catch {
      toastError("Failed to process payout");
    } finally {
      setPayoutSubmitting(false);
    }
  };

  const isChairperson = group?.members.some(
    (m) => m.user_id === user?.id && m.role === "chairperson"
  );
  const isChairOrTreasurer = group?.members.some(
    (m) => m.user_id === user?.id && (m.role === "chairperson" || m.role === "treasurer")
  );
  const alreadyContributedThisRound = transactions.some(
    (t) => t.type === "contribution" && t.round === group?.current_round && t.member_id === user?.id && t.status === "completed"
  );
  const roundContributionCount = transactions.filter(
    (t) => t.type === "contribution" && t.round === group?.current_round && t.status === "completed"
  ).length;
  const allContributed = roundContributionCount >= (group?.member_count || 0);

  // Goal fund calculations
  const totalContributed = isGoal ? transactions.filter(t => t.type === "contribution" && t.status === "completed").reduce((s, t) => s + t.amount, 0) : 0;
  const totalExpenses = isGoal ? expenses.reduce((s, e) => s + e.amount, 0) : 0;
  const goalBalance = totalContributed - totalExpenses;
  const monthlyTarget = group?.goal_monthly_target || 0;
  const progressPercent = monthlyTarget > 0 ? Math.min((group?.total_pool || 0) / monthlyTarget * 100, 100) : 0;

  const payoutOrder = (group?.members || []).map((m, i) => ({
    member: m,
    round: m.payout_position || i + 1,
    isPaid: (m.payout_position || i + 1) < (group?.current_round || 0),
    isCurrent: (m.payout_position || i + 1) === (group?.current_round || 0),
    isFuture: (m.payout_position || i + 1) > (group?.current_round || 0),
  }));

  // ===== LOADING / NOT FOUND =====
  if (authLoading || loading) {
    return (
      <div className="max-w-lg mx-auto">
        <HeaderSkeleton />
        <div className="px-4 mt-4">
          <ListSkeleton rows={4} />
        </div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="max-w-lg mx-auto pt-20 text-center px-4">
        <Users className="w-10 h-10 text-gray-300 mx-auto mb-3" />
        <h2 className="font-semibold text-kasi-charcoal mb-1">Group not found</h2>
        <p className="text-gray-400 text-sm mb-4">This group doesn&apos;t exist or you don&apos;t have access</p>
        <Link href="/groups" className="btn-primary text-sm inline-block">Back to Groups</Link>
      </div>
    );
  }

  // ===== TABS =====
  const stokvelTabs: { id: StokvelTab; label: string; icon: React.ReactNode }[] = [
    { id: "ledger", label: "Ledger", icon: <BarChart3 className="w-4 h-4" /> },
    { id: "members", label: "Members", icon: <Users className="w-4 h-4" /> },
    { id: "constitution", label: "Rules", icon: <BookOpen className="w-4 h-4" /> },
    { id: "votes", label: "Votes", icon: <Vote className="w-4 h-4" /> },
  ];

  const goalTabs: { id: GoalTab; label: string; icon: React.ReactNode }[] = [
    { id: "contributions", label: "Contributions", icon: <Banknote className="w-4 h-4" /> },
    { id: "expenses", label: "Expenses", icon: <Receipt className="w-4 h-4" /> },
    { id: "members", label: "Members", icon: <Users className="w-4 h-4" /> },
  ];

  const tabs = isGoal ? goalTabs : stokvelTabs;
  const currentRoundTransactions = transactions.filter(
    (t) => t.round === group.current_round && t.type === "contribution"
  );

  return (
    <div className="max-w-lg mx-auto">
      {/* Header */}
      <div className="gradient-green px-4 pt-10 pb-6 rounded-b-3xl relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-white/5 rounded-full blur-2xl" />
        <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-kasi-gold/10 rounded-full blur-2xl" />
        <div className="flex items-center gap-3 mb-4 relative z-10">
          <Link href="/groups" className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
            <ArrowLeft className="w-4 h-4 text-white" />
          </Link>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-white font-bold text-lg">{group.name}</h1>
              {isGoal && <span className="text-[10px] bg-kasi-gold/20 text-kasi-gold px-2 py-0.5 rounded-full font-medium">Goal Fund</span>}
            </div>
            <p className="text-white/60 text-xs">{group.description}</p>
          </div>
          <div className="relative">
            <button
              onClick={handleShare}
              className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center"
            >
              {copied ? <Check className="w-4 h-4 text-kasi-gold" /> : <Share2 className="w-4 h-4 text-white" />}
            </button>
            {/* Share dropdown */}
            {showShareMenu && (
              <div className="absolute right-0 top-10 bg-white rounded-xl shadow-lg border border-gray-100 py-2 w-48 z-50 animate-fade-in">
                <button onClick={handleCopyLink} className="w-full px-4 py-2.5 text-left text-sm text-kasi-charcoal hover:bg-gray-50 flex items-center gap-2">
                  <Copy className="w-4 h-4 text-gray-400" /> Copy invite link
                </button>
                <button onClick={handleShareWhatsApp} className="w-full px-4 py-2.5 text-left text-sm text-kasi-charcoal hover:bg-gray-50 flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-green-500" /> Share via WhatsApp
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Toast for copy */}
        {copied && (
          <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-kasi-charcoal text-white text-xs px-3 py-1.5 rounded-full animate-fade-in z-50">
            Link copied! ✓
          </div>
        )}

        {isGoal ? (
          /* Goal Fund header stats */
          <>
            {/* Progress bar */}
            {monthlyTarget > 0 && (
              <div className="mb-3">
                <div className="flex justify-between text-[10px] text-white/60 mb-1">
                  <span>Pool: {formatCurrency(group.total_pool)}</span>
                  <span>Target: {formatCurrency(monthlyTarget)}/mo</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-kasi-gold rounded-full transition-all" style={{ width: `${progressPercent}%` }} />
                </div>
              </div>
            )}
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-white/10 rounded-xl p-3 text-center">
                <p className="text-white/60 text-[10px] mb-1">Contributed</p>
                <p className="text-white font-bold text-sm">{formatCurrency(totalContributed)}</p>
              </div>
              <div className="bg-white/10 rounded-xl p-3 text-center">
                <p className="text-white/60 text-[10px] mb-1">Expenses</p>
                <p className="text-white font-bold text-sm">{formatCurrency(totalExpenses)}</p>
              </div>
              <div className="bg-white/10 rounded-xl p-3 text-center">
                <p className="text-white/60 text-[10px] mb-1">Balance</p>
                <p className="text-kasi-gold font-bold text-sm">{formatCurrency(goalBalance)}</p>
              </div>
            </div>
          </>
        ) : (
          /* Stokvel header stats */
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
        )}
      </div>

      {/* Tabs */}
      <div className="px-4 -mt-3">
        <div className="card !p-1 flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-medium transition-all ${activeTab === tab.id
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

        {/* ===== GOAL: CONTRIBUTIONS TAB ===== */}
        {isGoal && activeTab === "contributions" && (
          <>
            <button
              onClick={() => setShowContributeModal(true)}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              Record Contribution
            </button>

            {/* Activity Feed */}
            <ActivityFeed transactions={transactions} expenses={expenses} limit={10} />

            {/* All contributions */}
            {transactions.filter(t => t.type === "contribution").length > 0 && (
              <div className="card">
                <h3 className="font-semibold text-sm text-kasi-charcoal mb-4">All Contributions</h3>
                <div className="space-y-2">
                  {transactions.filter(t => t.type === "contribution").map((tx) => (
                    <div key={tx.id} className="flex items-center gap-3 py-2">
                      <div className="w-8 h-8 bg-emerald-50 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-kasi-charcoal">{tx.member_name}</p>
                        <p className="text-xs text-gray-400">
                          {new Date(tx.created_at).toLocaleDateString("en-ZA")}
                          {tx.note && !tx.note.startsWith("[Receipt:") && ` · ${tx.note}`}
                          {tx.note && tx.note.startsWith("[Receipt:") && tx.note.replace(/^\[Receipt: [^\]]+\]\s*/, "") && ` · ${tx.note.replace(/^\[Receipt: [^\]]+\]\s*/, "")}`}
                        </p>
                      </div>
                      {tx.note?.startsWith("[Receipt:") && (
                        <a
                          href={tx.note.match(/\[Receipt: ([^\]]+)\]/)?.[1] || "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-kasi-green hover:text-kasi-green-dark mr-1"
                          title="View receipt"
                        >
                          <Receipt className="w-4 h-4" />
                        </a>
                      )}
                      <span className="text-sm font-semibold text-emerald-600">{formatCurrency(tx.amount)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {transactions.length === 0 && (
              <div className="card text-center py-8">
                <Target className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-400 text-sm">No contributions yet</p>
                <p className="text-gray-300 text-xs mt-1">Be the first to contribute!</p>
              </div>
            )}
          </>
        )}

        {/* ===== GOAL: EXPENSES TAB ===== */}
        {isGoal && activeTab === "expenses" && (
          <>
            {isChairOrTreasurer && (
              <button
                onClick={() => setShowExpenseModal(true)}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                <Receipt className="w-4 h-4" />
                Record Expense
              </button>
            )}

            {expenses.length > 0 ? (
              <div className="card">
                <h3 className="font-semibold text-sm text-kasi-charcoal mb-4">All Expenses</h3>
                <div className="space-y-2">
                  {expenses.map((exp) => (
                    <div key={exp.id} className="flex items-center gap-3 py-2">
                      <div className="w-8 h-8 bg-red-50 rounded-full flex items-center justify-center">
                        <Receipt className="w-4 h-4 text-red-500" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-kasi-charcoal">{exp.description}</p>
                        <p className="text-xs text-gray-400">
                          {new Date(exp.date).toLocaleDateString("en-ZA")} · by {exp.recorder_name}
                        </p>
                      </div>
                      <span className="text-sm font-semibold text-red-500">-{formatCurrency(exp.amount)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="card text-center py-8">
                <Receipt className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-400 text-sm">No expenses recorded</p>
                {isChairOrTreasurer && <p className="text-gray-300 text-xs mt-1">Tap above to record an expense</p>}
              </div>
            )}
          </>
        )}

        {/* ===== STOKVEL: LEDGER TAB ===== */}
        {!isGoal && activeTab === "ledger" && (
          <>
            {!alreadyContributedThisRound && (
              <button onClick={() => setShowContributeModal(true)} className="btn-primary w-full flex items-center justify-center gap-2">
                <Send className="w-4 h-4" />
                Record Round {group.current_round} Contribution · {formatCurrency(group.contribution_amount)}
              </button>
            )}
            {alreadyContributedThisRound && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <p className="text-sm text-emerald-700 font-medium">Round {group.current_round} contribution recorded ✓</p>
              </div>
            )}

            {isChairOrTreasurer && (
              <div className="card border border-kasi-gold/20 bg-kasi-gold/5">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="text-sm font-semibold text-kasi-charcoal">Process Payout</h4>
                    <p className="text-xs text-gray-500 mt-0.5">{roundContributionCount}/{group.member_count} members contributed this round</p>
                  </div>
                  <div className={`text-xs font-medium px-2 py-1 rounded-full ${allContributed ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                    {allContributed ? "Ready" : "Waiting"}
                  </div>
                </div>
                <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden mb-3">
                  <div className={`h-full rounded-full transition-all ${allContributed ? "bg-emerald-500" : "bg-amber-400"}`} style={{ width: `${group.member_count > 0 ? (roundContributionCount / group.member_count) * 100 : 0}%` }} />
                </div>
                <button onClick={() => setShowPayoutModal(true)} disabled={!allContributed} className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed">
                  <Banknote className="w-4 h-4" />
                  {allContributed ? `Pay Out ${formatCurrency(group.contribution_amount * group.max_members)}` : `Waiting for ${group.member_count - roundContributionCount} more`}
                </button>
              </div>
            )}

            {/* Activity Feed for stokvel */}
            <ActivityFeed transactions={transactions} expenses={[]} limit={8} />

            <div className="card">
              <h3 className="font-semibold text-sm text-kasi-charcoal mb-4">Payout Rotation</h3>
              {payoutOrder.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-4">No members yet</p>
              ) : (
                <div className="space-y-2">
                  {payoutOrder.map(({ member, round, isPaid, isCurrent }) => (
                    <div key={member.user_id} className={`flex items-center gap-3 p-2.5 rounded-xl transition-all ${isCurrent ? "bg-kasi-gold/10 border border-kasi-gold/20" : ""}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${isPaid ? "bg-emerald-100 text-emerald-600" : isCurrent ? "bg-kasi-gold/20 text-kasi-gold-dark" : "bg-gray-100 text-gray-400"}`}>{round}</div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-kasi-charcoal">{member.profile?.name || "Member"}</p>
                        <p className="text-xs text-gray-400">{isPaid ? "Paid out" : isCurrent ? "Current round" : `Round ${round}`}</p>
                      </div>
                      <div>
                        {isPaid && <CheckCircle className="w-5 h-5 text-emerald-500" />}
                        {isCurrent && <span className="badge-gold text-[10px]">Next: {formatCurrency(group.contribution_amount * group.max_members)}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {currentRoundTransactions.length > 0 && (
              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-sm text-kasi-charcoal">Round {group.current_round} Contributions</h3>
                  <span className="text-xs text-gray-400">{currentRoundTransactions.filter((t) => t.status === "completed").length}/{group.member_count} paid</span>
                </div>
                <div className="space-y-2">
                  {currentRoundTransactions.map((tx) => (
                    <div key={tx.id} className="flex items-center gap-3 py-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${tx.status === "completed" ? "bg-emerald-50 text-emerald-600" : tx.status === "late" ? "bg-amber-50 text-amber-600" : tx.status === "pending" ? "bg-gray-100 text-gray-400" : "bg-red-50 text-red-600"}`}>
                        {tx.status === "completed" ? <CheckCircle className="w-4 h-4" /> : tx.status === "late" ? <AlertTriangle className="w-4 h-4" /> : tx.status === "pending" ? <Clock className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-kasi-charcoal">{tx.member_name}</p>
                        <p className="text-xs text-gray-400">{tx.created_at ? new Date(tx.created_at).toLocaleDateString("en-ZA") : "Awaiting payment"}{tx.status === "late" && " · Late"}</p>
                      </div>
                      {tx.note?.startsWith("[Receipt:") && (
                        <a href={tx.note.match(/\[Receipt: ([^\]]+)\]/)?.[1] || "#"} target="_blank" rel="noopener noreferrer" className="text-kasi-green hover:text-kasi-green-dark mr-1" title="View receipt">
                          <Receipt className="w-4 h-4" />
                        </a>
                      )}
                      <span className={`text-sm font-semibold ${tx.status === "completed" ? "text-emerald-600" : tx.status === "late" ? "text-amber-600" : "text-gray-400"}`}>{formatCurrency(tx.amount)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {transactions.filter((t) => t.type === "payout").length > 0 && (
              <div className="card">
                <h3 className="font-semibold text-sm text-kasi-charcoal mb-4">Recent Payouts</h3>
                <div className="space-y-2">
                  {transactions.filter((t) => t.type === "payout").slice(0, 5).map((tx) => (
                    <div key={tx.id} className="flex items-center gap-3 py-2">
                      <div className="w-8 h-8 bg-kasi-gold/10 rounded-full flex items-center justify-center"><Crown className="w-4 h-4 text-kasi-gold" /></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-kasi-charcoal">{tx.member_name}</p>
                        <p className="text-xs text-gray-400">Round {tx.round} · {new Date(tx.created_at).toLocaleDateString("en-ZA")}</p>
                      </div>
                      <span className="text-sm font-semibold text-kasi-gold">{formatCurrency(tx.amount)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {transactions.length === 0 && !alreadyContributedThisRound && (
              <div className="card text-center py-8">
                <BarChart3 className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-400 text-sm">No transactions yet</p>
                <p className="text-gray-300 text-xs mt-1">Contributions will appear here</p>
              </div>
            )}
          </>
        )}

        {/* ===== MEMBERS TAB (both types) ===== */}
        {activeTab === "members" && (
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-sm text-kasi-charcoal">Members ({group.member_count}/{group.max_members})</h3>
              <button onClick={handleShare} className="text-xs text-kasi-green font-medium flex items-center gap-1">
                <UserPlus className="w-3.5 h-3.5" /> Invite
              </button>
            </div>
            {group.members.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-8">No members yet. Share the invite link!</p>
            ) : (
              <div className="space-y-2">
                {group.members.map((member) => (
                  <button key={member.user_id} onClick={() => setSelectedMember(member)} className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 transition-colors text-left">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden bg-kasi-green/10">
                      {member.profile?.avatar_url ? (
                        <img src={member.profile.avatar_url} alt="" className="w-10 h-10 object-cover" />
                      ) : (
                        <span className="text-kasi-green font-bold text-xs">{member.profile?.avatar_initials || "?"}</span>
                      )}
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
                        Score: <span className={`font-semibold ${getScoreColor(member.commitment_score)}`}>{Math.round(member.commitment_score)}%</span>
                        {" · "}{member.cycles_completed} cycle{member.cycles_completed !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ===== CONSTITUTION TAB (stokvel only) ===== */}
        {!isGoal && activeTab === "constitution" && (
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-kasi-green" />
                <h3 className="font-semibold text-sm text-kasi-charcoal">Digital Constitution</h3>
              </div>
              {isChairperson && (
                <button onClick={() => setShowAddRuleModal(true)} className="text-xs text-kasi-green font-medium flex items-center gap-1">
                  <Plus className="w-3.5 h-3.5" /> Add Rule
                </button>
              )}
            </div>
            <p className="text-xs text-gray-400 mb-4">All members must agree to these rules before joining. Changes require a majority vote.</p>
            {rules.length === 0 ? (
              <div className="text-center py-8">
                <BookOpen className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-400 text-sm">No rules set yet</p>
                <p className="text-gray-300 text-xs mt-1">{isChairperson ? "Tap \"Add Rule\" to create your group's constitution" : "The chairperson can add constitution rules"}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {rules.map((rule, i) => {
                  const acceptedBy = ruleAcceptances[rule.id] || [];
                  const hasAccepted = user ? acceptedBy.includes(user.id) : false;
                  return (
                    <div key={rule.id} className="border border-gray-100 rounded-xl p-4">
                      <div className="flex items-start gap-3">
                        <span className="w-6 h-6 bg-kasi-green/10 rounded-lg flex items-center justify-center text-xs font-bold text-kasi-green flex-shrink-0">{i + 1}</span>
                        <div className="flex-1">
                          <h4 className="font-medium text-sm text-kasi-charcoal mb-1">{rule.title}</h4>
                          <p className="text-xs text-gray-500 leading-relaxed">{rule.description}</p>
                          <div className="flex items-center justify-between mt-2">
                            <p className="text-[10px] text-gray-400">✓ Accepted by {acceptedBy.length}/{group.member_count} members</p>
                            {!hasAccepted && user && (
                              <button onClick={() => handleAcceptRule(rule.id)} className="text-[10px] text-kasi-green font-semibold flex items-center gap-0.5 hover:text-kasi-green-dark transition-colors">
                                <CheckCircle className="w-3 h-3" /> Accept
                              </button>
                            )}
                            {hasAccepted && (
                              <span className="text-[10px] text-emerald-500 font-medium flex items-center gap-0.5"><CheckCircle className="w-3 h-3" /> Accepted</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ===== VOTES TAB (stokvel only) ===== */}
        {!isGoal && activeTab === "votes" && (
          <>
            <button onClick={() => setShowCreateVoteModal(true)} className="btn-primary w-full flex items-center justify-center gap-2">
              <Plus className="w-4 h-4" /> New Proposal
            </button>
            {votes.length === 0 ? (
              <div className="card text-center py-8">
                <Vote className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-400 text-sm">No votes yet</p>
                <p className="text-gray-300 text-xs mt-1">Create a proposal to start voting</p>
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
                      <p className="text-[10px] text-gray-400 mt-1">{totalVotes}/{group.member_count} members voted · Expires {new Date(vote.expires_at).toLocaleDateString("en-ZA")}</p>
                    </div>
                    {vote.status === "active" && !hasVoted && (
                      <div className="flex gap-2">
                        <button onClick={() => handleVote(vote.id, "for")} className="flex-1 py-2 bg-emerald-50 text-emerald-600 text-sm font-medium rounded-xl hover:bg-emerald-100 transition-colors">✓ Vote For</button>
                        <button onClick={() => handleVote(vote.id, "against")} className="flex-1 py-2 bg-red-50 text-red-500 text-sm font-medium rounded-xl hover:bg-red-100 transition-colors">✗ Vote Against</button>
                      </div>
                    )}
                    {hasVoted && <p className="text-xs text-gray-400 text-center py-1">You&apos;ve already voted on this proposal</p>}
                  </div>
                );
              })
            )}
          </>
        )}
      </div>

      {/* ===== CONTRIBUTE MODAL ===== */}
      {showContributeModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 space-y-4">
            {contributionSuccess ? (
              <div className="text-center py-6">
                <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-emerald-500" />
                </div>
                <h3 className="font-bold text-lg text-kasi-charcoal">Contribution Recorded!</h3>
                <p className="text-sm text-gray-500 mt-1">
                  {isGoal ? formatCurrency(parseFloat(contributionAmount) || 0) : formatCurrency(group.contribution_amount)}
                  {!isGoal && ` for Round ${group.current_round}`}
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-lg text-kasi-charcoal">Record Contribution</h3>
                  <button onClick={() => setShowContributeModal(false)} className="text-gray-400 hover:text-gray-600"><XCircle className="w-5 h-5" /></button>
                </div>

                {isGoal ? (
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">Amount (R)</label>
                    <input
                      type="number"
                      value={contributionAmount}
                      onChange={(e) => setContributionAmount(e.target.value)}
                      placeholder="e.g. 500"
                      className="input-field text-sm"
                      min="1"
                    />
                  </div>
                ) : (
                  <div className="bg-kasi-green/5 rounded-xl p-4 text-center">
                    <p className="text-xs text-gray-500 mb-1">Amount</p>
                    <p className="text-2xl font-bold text-kasi-green">{formatCurrency(group.contribution_amount)}</p>
                    <p className="text-xs text-gray-400 mt-1">Round {group.current_round} · {group.name}</p>
                  </div>
                )}

                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Note (optional)</label>
                  <input type="text" value={contributionNote} onChange={(e) => setContributionNote(e.target.value)} placeholder="e.g. EFT reference, payment method" className="input-field text-sm" />
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Receipt (optional)</label>
                  <label className="flex items-center gap-2 p-3 border border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-kasi-green hover:bg-kasi-green/5 transition-colors">
                    <Receipt className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-500 flex-1">
                      {receiptFile ? receiptFile.name : "Attach proof of payment"}
                    </span>
                    {receiptFile && (
                      <button type="button" onClick={(e) => { e.preventDefault(); setReceiptFile(null); }} className="text-gray-400 hover:text-red-500">
                        <XCircle className="w-4 h-4" />
                      </button>
                    )}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,application/pdf"
                      onChange={(e) => setReceiptFile(e.target.files?.[0] || null)}
                      className="hidden"
                    />
                  </label>
                </div>

                <button onClick={handleContribute} disabled={contributionSubmitting || (isGoal && !contributionAmount)} className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60">
                  {contributionSubmitting ? (
                    <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Recording...</>
                  ) : (
                    <><Send className="w-4 h-4" /> Confirm Contribution</>
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* ===== EXPENSE MODAL (Goal Fund) ===== */}
      {showExpenseModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg text-kasi-charcoal">Record Expense</h3>
              <button onClick={() => setShowExpenseModal(false)} className="text-gray-400 hover:text-gray-600"><XCircle className="w-5 h-5" /></button>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Description</label>
              <input type="text" value={expenseDesc} onChange={(e) => setExpenseDesc(e.target.value)} placeholder="e.g. Dialysis session" className="input-field text-sm" />
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Amount (R)</label>
              <input type="number" value={expenseAmount} onChange={(e) => setExpenseAmount(e.target.value)} placeholder="e.g. 18500" className="input-field text-sm" min="1" />
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Date</label>
              <input type="date" value={expenseDate} onChange={(e) => setExpenseDate(e.target.value)} className="input-field text-sm" />
            </div>

            <button onClick={handleRecordExpense} disabled={expenseSubmitting || !expenseDesc.trim() || !expenseAmount} className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60">
              {expenseSubmitting ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Recording...</>
              ) : (
                <><Receipt className="w-4 h-4" /> Record Expense</>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ===== CREATE VOTE MODAL ===== */}
      {showCreateVoteModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg text-kasi-charcoal">New Proposal</h3>
              <button onClick={() => setShowCreateVoteModal(false)} className="text-gray-400 hover:text-gray-600"><XCircle className="w-5 h-5" /></button>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Category</label>
              <select value={voteType} onChange={(e) => setVoteType(e.target.value as any)} className="input-field text-sm">
                <option value="general">General</option>
                <option value="role_change">Role Change</option>
                <option value="rule_change">Rule Change</option>
                <option value="member_exit">Member Exit</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Title</label>
              <input type="text" value={voteTitle} onChange={(e) => setVoteTitle(e.target.value)} placeholder="What is being proposed?" className="input-field text-sm" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Description</label>
              <textarea value={voteDescription} onChange={(e) => setVoteDescription(e.target.value)} placeholder="Explain why this change is needed..." rows={3} className="input-field text-sm resize-none" />
            </div>
            <p className="text-[10px] text-gray-400">Voting will be open for 7 days. A majority vote is required to pass.</p>
            <button onClick={handleCreateVote} disabled={voteSubmitting || !voteTitle.trim() || !voteDescription.trim()} className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60">
              {voteSubmitting ? (<><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Submitting...</>) : (<><Vote className="w-4 h-4" /> Submit Proposal</>)}
            </button>
          </div>
        </div>
      )}

      {/* ===== ADD RULE MODAL ===== */}
      {showAddRuleModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg text-kasi-charcoal">Add Constitution Rule</h3>
              <button onClick={() => setShowAddRuleModal(false)} className="text-gray-400 hover:text-gray-600"><XCircle className="w-5 h-5" /></button>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Rule Title</label>
              <input type="text" value={ruleTitle} onChange={(e) => setRuleTitle(e.target.value)} placeholder="e.g. Late Payment Penalty" className="input-field text-sm" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Description</label>
              <textarea value={ruleDescription} onChange={(e) => setRuleDescription(e.target.value)} placeholder="Describe the rule in detail..." rows={3} className="input-field text-sm resize-none" />
            </div>
            <button onClick={handleAddRule} disabled={ruleSubmitting || !ruleTitle.trim() || !ruleDescription.trim()} className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60">
              {ruleSubmitting ? (<><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Adding...</>) : (<><Shield className="w-4 h-4" /> Add Rule</>)}
            </button>
          </div>
        </div>
      )}

      {/* ===== PAYOUT CONFIRMATION MODAL ===== */}
      {showPayoutModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 space-y-4">
            {payoutSuccess ? (
              <div className="text-center py-4">
                <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-3"><CheckCircle className="w-7 h-7 text-emerald-500" /></div>
                <h3 className="font-bold text-lg text-kasi-charcoal">Payout Processed!</h3>
                <p className="text-sm text-gray-500 mt-1">{formatCurrency(group.contribution_amount * group.max_members)} has been paid out. Round {group.current_round + 1} will begin.</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-lg text-kasi-charcoal">Confirm Payout</h3>
                  <button onClick={() => setShowPayoutModal(false)} className="text-gray-400 hover:text-gray-600"><XCircle className="w-5 h-5" /></button>
                </div>
                <div className="bg-kasi-gold/5 border border-kasi-gold/20 rounded-xl p-4 text-center">
                  <p className="text-xs text-gray-500 mb-1">Payout Amount</p>
                  <p className="text-3xl font-bold text-kasi-charcoal">{formatCurrency(group.contribution_amount * group.max_members)}</p>
                  <p className="text-xs text-gray-400 mt-1">Round {group.current_round}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 mb-2">Recipient</p>
                  {(() => {
                    const recipient = payoutOrder.find((p) => p.isCurrent);
                    return recipient ? (
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-kasi-green/10 rounded-full flex items-center justify-center text-sm font-bold text-kasi-green">{recipient.round}</div>
                        <div>
                          <p className="font-semibold text-kasi-charcoal">{recipient.member.profile?.name || "Member"}</p>
                          <p className="text-xs text-gray-400">Position #{recipient.round} in rotation</p>
                        </div>
                      </div>
                    ) : <p className="text-sm text-gray-400">No recipient found for this round</p>;
                  })()}
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setShowPayoutModal(false)} className="flex-1 py-3 rounded-xl font-medium text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors">Cancel</button>
                  <button onClick={handlePayout} disabled={payoutSubmitting} className="flex-1 btn-primary flex items-center justify-center gap-2 disabled:opacity-60">
                    {payoutSubmitting ? (<><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Processing...</>) : (<><Banknote className="w-4 h-4" /> Confirm Payout</>)}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Member Detail Modal */}
      {selectedMember && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4" onClick={() => setSelectedMember(null)}>
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-slide-up" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="gradient-green p-6 text-center relative">
              <button onClick={() => setSelectedMember(null)} className="absolute top-4 right-4 w-8 h-8 bg-white/10 rounded-xl flex items-center justify-center">
                <XCircle className="w-4 h-4 text-white/70" />
              </button>
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 overflow-hidden">
                {selectedMember.profile?.avatar_url ? (
                  <img src={selectedMember.profile.avatar_url} alt="" className="w-16 h-16 object-cover" />
                ) : (
                  <span className="text-white font-bold text-lg">{selectedMember.profile?.avatar_initials || "?"}</span>
                )}
              </div>
              <h3 className="text-white font-bold text-lg">{selectedMember.profile?.name || "Member"}</h3>
              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium mt-2 capitalize bg-white/20 text-white`}>
                {selectedMember.role === "chairperson" && <Crown className="w-3 h-3" />}
                {selectedMember.role}
              </span>
            </div>

            {/* Stats */}
            <div className="p-6">
              <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <p className="text-xs text-gray-400 mb-1">Commitment</p>
                  <p className={`text-xl font-bold ${getScoreColor(selectedMember.commitment_score)}`}>
                    {Math.round(selectedMember.commitment_score)}%
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <p className="text-xs text-gray-400 mb-1">Payments</p>
                  <p className="text-xl font-bold text-kasi-charcoal">
                    {selectedMember.total_on_time}/{selectedMember.total_payments}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <p className="text-xs text-gray-400 mb-1">Contributed</p>
                  <p className="text-lg font-bold text-kasi-green">
                    {formatCurrency(selectedMember.lifetime_contributed)}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <p className="text-xs text-gray-400 mb-1">{isGoal ? "Cycles" : "Received"}</p>
                  <p className="text-lg font-bold text-kasi-charcoal">
                    {isGoal ? selectedMember.cycles_completed : formatCurrency(selectedMember.lifetime_received)}
                  </p>
                </div>
              </div>

              {/* Recent contributions for this member */}
              {(() => {
                const memberTx = transactions.filter(t => t.member_id === selectedMember.user_id).slice(0, 5);
                if (memberTx.length === 0) return (
                  <p className="text-gray-400 text-xs text-center py-4">No contributions yet</p>
                );
                return (
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-2">Recent Activity</p>
                    <div className="space-y-2">
                      {memberTx.map((tx) => (
                        <div key={tx.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                          <div>
                            <p className="text-xs text-gray-500">{tx.type === "contribution" ? "Contributed" : tx.type}</p>
                            <p className="text-[10px] text-gray-300">{new Date(tx.created_at).toLocaleDateString()}</p>
                          </div>
                          <p className={`text-sm font-semibold ${tx.type === "contribution" ? "text-kasi-green" : "text-kasi-charcoal"}`}>
                            {formatCurrency(tx.amount)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}

              <p className="text-[10px] text-gray-300 text-center mt-4">
                Member since {new Date(selectedMember.joined_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
