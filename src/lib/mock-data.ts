// Mock data for Kasi2Kasi Digital Stokvel Platform

export interface User {
  id: string;
  name: string;
  phone: string;
  email: string;
  avatar: string;
  joinedDate: string;
  beneficiary?: string;
}

export interface Member {
  userId: string;
  user: User;
  role: "chairperson" | "treasurer" | "secretary" | "member";
  joinedGroup: string;
  commitmentScore: number;
  totalOnTime: number;
  totalPayments: number;
  cyclesCompleted: number;
  lifetimeContributed: number;
  lifetimeReceived: number;
  status: "active" | "exited" | "suspended";
}

export interface Transaction {
  id: string;
  groupId: string;
  memberId: string;
  memberName: string;
  amount: number;
  type: "contribution" | "payout" | "penalty" | "settlement";
  status: "completed" | "pending" | "late" | "missed";
  date: string;
  round: number;
  note?: string;
}

export interface StokvelGroup {
  id: string;
  name: string;
  description: string;
  contributionAmount: number;
  frequency: "weekly" | "monthly";
  totalMembers: number;
  maxMembers: number;
  currentRound: number;
  totalRounds: number;
  totalPool: number;
  createdDate: string;
  nextPayoutDate: string;
  nextPayoutMember: string;
  status: "active" | "completed" | "paused";
  members: Member[];
  transactions: Transaction[];
  constitution: ConstitutionRule[];
}

export interface ConstitutionRule {
  id: string;
  title: string;
  description: string;
  acceptedBy: string[];
}

export interface Vote {
  id: string;
  groupId: string;
  title: string;
  description: string;
  proposedBy: string;
  type: "role_change" | "rule_change" | "member_exit" | "general";
  status: "active" | "passed" | "rejected" | "expired";
  votesFor: string[];
  votesAgainst: string[];
  createdDate: string;
  expiryDate: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "payment" | "payout" | "vote" | "reminder" | "system";
  read: boolean;
  date: string;
}

// ============ MOCK USERS ============
export const mockUsers: User[] = [
  { id: "u1", name: "Thabo Molefe", phone: "+27 71 234 5678", email: "thabo@email.com", avatar: "TM", joinedDate: "2025-01-15", beneficiary: "Naledi Molefe" },
  { id: "u2", name: "Naledi Dlamini", phone: "+27 72 345 6789", email: "naledi@email.com", avatar: "ND", joinedDate: "2025-01-15", beneficiary: "Sipho Dlamini" },
  { id: "u3", name: "Sipho Nkosi", phone: "+27 73 456 7890", email: "sipho@email.com", avatar: "SN", joinedDate: "2025-01-16" },
  { id: "u4", name: "Lerato Mokoena", phone: "+27 74 567 8901", email: "lerato@email.com", avatar: "LM", joinedDate: "2025-01-16", beneficiary: "Grace Mokoena" },
  { id: "u5", name: "Bongani Zulu", phone: "+27 75 678 9012", email: "bongani@email.com", avatar: "BZ", joinedDate: "2025-01-17" },
  { id: "u6", name: "Ayanda Khumalo", phone: "+27 76 789 0123", email: "ayanda@email.com", avatar: "AK", joinedDate: "2025-01-17" },
  { id: "u7", name: "Mandla Sithole", phone: "+27 77 890 1234", email: "mandla@email.com", avatar: "MS", joinedDate: "2025-01-18" },
  { id: "u8", name: "Palesa Mahlangu", phone: "+27 78 901 2345", email: "palesa@email.com", avatar: "PM", joinedDate: "2025-01-18" },
  { id: "u9", name: "Tshegofatso Motaung", phone: "+27 79 012 3456", email: "tshego@email.com", avatar: "TG", joinedDate: "2025-01-19" },
  { id: "u10", name: "Kagiso Radebe", phone: "+27 70 123 4567", email: "kagiso@email.com", avatar: "KR", joinedDate: "2025-01-19" },
];

// Current logged-in user
export const currentUser = mockUsers[0];

