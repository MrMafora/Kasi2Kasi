import { createClient } from "@/lib/supabase/client";
import type {
  StokvelGroup, GroupMember, Transaction, ConstitutionRule,
  Vote, VoteCast, Notification, Profile, GroupWithDetails, Expense,
} from "@/lib/types";

function getSupabase() {
  return createClient();
}

// ============ GROUPS ============

export async function getMyGroups(userId: string): Promise<GroupWithDetails[]> {
  const supabase = getSupabase();

  const { data: memberships } = await supabase
    .from("group_members")
    .select("group_id, role, commitment_score, lifetime_contributed, lifetime_received, cycles_completed, total_on_time, total_payments, payout_position, status, id, user_id, joined_at")
    .eq("user_id", userId)
    .eq("status", "active");

  if (!memberships || memberships.length === 0) return [];

  const groupIds = memberships.map((m: { group_id: string }) => m.group_id);

  const { data: groups } = await supabase
    .from("groups")
    .select("*")
    .in("id", groupIds);

  if (!groups) return [];

  // Batch: fetch all members for all groups in ONE query (fixes N+1)
  const { data: allMembers } = await supabase
    .from("group_members")
    .select("*, profile:profiles(*)")
    .in("group_id", groupIds)
    .eq("status", "active")
    .order("payout_position", { ascending: true });

  // Group members by group_id in memory
  const membersByGroup: Record<string, any[]> = {};
  (allMembers || []).forEach((member: { group_id: string }) => {
    if (!membersByGroup[member.group_id]) membersByGroup[member.group_id] = [];
    membersByGroup[member.group_id].push(member);
  });

  return groups.map((group: { id: string }) => {
    const members = membersByGroup[group.id] || [];
    const myMembership = memberships.find((m: { group_id: string }) => m.group_id === group.id);

    return {
      ...group,
      members,
      member_count: members.length,
      my_membership: myMembership as GroupMember | undefined,
    };
  });
}

export async function getGroupById(groupId: string): Promise<GroupWithDetails | null> {
  const supabase = getSupabase();

  const { data: group } = await supabase
    .from("groups")
    .select("*")
    .eq("id", groupId)
    .single();

  if (!group) return null;

  const { data: members } = await supabase
    .from("group_members")
    .select("*, profile:profiles(*)")
    .eq("group_id", groupId)
    .order("payout_position", { ascending: true });

  return {
    ...group,
    members: members || [],
    member_count: members?.length || 0,
  };
}

export async function createGroup(
  userId: string,
  data: {
    name: string;
    description: string;
    contribution_amount: number;
    frequency: "weekly" | "monthly";
    max_members: number;
  }
): Promise<{ group: StokvelGroup | null; error: any }> {
  const supabase = getSupabase();
  const totalRounds = data.max_members;

  const { data: group, error } = await supabase
    .from("groups")
    .insert({
      name: data.name,
      description: data.description,
      contribution_amount: data.contribution_amount,
      frequency: data.frequency,
      max_members: data.max_members,
      total_rounds: totalRounds,
      created_by: userId,
    })
    .select()
    .single();

  if (error || !group) return { group: null, error };

  // Add creator as chairperson
  const { error: memberError } = await supabase
    .from("group_members")
    .insert({
      group_id: group.id,
      user_id: userId,
      role: "chairperson",
      payout_position: 1,
    });

  if (memberError) return { group: null, error: memberError };

  return { group, error: null };
}

// ============ TRANSACTIONS ============

export async function getGroupTransactions(groupId: string, round?: number): Promise<Transaction[]> {
  const supabase = getSupabase();

  let query = supabase
    .from("transactions")
    .select("*, member:profiles!member_id(name)")
    .eq("group_id", groupId)
    .order("created_at", { ascending: false });

  if (round) {
    query = query.eq("round", round);
  }

  const { data } = await query;

  return (data || []).map((t: any) => ({
    ...t,
    member_name: t.member?.name || "Unknown",
  }));
}

