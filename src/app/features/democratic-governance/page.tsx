"use client";

import { Vote, Users, Scale, MessageSquare, ShieldCheck } from "lucide-react";
import FeatureLayout from "@/components/FeatureLayout";

export default function DemocraticGovernancePage() {
  return (
    <FeatureLayout
      icon={<Vote className="w-8 h-8" />}
      title="Democratic Governance"
      subtitle="Vote on rule changes, swap leadership, and make group decisions — all within the app. Every voice counts."
      gradient="bg-gradient-to-br from-purple-900 via-violet-900 to-purple-800"
      prevFeature={{ href: "/features/commitment-score", label: "Commitment Score" }}
      nextFeature={{ href: "/features/mobile", label: "Works on Any Phone" }}
    >
      <div className="space-y-16">
        {/* Key features */}
        <div>
          <h2 className="text-2xl font-bold text-kasi-charcoal mb-8">Your group, your rules.</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                icon: <Vote className="w-6 h-6" />,
                title: "In-App Voting",
                description: "Any member can propose a vote. Everyone gets to weigh in — for or against. Results are transparent and final.",
              },
              {
                icon: <Users className="w-6 h-6" />,
                title: "Role Changes",
                description: "Need a new chairperson or treasurer? Put it to a vote. Leadership transitions happen smoothly and fairly.",
              },
              {
                icon: <Scale className="w-6 h-6" />,
                title: "Rule Amendments",
                description: "Want to change the contribution amount or frequency? Propose it, vote on it, implement it — all tracked.",
              },
              {
                icon: <MessageSquare className="w-6 h-6" />,
                title: "Member Disputes",
                description: "If a member needs to be suspended or exited, the group decides together. No one person holds all the power.",
              },
            ].map((item, i) => (
              <div key={i} className="card-hover p-6">
                <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
                  {item.icon}
                </div>
                <h3 className="font-semibold text-lg text-kasi-charcoal mb-2">{item.title}</h3>
                <p className="text-gray-500 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Vote types */}
        <div className="bg-gray-50 rounded-3xl p-8 md:p-12">
          <h2 className="text-2xl font-bold text-kasi-charcoal mb-8">Vote Types</h2>
          <div className="space-y-4">
            {[
              { type: "General", emoji: "📋", description: "Open-ended proposals for anything the group needs to decide on." },
              { type: "Rule Change", emoji: "📝", description: "Amend the group's constitution — contribution amounts, schedules, penalties." },
              { type: "Role Change", emoji: "👑", description: "Elect a new chairperson, treasurer, or secretary." },
              { type: "Member Exit", emoji: "🚪", description: "Vote on whether a member should be suspended or removed from the group." },
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 flex items-center gap-4">
                <div className="text-3xl">{item.emoji}</div>
                <div>
                  <h3 className="font-semibold text-kasi-charcoal mb-1">{item.type}</h3>
                  <p className="text-gray-500 text-sm">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* How voting works */}
        <div>
          <h2 className="text-2xl font-bold text-kasi-charcoal mb-8">How Voting Works</h2>
          <div className="space-y-4">
            {[
              { step: "1", text: "Any active member proposes a vote with a title and description" },
              { step: "2", text: "All members receive a notification and can vote For or Against" },
              { step: "3", text: "Votes have an expiry date — no dragging things out" },
              { step: "4", text: "Results are tallied automatically — majority wins" },
              { step: "5", text: "The outcome is recorded permanently in the group history" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors">
                <div className="flex-shrink-0 w-10 h-10 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center font-bold">
                  {item.step}
                </div>
                <p className="text-gray-600">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </FeatureLayout>
  );
}