// ============ MOCK MEMBERS ============
const createMembers = (): Member[] => [
  { userId: "u1", user: mockUsers[0], role: "chairperson", joinedGroup: "2025-01-15", commitmentScore: 98, totalOnTime: 5, totalPayments: 5, cyclesCompleted: 1, lifetimeContributed: 5000, lifetimeReceived: 10000, status: "active" },
  { userId: "u2", user: mockUsers[1], role: "treasurer", joinedGroup: "2025-01-15", commitmentScore: 95, totalOnTime: 5, totalPayments: 5, cyclesCompleted: 1, lifetimeContributed: 5000, lifetimeReceived: 0, status: "active" },
  { userId: "u3", user: mockUsers[2], role: "secretary", joinedGroup: "2025-01-16", commitmentScore: 88, totalOnTime: 4, totalPayments: 5, cyclesCompleted: 0, lifetimeContributed: 5000, lifetimeReceived: 10000, status: "active" },
  { userId: "u4", user: mockUsers[3], role: "member", joinedGroup: "2025-01-16", commitmentScore: 100, totalOnTime: 5, totalPayments: 5, cyclesCompleted: 1, lifetimeContributed: 5000, lifetimeReceived: 10000, status: "active" },
  { userId: "u5", user: mockUsers[4], role: "member", joinedGroup: "2025-01-17", commitmentScore: 72, totalOnTime: 3, totalPayments: 5, cyclesCompleted: 0, lifetimeContributed: 4000, lifetimeReceived: 0, status: "active" },
  { userId: "u6", user: mockUsers[5], role: "member", joinedGroup: "2025-01-17", commitmentScore: 92, totalOnTime: 5, totalPayments: 5, cyclesCompleted: 0, lifetimeContributed: 5000, lifetimeReceived: 0, status: "active" },
  { userId: "u7", user: mockUsers[6], role: "member", joinedGroup: "2025-01-18", commitmentScore: 85, totalOnTime: 4, totalPayments: 5, cyclesCompleted: 0, lifetimeContributed: 5000, lifetimeReceived: 0, status: "active" },
  { userId: "u8", user: mockUsers[7], role: "member", joinedGroup: "2025-01-18", commitmentScore: 96, totalOnTime: 5, totalPayments: 5, cyclesCompleted: 0, lifetimeContributed: 5000, lifetimeReceived: 0, status: "active" },
  { userId: "u9", user: mockUsers[8], role: "member", joinedGroup: "2025-01-19", commitmentScore: 60, totalOnTime: 3, totalPayments: 5, cyclesCompleted: 0, lifetimeContributed: 3000, lifetimeReceived: 0, status: "active" },
  { userId: "u10", user: mockUsers[9], role: "member", joinedGroup: "2025-01-19", commitmentScore: 90, totalOnTime: 4, totalPayments: 5, cyclesCompleted: 0, lifetimeContributed: 5000, lifetimeReceived: 0, status: "active" },
];

