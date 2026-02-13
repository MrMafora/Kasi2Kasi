"use client";

import { Banknote, Receipt, Clock } from "lucide-react";
import { formatCurrency } from "@/lib/types";
import type { Transaction, Expense } from "@/lib/types";

interface ActivityFeedProps {
  transactions: Transaction[];
  expenses: Expense[];
  limit?: number;
}

interface ActivityItem {
  id: string;
  type: "contribution" | "payout" | "expense";
  description: string;
  amount: number;
  timestamp: string;
}

export default function ActivityFeed({ transactions, expenses, limit = 10 }: ActivityFeedProps) {
  const items: ActivityItem[] = [
    ...transactions.map((t) => ({
      id: t.id,
      type: t.type as "contribution" | "payout",
      description:
        t.type === "contribution"
          ? `${t.member_name || "Member"} contributed`
          : t.type === "payout"
          ? `${t.member_name || "Member"} received payout`
          : `${t.member_name || "Member"} — ${t.type}`,
      amount: t.amount,
      timestamp: t.created_at,
    })),
    ...expenses.map((e) => ({
      id: e.id,
      type: "expense" as const,
      description: `Expense recorded: ${e.description}`,
      amount: e.amount,
      timestamp: e.created_at,
    })),
  ]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, limit);

  if (items.length === 0) {
    return (
      <div className="card text-center py-6">
        <Clock className="w-6 h-6 text-gray-300 mx-auto mb-2" />
        <p className="text-gray-400 text-sm">No activity yet</p>
      </div>
    );
  }

  const iconFor = (type: string) => {
    switch (type) {
      case "contribution":
        return (
          <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
            <Banknote className="w-4 h-4 text-emerald-600" />
          </div>
        );
      case "payout":
        return (
          <div className="w-8 h-8 bg-kasi-gold/20 rounded-full flex items-center justify-center flex-shrink-0">
            <Banknote className="w-4 h-4 text-kasi-gold" />
          </div>
        );
      case "expense":
        return (
          <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
            <Receipt className="w-4 h-4 text-red-500" />
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
            <Clock className="w-4 h-4 text-gray-400" />
          </div>
        );
    }
  };

  const amountColor = (type: string) => {
    switch (type) {
      case "contribution": return "text-emerald-600";
      case "payout": return "text-kasi-gold";
      case "expense": return "text-red-500";
      default: return "text-gray-600";
    }
  };

  return (
    <div className="card">
      <h3 className="font-semibold text-sm text-kasi-charcoal mb-4">Recent Activity</h3>
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-4 top-4 bottom-4 w-px bg-gray-100" />
        <div className="space-y-1">
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-3 py-2 relative">
              {iconFor(item.type)}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-kasi-charcoal truncate">{item.description}</p>
                <p className="text-[10px] text-gray-400">
                  {new Date(item.timestamp).toLocaleDateString("en-ZA", {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              <span className={`text-sm font-semibold ${amountColor(item.type)} flex-shrink-0`}>
                {item.type === "expense" ? "-" : "+"}{formatCurrency(item.amount)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