// Records a contribution using the secure DB function (atomic: tx + stats + pool)
export async function recordContribution(data: {
  group_id: string;
  member_id: string;
  amount: number;
  round: number;
  note?: string;
}): Promise<{ error: any }> {
  const supabase = getSupabase();

  const { data: result, error } = await supabase.rpc("record_contribution", {
    p_group_id: data.group_id,
    p_member_id: data.member_id,
    p_amount: data.amount,
    p_round: data.round,
    p_note: data.note || null,
  });

  if (error) return { error };
  if (result?.error) return { error: { message: result.error } };
  return { error: null };
}

// Process a payout using the secure DB function (atomic: tx + stats + round advance)
export async function processPayout(data: {
  group_id: string;
  recipient_id: string;
}): Promise<{ error: any; amount?: number }> {
  const supabase = getSupabase();

  const { data: result, error } = await supabase.rpc("process_payout", {
    p_group_id: data.group_id,
    p_recipient_id: data.recipient_id,
  });

  if (error) return { error };
  if (result?.error) return { error: { message: result.error } };
  return { error: null, amount: result?.amount };
}

// Legacy createTransaction for non-contribution types (penalty, settlement)
export async function createTransaction(data: {
  group_id: string;
  member_id: string;
  amount: number;
  type: "contribution" | "payout" | "penalty" | "settlement";
  status: "completed" | "pending" | "late" | "missed";
  round: number;
  note?: string;
}): Promise<{ error: any }> {
  const supabase = getSupabase();

  // For contributions, use the secure DB function
  if (data.type === "contribution" && data.status === "completed") {
    return recordContribution({
      group_id: data.group_id,
      member_id: data.member_id,
      amount: data.amount,
      round: data.round,
      note: data.note,
    });
  }

  const { error } = await supabase.from("transactions").insert(data);
  return { error };
}

// ============ CONSTITUTION RULES ============

export async function getConstitutionRules(groupId: string): Promise<ConstitutionRule[]> {
  const supabase = getSupabase();

  const { data } = await supabase
    .from("constitution_rules")
    .select("*")
    .eq("group_id", groupId)
    .order("rule_order", { ascending: true });

  return data || [];
}

export async function getRuleAcceptances(ruleIds: string[]): Promise<Record<string, string[]>> {
  if (ruleIds.length === 0) return {};
  const supabase = getSupabase();

  const { data } = await supabase
    .from("rule_acceptances")
    .select("rule_id, user_id")
    .in("rule_id", ruleIds);

  const result: Record<string, string[]> = {};
  (data || []).forEach((a: { rule_id: string; user_id: string }) => {
    if (!result[a.rule_id]) result[a.rule_id] = [];
    result[a.rule_id].push(a.user_id);
  });

  return result;
}

export async function addConstitutionRule(groupId: string, title: string, description: string, order: number): Promise<{ error: any }> {
  const supabase = getSupabase();
  const { error } = await supabase
    .from("constitution_rules")
    .insert({ group_id: groupId, title, description, rule_order: order });
  return { error };
}

export async function acceptRule(ruleId: string, userId: string): Promise<{ error: any }> {
  const supabase = getSupabase();
  const { error } = await supabase
    .from("rule_acceptances")
    .upsert({ rule_id: ruleId, user_id: userId });
  return { error };
}

// ============ VOTES ============

export async function getGroupVotes(groupId: string): Promise<Vote[]> {
  const supabase = getSupabase();

  const { data: votes } = await supabase
    .from("votes")
    .select("*, proposer:profiles!proposed_by(name)")
    .eq("group_id", groupId)
    .order("created_at", { ascending: false });

  if (!votes || votes.length === 0) return [];

  const voteIds = votes.map((v: any) => v.id);
  const { data: casts } = await supabase
    .from("vote_casts")
    .select("vote_id, user_id, vote_value")
    .in("vote_id", voteIds);

  return votes.map((v: any) => {
    const voteCasts = (casts || []).filter((c: { vote_id: string }) => c.vote_id === v.id);
    return {
      ...v,
      proposer_name: v.proposer?.name || "Unknown",
      votes_for: voteCasts.filter((c: { vote_value: string }) => c.vote_value === "for").map((c: { user_id: string }) => c.user_id),
      votes_against: voteCasts.filter((c: { vote_value: string }) => c.vote_value === "against").map((c: { user_id: string }) => c.user_id),
    };
  });
}

