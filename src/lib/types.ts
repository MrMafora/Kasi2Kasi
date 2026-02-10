// Database types for Kasi2Kasi

export interface Profile {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  avatar_initials: string;
  beneficiary_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface StokvelGroup {
  id: string;
  name: string;
  description: string;
  contribution_amount: number;
  frequency: "weekly" | "monthly";
  max_members: number;
  current_round: number;
  total_rounds: number;
  total_pool: number;
  next_payout_date: string | null;
  next_payout_member_id: string | null;
  status: "active" | "completed" | "paused";
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface GroupMember {
  id: string;
  group_id: string;
  user_id: string;
  role: "chairperson" | "treasurer" | "secretary" | "member";
  payout_position: number;
  commitment_score: number;
  total_on_time: number;
  total_payments: number;
  cycles_completed: number;
  lifetime_contributed: number;
  lifetime_received: number;
  status: "active" | "exited" | "suspended";
  joined_at: string;
  // Joined profile data
  profile?: Profile;
}

export interface Transaction {
  id: string;
  group_id: string;
  member_id: string;
  amount: number;
  type: "contribution" | "payout" | "penalty" | "settlement";
  status: "completed" | "pending" | "late" | "missed";
  round: number;
  note: string | null;
  created_at: string;
  // Joined data
  member_name?: string;
}

export interface ConstitutionRule {
  id: string;
  group_id: string;
  title: string;
  description: string;
  rule_order: number;
  created_at: string;
}

export interface RuleAcceptance {
  id: string;
  rule_id: string;
  user_id: string;
  accepted_at: string;
}

export interface Vote {
  id: string;
  group_id: string;
  title: string;
  description: string;
  proposed_by: string;
  type: "role_change" | "rule_change" | "member_exit" | "general";
  status: "active" | "passed" | "rejected" | "expired";
  expires_at: string;
  created_at: string;
  // Computed
  votes_for?: string[];
  votes_against?: string[];
  proposer_name?: string;
}

export interface VoteCast {
  id: string;
  vote_id: string;
  user_id: string;
  vote_value: "for" | "against";
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: "payment" | "payout" | "vote" | "reminder" | "system";
  read: boolean;
  group_id: string | null;
  created_at: string;
}

// Helper types
export interface GroupWithDetails extends StokvelGroup {
  members: GroupMember[];
  member_count: number;
  my_membership?: GroupMember;
}

export interface DashboardData {
  profile: Profile;
  groups: GroupWithDetails[];
  notifications: Notification[];
  total_contributed: number;
  total_received: number;
  avg_commitment_score: number;
}

// Utility functions
export function getScoreColor(score: number): string {
  if (score >= 90) return "text-emerald-600";
  if (score >= 70) return "text-amber-500";
  return "text-red-500";
}

export function getScoreBg(score: number): string {
  if (score >= 90) return "bg-emerald-500";
  if (score >= 70) return "bg-amber-500";
  return "bg-red-500";
}

export function getScoreLabel(score: number): string {
  if (score >= 90) return "Excellent";
  if (score >= 70) return "Good";
  if (score >= 50) return "Fair";
  return "At Risk";
}

export function formatCurrency(amount: number): string {
  return `R ${amount.toLocaleString("en-ZA")}`;
}

export function getRoleBadgeColor(role: string): string {
  switch (role) {
    case "chairperson": return "bg-kasi-gold/20 text-kasi-gold-dark";
    case "treasurer": return "bg-blue-100 text-blue-700";
    case "secretary": return "bg-purple-100 text-purple-700";
    default: return "bg-gray-100 text-gray-600";
  }
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}
