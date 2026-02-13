"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Users, Calendar, Search, Target } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getMyGroups } from "@/lib/database";
import { formatCurrency, getInitials } from "@/lib/types";
import type { GroupWithDetails } from "@/lib/types";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function GroupsPage() {
  const { user, loading: authLoading } = useAuth();
  const [groups, setGroups] = useState<GroupWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "stokvel" | "goal">("all");

  useEffect(() => {
    async function loadData() {
      if (!user) return;
      try {
        const data = await getMyGroups(user.id);
        setGroups(data);
      } catch (err) {
        console.error("Failed to load groups:", err);
      } finally {
        setLoading(false);
      }
    }
    if (!authLoading) loadData();
  }, [user, authLoading]);

  const filteredGroups = groups.filter((g) => {
    const matchesSearch = g.name.toLowerCase().includes(search.toLowerCase()) ||
      g.description.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "all" || g.type === filter;
    return matchesSearch && matchesFilter;
  });

  const hasGoals = groups.some(g => g.type === "goal");
  const hasStokvels = groups.some(g => g.type !== "goal");

  if (authLoading || loading) {
    return (
      <div className="max-w-lg mx-auto pt-20">
        <LoadingSpinner message="Loading groups..." />
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 pt-12 pb-24">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-kasi-charcoal">My Groups</h1>
        <div className="flex gap-2">
          <Link href="/goals/new" className="btn-secondary !py-2 !px-3 text-sm flex items-center gap-1.5">
            <Target className="w-4 h-4 text-amber-600" />
          </Link>
          <Link href="/groups/new" className="btn-primary !py-2 !px-4 text-sm flex items-center gap-1.5">
            <Plus className="w-4 h-4" /> New
          </Link>
        </div>
      </div>

      {groups.length > 0 && (
        <>
          <div className="relative mb-4">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              className="input-field pl-10 text-sm"
              placeholder="Search groups..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          {hasGoals && hasStokvels && (
            <div className="flex gap-2 mb-4">
              {(["all", "stokvel", "goal"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    filter === f
                      ? "bg-kasi-green text-white"
                      : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                  }`}
                >
                  {f === "all" ? "All" : f === "stokvel" ? "Stokvels" : "Goal Funds"}
                </button>
              ))}
            </div>
          )}
        </>
      )}

      <div className="space-y-3">
        {filteredGroups.length === 0 && groups.length === 0 ? (
          <div className="card text-center py-12">
            <Users className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <h3 className="font-semibold text-kasi-charcoal mb-1">No groups yet</h3>
            <p className="text-gray-400 text-sm mb-4">Create a Stokvel or Goal Fund to get started</p>
            <div className="flex gap-2 justify-center">
              <Link href="/groups/new" className="btn-primary text-sm inline-flex items-center gap-1.5">
                <Plus className="w-4 h-4" /> Stokvel
              </Link>
              <Link href="/goals/new" className="btn-secondary text-sm inline-flex items-center gap-1.5">
                <Target className="w-4 h-4 text-amber-600" /> Goal Fund
              </Link>
            </div>
          </div>
        ) : filteredGroups.length === 0 ? (
          <div className="card text-center py-8">
            <p className="text-gray-400 text-sm">No groups match your search</p>
          </div>
        ) : (
          filteredGroups.map((group) => {
            const isGoal = group.type === "goal";
            return (
              <Link key={group.id} href={`/groups/${group.id}`} className="card-hover block">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      isGoal ? "bg-amber-50" : "bg-kasi-green/10"
                    }`}>
                      {isGoal ? (
                        <Target className="w-5 h-5 text-amber-600" />
                      ) : (
                        <span className="text-kasi-green font-bold text-sm">
                          {getInitials(group.name)}
                        </span>
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-kasi-charcoal">{group.name}</h3>
                      <p className="text-gray-500 text-xs mt-0.5">
                        {isGoal ? (group.goal_description || group.description) : group.description}
                      </p>
                    </div>
                  </div>
                  <span className={`flex-shrink-0 ${isGoal ? "badge-gold" : "badge-green"}`}>
                    {isGoal ? "Goal" : group.status}
                  </span>
                </div>

                {isGoal ? (
                  <>
                    <div className="grid grid-cols-2 gap-3 mt-4">
                      <div className="text-center">
                        <p className="text-xs text-gray-400">Members</p>
                        <p className="font-semibold text-sm text-kasi-charcoal flex items-center justify-center gap-1">
                          <Users className="w-3 h-3" /> {group.member_count}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-400">Monthly Target</p>
                        <p className="font-semibold text-sm text-amber-600">
                          {formatCurrency(group.goal_monthly_target || 0)}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                        <span>Pool: {formatCurrency(group.total_pool)}</span>
                        <span className="text-amber-600 font-medium">{group.goal_monthly_target ? Math.round((group.total_pool / group.goal_monthly_target) * 100) : 0}%</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-amber-400 to-orange-400 rounded-full transition-all"
                          style={{ width: `${Math.min(100, Math.max(3, group.goal_monthly_target ? (group.total_pool / group.goal_monthly_target) * 100 : 0))}%` }}
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="grid grid-cols-3 gap-3 mt-4">
                      <div className="text-center">
                        <p className="text-xs text-gray-400">Members</p>
                        <p className="font-semibold text-sm text-kasi-charcoal flex items-center justify-center gap-1">
                          <Users className="w-3 h-3" /> {group.member_count}/{group.max_members}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-400">Round</p>
                        <p className="font-semibold text-sm text-kasi-charcoal flex items-center justify-center gap-1">
                          <Calendar className="w-3 h-3" /> {group.current_round}/{group.total_rounds}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-400">Contribution</p>
                        <p className="font-semibold text-sm text-kasi-green">
                          {formatCurrency(group.contribution_amount)}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                        <span>Progress</span>
                        <span>{Math.round((group.current_round / group.total_rounds) * 100)}%</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-kasi-green rounded-full transition-all"
                          style={{ width: `${(group.current_round / group.total_rounds) * 100}%` }}
                        />
                      </div>
                    </div>
                  </>
                )}
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