// ============ MOCK TRANSACTIONS ============
const createTransactions = (): Transaction[] => [
  // Round 1
  { id: "t1", groupId: "g1", memberId: "u1", memberName: "Thabo Molefe", amount: 1000, type: "contribution", status: "completed", date: "2025-02-01", round: 1 },
  { id: "t2", groupId: "g1", memberId: "u2", memberName: "Naledi Dlamini", amount: 1000, type: "contribution", status: "completed", date: "2025-02-01", round: 1 },
  { id: "t3", groupId: "g1", memberId: "u3", memberName: "Sipho Nkosi", amount: 1000, type: "contribution", status: "completed", date: "2025-02-02", round: 1 },
  { id: "t4", groupId: "g1", memberId: "u4", memberName: "Lerato Mokoena", amount: 1000, type: "contribution", status: "completed", date: "2025-02-01", round: 1 },
  { id: "t5", groupId: "g1", memberId: "u1", memberName: "Thabo Molefe", amount: 10000, type: "payout", status: "completed", date: "2025-02-28", round: 1, note: "Round 1 payout" },
  // Round 2
  { id: "t6", groupId: "g1", memberId: "u1", memberName: "Thabo Molefe", amount: 1000, type: "contribution", status: "completed", date: "2025-03-01", round: 2 },
  { id: "t7", groupId: "g1", memberId: "u2", memberName: "Naledi Dlamini", amount: 1000, type: "contribution", status: "completed", date: "2025-03-01", round: 2 },
  { id: "t8", groupId: "g1", memberId: "u2", memberName: "Naledi Dlamini", amount: 10000, type: "payout", status: "completed", date: "2025-03-31", round: 2, note: "Round 2 payout" },
  // Round 3
  { id: "t9", groupId: "g1", memberId: "u1", memberName: "Thabo Molefe", amount: 1000, type: "contribution", status: "completed", date: "2025-04-01", round: 3 },
  { id: "t10", groupId: "g1", memberId: "u3", memberName: "Sipho Nkosi", amount: 10000, type: "payout", status: "completed", date: "2025-04-30", round: 3, note: "Round 3 payout" },
  // Round 4
  { id: "t11", groupId: "g1", memberId: "u1", memberName: "Thabo Molefe", amount: 1000, type: "contribution", status: "completed", date: "2025-05-01", round: 4 },
  { id: "t12", groupId: "g1", memberId: "u4", memberName: "Lerato Mokoena", amount: 10000, type: "payout", status: "completed", date: "2025-05-31", round: 4, note: "Round 4 payout" },
  // Round 5 (current)
  { id: "t13", groupId: "g1", memberId: "u1", memberName: "Thabo Molefe", amount: 1000, type: "contribution", status: "completed", date: "2025-06-01", round: 5 },
  { id: "t14", groupId: "g1", memberId: "u2", memberName: "Naledi Dlamini", amount: 1000, type: "contribution", status: "completed", date: "2025-06-01", round: 5 },
  { id: "t15", groupId: "g1", memberId: "u3", memberName: "Sipho Nkosi", amount: 1000, type: "contribution", status: "completed", date: "2025-06-02", round: 5 },
  { id: "t16", groupId: "g1", memberId: "u5", memberName: "Bongani Zulu", amount: 1000, type: "contribution", status: "late", date: "2025-06-05", round: 5 },
  { id: "t17", groupId: "g1", memberId: "u6", memberName: "Ayanda Khumalo", amount: 1000, type: "contribution", status: "completed", date: "2025-06-01", round: 5 },
  { id: "t18", groupId: "g1", memberId: "u7", memberName: "Mandla Sithole", amount: 1000, type: "contribution", status: "pending", date: "", round: 5 },
  { id: "t19", groupId: "g1", memberId: "u8", memberName: "Palesa Mahlangu", amount: 1000, type: "contribution", status: "completed", date: "2025-06-01", round: 5 },
  { id: "t20", groupId: "g1", memberId: "u9", memberName: "Tshegofatso Motaung", amount: 1000, type: "contribution", status: "pending", date: "", round: 5 },
  { id: "t21", groupId: "g1", memberId: "u10", memberName: "Kagiso Radebe", amount: 1000, type: "contribution", status: "completed", date: "2025-06-01", round: 5 },
  { id: "t22", groupId: "g1", memberId: "u4", memberName: "Lerato Mokoena", amount: 1000, type: "contribution", status: "completed", date: "2025-06-01", round: 5 },
];

// ============ MOCK CONSTITUTION ============
const constitutionRules: ConstitutionRule[] = [
  { id: "c1", title: "Monthly Contribution", description: "Each member must contribute R1,000 on or before the 1st of each month.", acceptedBy: ["u1","u2","u3","u4","u5","u6","u7","u8","u9","u10"] },
  { id: "c2", title: "Payout Order", description: "Payouts follow a round-robin structure. The order is determined at the first meeting and cannot be changed unless voted on by majority.", acceptedBy: ["u1","u2","u3","u4","u5","u6","u7","u8","u9","u10"] },
  { id: "c3", title: "Late Payment Penalty", description: "Payments received after the 3rd of the month incur a R50 penalty fee.", acceptedBy: ["u1","u2","u3","u4","u5","u6","u7","u8","u9","u10"] },
  { id: "c4", title: "Exit Policy", description: "A member wishing to exit must provide 30 days notice. If they have already received their payout, they must settle all remaining contributions.", acceptedBy: ["u1","u2","u3","u4","u5","u6","u7","u8","u9","u10"] },
  { id: "c5", title: "Succession", description: "Each member must nominate a beneficiary. In case of death, the beneficiary inherits the member's position and stake.", acceptedBy: ["u1","u2","u3","u4","u5","u6","u7","u8","u9","u10"] },
  { id: "c6", title: "Leadership Vote", description: "Any member can propose a leadership change. A 60% majority vote is required for the change to take effect.", acceptedBy: ["u1","u2","u3","u4","u5","u6","u7","u8","u9","u10"] },
];