export async function createVote(data: {
  group_id: string;
  title: string;
  description: string;
  proposed_by: string;
  type: "role_change" | "rule_change" | "member_exit" | "general";
  expires_at: string;
}): Promise<{ error: any }> {
  const supabase = getSupabase();
  const { error } = await supabase.from("votes").insert(data);
  return { error };
}

export async function castVote(voteId: string, userId: string, value: "for" | "against"): Promise<{ error: any }> {
  const supabase = getSupabase();
  const { error } = await supabase
    .from("vote_casts")
    .upsert({ vote_id: voteId, user_id: userId, vote_value: value });
  return { error };
}

// ============ NOTIFICATIONS ============

export async function getNotifications(userId: string): Promise<Notification[]> {
  const supabase = getSupabase();

  const { data } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(50);

  return data || [];
}

export async function markNotificationRead(notificationId: string): Promise<void> {
  const supabase = getSupabase();
  await supabase
    .from("notifications")
    .update({ read: true })
    .eq("id", notificationId);
}

export async function markAllNotificationsRead(userId: string): Promise<void> {
  const supabase = getSupabase();
  await supabase
    .from("notifications")
    .update({ read: true })
    .eq("user_id", userId)
    .eq("read", false);
}

export async function createNotification(data: {
  user_id: string;
  title: string;
  message: string;
  type: "payment" | "payout" | "vote" | "reminder" | "system";
  group_id?: string;
}): Promise<void> {
  const supabase = getSupabase();
  await supabase.from("notifications").insert(data);
}

// ============ PROFILE ============

export async function updateProfile(userId: string, data: Partial<Profile>): Promise<{ error: any }> {
  const supabase = getSupabase();
  const { error } = await supabase
    .from("profiles")
    .update(data)
    .eq("id", userId);
  return { error };
}

// ============ JOIN GROUP ============

export async function getGroupPublicInfo(groupId: string): Promise<{
  group: { id: string; name: string; description: string; contribution_amount: number; frequency: string; max_members: number; member_count: number; status: string } | null;
  error: any;
}> {
  const supabase = getSupabase();

  const { data: group, error: groupError } = await supabase
    .from("groups")
    .select("id, name, description, contribution_amount, frequency, max_members, status, type, goal_description, goal_monthly_target, goal_recurring")
    .eq("id", groupId)
    .single();

  if (groupError || !group) return { group: null, error: groupError };

  const { count } = await supabase
    .from("group_members")
    .select("*", { count: "exact", head: true })
    .eq("group_id", groupId)
    .eq("status", "active");

  return {
    group: { ...group, member_count: count || 0 },
    error: null,
  };
}

export async function joinGroup(groupId: string, userId: string): Promise<{ error: any }> {
  const supabase = getSupabase();

  // 1. Ensure Profile Exists (Self-Healing)
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", userId)
    .maybeSingle();

  if (!profile) {
    // Fetch auth metadata to recreate profile
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const name = user.user_metadata?.name || "New Member";
      const initials = name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);
      
      const { error: createError } = await supabase.from("profiles").insert({
        id: userId,
        name: name,
        email: user.email,
        phone: user.user_metadata?.phone || "",
        avatar_initials: initials
      });
      
      if (createError) {
        console.error("Failed to auto-create missing profile:", createError);
        // Continue anyway - if DB trigger fixed it in background, next insert might still work
      }
    }
  }

  // Check if already a member
  const { data: existing } = await supabase
    .from("group_members")
    .select("id, status")
    .eq("group_id", groupId)
    .eq("user_id", userId)
    .maybeSingle();

  if (existing && existing.status === "active") {
    return { error: { message: "You are already a member of this group" } };
  }

  // Check group capacity
  const { data: group } = await supabase
    .from("groups")
    .select("max_members, status")
    .eq("id", groupId)
    .single();

  if (!group) return { error: { message: "Group not found" } };
  if (group.status !== "active") return { error: { message: "This group is no longer active" } };

  const { count } = await supabase
    .from("group_members")
    .select("*", { count: "exact", head: true })
    .eq("group_id", groupId)
    .eq("status", "active");

  if ((count || 0) >= group.max_members) {
    return { error: { message: "This group is full" } };
  }

  // Assign payout position = next available slot
  const payoutPosition = (count || 0) + 1;

  // Re-activate if previously exited, otherwise insert new
  if (existing) {
    const { error } = await supabase
      .from("group_members")
      .update({ status: "active", payout_position: payoutPosition, role: "member" })
      .eq("id", existing.id);
    return { error };
  }

  const { error } = await supabase
    .from("group_members")
    .insert({
      group_id: groupId,
      user_id: userId,
      role: "member",
      payout_position: payoutPosition,
      commitment_score: 100,
      total_on_time: 0,
      total_payments: 0,
      cycles_completed: 0,
      lifetime_contributed: 0,
      lifetime_received: 0,
      status: "active",
    });

  return { error };
}

