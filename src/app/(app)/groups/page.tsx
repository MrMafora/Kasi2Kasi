"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Users, Calendar, Search } from "lucide-react";
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

  const filteredGroups = groups.filter((g) =>
    g.name.toLowerCase().includes(search.toLowerCase()) ||
    g.description.toLowerCase().includes(search.toLowerCase())
  );

  if (authLoading || loading) {
    return (
      <div className="max-w-lg mx-auto pt-20">
        <LoadingSpinner message="Loading Stokvels..." />
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 pt-12">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-kasi-charcoal">My Stokvels</h1>
        <Link href="/groups/new" className="btn-primary !py-2 !px-4 text-sm flex items-center gap-1.5">
          <Plus className="w-4 h-4" /> New
        </Link>
      </div>

      {groups.length > 0 && (
        <div className="relative mb-6">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            className="input-field pl-10 text-sm"
            placeholder="Search your Stokvels..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      )}

      <div className="space-y-3">
        {filteredGroups.length === 0 && groups.length === 0 ? (
          <div className="card text-center py-12">
            <Users className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <h3 className="font-semibold text-kasi-charcoal mb-1">No Stokvels yet</h3>
            <p className="text-gray-400 text-sm mb-4">Create your first Stokvel to get started</p>
            <Link href="/groups/new" className="btn-primary text-sm inline-flex items-center gap-1.5">
              <Plus className="w-4 h-4" /> Create Stokvel
            </Link>
          </div>
        ) : filteredGroups.length === 0 ? (
          <div className="card text-center py-8">
            <p className="text-gray-400 text-sm">No Stokvels match your search</p>
          </div>
        ) : (
          filteredGroups.map((group) => (
            <Link key={group.id} href={`/groups/${group.id}`} className="card-hover block">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-kasi-green/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-kasi-green font-bold text-sm">
                      {getInitials(group.name)}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-kasi-charcoal">{group.name}</h3>
                    <p className="text-gray-500 text-xs mt-0.5">{group.description}</p>
                  </div>
                </div>
                <span className="badge-green flex-shrink-0">{group.status}</span>
              </div>

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
            </Link>
          ))
        )}

        {groups.length > 0 && (
          <Link
            href="/groups/new"
            className="card-hover border-dashed border-2 border-gray-200 flex items-center justify-center gap-2 text-gray-400 hover:text-kasi-green hover:border-kasi-green/30 py-8"
          >
            <Plus className="w-5 h-5" />
            <span className="font-medium">Create New Stokvel</span>
          </Link>
        )}
      </div>
    </div>
  );
}