// ============ MOCK VOTES ============
export const mockVotes: Vote[] = [
  {
    id: "v1",
    groupId: "g1",
    title: "Change meeting time to Saturdays",
    description: "Proposal to move our monthly check-in from Sunday evenings to Saturday mornings at 10am.",
    proposedBy: "u3",
    type: "general",
    status: "active",
    votesFor: ["u1", "u3", "u4", "u6"],
    votesAgainst: ["u2", "u5"],
    createdDate: "2025-06-10",
    expiryDate: "2025-06-17",
  },
  {
    id: "v2",
    groupId: "g1",
    title: "Increase late penalty to R100",
    description: "Due to repeated late payments, proposal to increase the late fee from R50 to R100.",
    proposedBy: "u1",
    type: "rule_change",
    status: "passed",
    votesFor: ["u1", "u2", "u4", "u6", "u7", "u8", "u10"],
    votesAgainst: ["u5", "u9"],
    createdDate: "2025-05-15",
    expiryDate: "2025-05-22",
  },
];

// ============ MOCK GROUPS ============
export const mockGroups: StokvelGroup[] = [
  {
    id: "g1",
    name: "Legacy Builders",
    description: "A property investment stokvel for young professionals in Soweto",
    contributionAmount: 1000,
    frequency: "monthly",
    totalMembers: 10,
    maxMembers: 10,
    currentRound: 5,
    totalRounds: 10,
    totalPool: 8000,
    createdDate: "2025-01-15",
    nextPayoutDate: "2025-06-30",
    nextPayoutMember: "Bongani Zulu",
    status: "active",
    members: createMembers(),
    transactions: createTransactions(),
    constitution: constitutionRules,
  },
  {
    id: "g2",
    name: "Tembisa Travellers",
    description: "Saving together for our December holiday trip",
    contributionAmount: 500,
    frequency: "monthly",
    totalMembers: 6,
    maxMembers: 8,
    currentRound: 3,
    totalRounds: 6,
    totalPool: 3000,
    createdDate: "2025-03-01",
    nextPayoutDate: "2025-06-15",
    nextPayoutMember: "Sipho Nkosi",
    status: "active",
    members: createMembers().slice(0, 6),
    transactions: createTransactions().slice(0, 8),
    constitution: constitutionRules.slice(0, 4),
  },
];

// ============ MOCK NOTIFICATIONS ============
export const mockNotifications: Notification[] = [
  { id: "n1", title: "Payment Due", message: "Your R1,000 contribution for Legacy Builders is due in 3 days.", type: "reminder", read: false, date: "2025-06-12" },
  { id: "n2", title: "Payout Incoming!", message: "Bongani Zulu will receive their R10,000 payout on June 30.", type: "payout", read: false, date: "2025-06-10" },
  { id: "n3", title: "New Vote", message: "A new proposal has been submitted: Change meeting time to Saturdays.", type: "vote", read: true, date: "2025-06-10" },
  { id: "n4", title: "Payment Received", message: "Your R1,000 contribution for Round 5 has been confirmed.", type: "payment", read: true, date: "2025-06-01" },
  { id: "n5", title: "Late Payment Alert", message: "Bongani Zulu's payment for Round 5 was received 4 days late.", type: "system", read: true, date: "2025-06-05" },
];

// Helper: Get commitment score color
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