// ============ GOAL FUND ============

export async function createGoalGroup(
  userId: string,
  data: {
    name: string;
    description: string;
    goal_description: string;
    goal_monthly_target: number;
    goal_recurring: boolean;
    max_members: number;
  }
): Promise<{ group: StokvelGroup | null; error: any }> {
  const supabase = getSupabase();

  const { data: group, error } = await supabase
    .from("groups")
    .insert({
      name: data.name,
      description: data.description,
      type: "goal",
      contribution_amount: 0, // flexible contributions
      frequency: "monthly",
      max_members: data.max_members,
      total_rounds: 0,
      goal_description: data.goal_description,
      goal_monthly_target: data.goal_monthly_target,
      goal_recurring: data.goal_recurring,
      created_by: userId,
    })
    .select()
    .single();

  if (error || !group) return { group: null, error };

  const { error: memberError } = await supabase
    .from("group_members")
    .insert({
      group_id: group.id,
      user_id: userId,
      role: "chairperson",
      payout_position: 1,
    });

  if (memberError) return { group: null, error: memberError };

  return { group, error: null };
}

export async function recordGoalContribution(data: {
  group_id: string;
  member_id: string;
  amount: number;
  note?: string;
}): Promise<{ error: any }> {
  const supabase = getSupabase();

  const { data: result, error } = await supabase.rpc("record_goal_contribution", {
    p_group_id: data.group_id,
    p_member_id: data.member_id,
    p_amount: data.amount,
    p_note: data.note || null,
  });

  if (error) return { error };
  if (result?.error) return { error: { message: result.error } };
  return { error: null };
}

export async function getGroupExpenses(groupId: string): Promise<Expense[]> {
  const supabase = getSupabase();

  const { data } = await supabase
    .from("expenses")
    .select("*, recorder:profiles!recorded_by(name)")
    .eq("group_id", groupId)
    .order("date", { ascending: false });

  return (data || []).map((e: any) => ({
    ...e,
    recorder_name: e.recorder?.name || "Unknown",
  }));
}

export async function recordExpense(data: {
  group_id: string;
  description: string;
  amount: number;
  date: string;
  receipt_url?: string;
}): Promise<{ error: any }> {
  const supabase = getSupabase();

  const { data: result, error } = await supabase.rpc("record_goal_expense", {
    p_group_id: data.group_id,
    p_description: data.description,
    p_amount: data.amount,
    p_date: data.date,
    p_receipt_url: data.receipt_url || null,
  });

  if (error) return { error };
  if (result?.error) return { error: { message: result.error } };
  return { error: null };
}

// ============ NOTIFICATIONS HELPER ============

export async function notifyGroupMembers(
  groupId: string,
  title: string,
  message: string,
  type: "payment" | "payout" | "vote" | "reminder" | "system",
  excludeUserId?: string
): Promise<void> {
  const supabase = getSupabase();

  const { data: members } = await supabase
    .from("group_members")
    .select("user_id")
    .eq("group_id", groupId)
    .eq("status", "active");

  if (!members || members.length === 0) return;

  const notifications = members
    .filter((m: { user_id: string }) => m.user_id !== excludeUserId)
    .map((m: { user_id: string }) => ({
      user_id: m.user_id,
      title,
      message,
      type,
      group_id: groupId,
    }));

  if (notifications.length > 0) {
    await supabase.from("notifications").insert(notifications);
  }
}
