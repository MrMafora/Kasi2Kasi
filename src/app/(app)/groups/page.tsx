"use client";

import Link from "next/link";
import { Plus, Users, Calendar, Search } from "lucide-react";
import { mockGroups, formatCurrency } from "@/lib/mock-data";

export default function GroupsPage() {
  return (
    <div className="max-w-lg mx-auto px-4 pt-12">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-kasi-charcoal">My Stokvels</h1>
        <Link href="/groups/new" className="btn-primary !py-2 !px-4 text-sm flex items-center gap-1.5">
          <Plus className="w-4 h-4" /> New
        </Link>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          className="input-field pl-10 text-sm"
          placeholder="Search your Stokvels..."
        />
      </div>

      <div className="space-y-3">
        {mockGroups.map((group) => (
          <Link key={group.id} href={`/groups/${group.id}`} className="card-hover block">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-kasi-green/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-kasi-green font-bold text-sm">
                    {group.name.split(" ").map(w => w[0]).join("")}
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
                  <Users className="w-3 h-3" /> {group.totalMembers}/{group.maxMembers}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-400">Round</p>
                <p className="font-semibold text-sm text-kasi-charcoal flex items-center justify-center gap-1">
                  <Calendar className="w-3 h-3" /> {group.currentRound}/{group.totalRounds}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-400">Contribution</p>
                <p className="font-semibold text-sm text-kasi-green">
                  {formatCurrency(group.contributionAmount)}
                </p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                <span>Progress</span>
                <span>{Math.round((group.currentRound / group.totalRounds) * 100)}%</span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-kasi-green rounded-full transition-all"
                  style={{ width: `${(group.currentRound / group.totalRounds) * 100}%` }}
                />
              </div>
            </div>
          </Link>
        ))}

        {/* Create new */}
        <Link
          href="/groups/new"
          className="card-hover border-dashed border-2 border-gray-200 flex items-center justify-center gap-2 text-gray-400 hover:text-kasi-green hover:border-kasi-green/30 py-8"
        >
          <Plus className="w-5 h-5" />
          <span className="font-medium">Create New Stokvel</span>
        </Link>
      </div>
    </div>
  );
}
