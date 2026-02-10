import { createClient } from "@/lib/supabase/client";
import type {
  StokvelGroup, GroupMember, Transaction, ConstitutionRule,
  Vote, VoteCast, Notification, Profile, GroupWithDetails,
} from "@/lib/types";

const supabase = createClient();

// ============ GROUPS ============

export async function getMyGroups(userId: string): Promise<GroupWithDetails[]> {
  const { data: memberships } = await supabase
    .from("group_members")
    .select("group_id, role, commitment_score, lifetime_contributed, lifetime_received, cycles_completed, total_on_time, total_payments, payout_position, status")
    .eq("user_id", userId)
    .eq("status", "active");

  if (!memberships || memberships.length === 0) return [];

  const groupIds = memberships.map((m) => m.group_id);

  const { data: groups } = await supabase
    .from("groups")
    .select("*")
    .in("id", groupIds);

  if (!groups) return [];

  // Get member counts for each group
  const result: GroupWithDetails[] = [];

  for (const group of groups) {
    const { data: members } = await supabase
      .from("group_members")
      .select("*, profile:profiles(*)")
      .eq("group_id", group.id)
      .eq("status", "active")
      .order("payout_position", { ascending: true });

    const myMembership = memberships.find((m) => m.group_id === group.id);

    result.push({
      ...group,
      members: members || [],
      member_count: members?.length || 0,
      my_membership: myMembership ? { ...myMembership, id: "", group_id: group.id, user_id: userId, joined_at: "" } as GroupMember : undefined,
    });
  }

  return result;
}

export async function getGroupById(groupId: string): Promise<GroupWithDetails | null> {
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

export async function createTransaction(data: {
  group_id: string;
  member_id: string;
  amount: number;
  type: "contribution" | "payout" | "penalty" | "settlement";
  status: "completed" | "pending" | "late" | "missed";
  round: number;
  note?: string;
}): Promise<{ error: any }> {
  const { error } = await supabase.from("transactions").insert(data);

  if (!error && data.type === "contribution" && data.status === "completed") {
    // Update member stats
    const { data: member } = await supabase
      .from("group_members")
      .select("lifetime_contributed, total_payments, total_on_time")
      .eq("group_id", data.group_id)
      .eq("user_id", data.member_id)
      .single();

    if (member) {
      await supabase
        .from("group_members")
        .update({
          lifetime_contributed: member.lifetime_contributed + data.amount,
          total_payments: member.total_payments + 1,
          total_on_time: member.total_on_time + 1,
          commitment_score: Math.round(((member.total_on_time + 1) / (member.total_payments + 1)) * 100),
        })
        .eq("group_id", data.group_id)
        .eq("user_id", data.member_id);
    }

    // Update group pool
    const { data: g } = await supabase
      .from("groups")
      .select("total_pool")
      .eq("id", data.group_id)
      .single();

    if (g) {
      await supabase
        .from("groups")
        .update({ total_pool: (g.total_pool || 0) + data.amount })
        .eq("id", data.group_id);
    }
  }

  return { error };
}

// ============ CONSTITUTION RULES ============

export async function getConstitutionRules(groupId: string): Promise<ConstitutionRule[]> {
  const { data } = await supabase
    .from("constitution_rules")
    .select("*")
    .eq("group_id", groupId)
    .order("rule_order", { ascending: true });

  return data || [];
}

export async function getRuleAcceptances(ruleIds: string[]): Promise<Record<string, string[]>> {
  if (ruleIds.length === 0) return {};

  const { data } = await supabase
    .from("rule_acceptances")
    .select("rule_id, user_id")
    .in("rule_id", ruleIds);

  const result: Record<string, string[]> = {};
  (data || []).forEach((a) => {
    if (!result[a.rule_id]) result[a.rule_id] = [];
    result[a.rule_id].push(a.user_id);
  });

  return result;
}

export async function addConstitutionRule(groupId: string, title: string, description: string, order: number): Promise<{ error: any }> {
  const { error } = await supabase
    .from("constitution_rules")
    .insert({ group_id: groupId, title, description, rule_order: order });
  return { error };
}

export async function acceptRule(ruleId: string, userId: string): Promise<{ error: any }> {
  const { error } = await supabase
    .from("rule_acceptances")
    .upsert({ rule_id: ruleId, user_id: userId });
  return { error };
}

// ============ VOTES ============

export async function getGroupVotes(groupId: string): Promise<Vote[]> {
  const { data: votes } = await supabase
    .from("votes")
    .select("*, proposer:profiles!proposed_by(name)")
    .eq("group_id", groupId)
    .order("created_at", { ascending: false });

  if (!votes || votes.length === 0) return [];

  const voteIds = votes.map((v) => v.id);
  const { data: casts } = await supabase
    .from("vote_casts")
    .select("vote_id, user_id, vote_value")
    .in("vote_id", voteIds);

  return votes.map((v: any) => {
    const voteCasts = (casts || []).filter((c) => c.vote_id === v.id);
    return {
      ...v,
      proposer_name: v.proposer?.name || "Unknown",
      votes_for: voteCasts.filter((c) => c.vote_value === "for").map((c) => c.user_id),
      votes_against: voteCasts.filter((c) => c.vote_value === "against").map((c) => c.user_id),
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
  const { error } = await supabase.from("votes").insert(data);
  return { error };
}

export async function castVote(voteId: string, userId: string, value: "for" | "against"): Promise<{ error: any }> {
  const { error } = await supabase
    .from("vote_casts")
    .upsert({ vote_id: voteId, user_id: userId, vote_value: value });
  return { error };
}

// ============ NOTIFICATIONS ============

export async function getNotifications(userId: string): Promise<Notification[]> {
  const { data } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(50);

  return data || [];
}

export async function markNotificationRead(notificationId: string): Promise<void> {
  await supabase
    .from("notifications")
    .update({ read: true })
    .eq("id", notificationId);
}

export async function markAllNotificationsRead(userId: string): Promise<void> {
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
  await supabase.from("notifications").insert(data);
}

// ============ PROFILE ============

export async function updateProfile(userId: string, data: Partial<Profile>): Promise<{ error: any }> {
  const { error } = await supabase
    .from("profiles")
    .update(data)
    .eq("id", userId);
  return { error };
}
