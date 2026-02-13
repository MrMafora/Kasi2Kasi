"use client";

import { Shield, TrendingUp, AlertTriangle, Award, BarChart3 } from "lucide-react";
import FeatureLayout from "@/components/FeatureLayout";

export default function CommitmentScorePage() {
  return (
    <FeatureLayout
      icon={<Shield className="w-8 h-8" />}
      title="Commitment Score"
      subtitle="Each member gets a trust rating based on their payment history. No more guessing who's reliable — the numbers speak."
      gradient="bg-gradient-to-br from-amber-900 via-orange-900 to-amber-800"
      prevFeature={{ href: "/features/round-robin", label: "Round Robin Engine" }}
      nextFeature={{ href: "/features/democratic-governance", label: "Democratic Governance" }}
    >
      <div className="space-y-16">
        {/* Score breakdown */}
        <div>
          <h2 className="text-2xl font-bold text-kasi-charcoal mb-8">Trust, measured.</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                icon: <Award className="w-6 h-6" />,
                title: "Score Range: 0–100",
                description: "Every member starts at 100. Your score reflects your payment consistency — on-time payments keep it high.",
                color: "bg-emerald-50 text-emerald-600",
              },
              {
                icon: <TrendingUp className="w-6 h-6" />,
                title: "Builds Over Time",
                description: "The more rounds you complete with on-time payments, the stronger your score becomes. Consistency is rewarded.",
                color: "bg-blue-50 text-blue-600",
              },
              {
                icon: <AlertTriangle className="w-6 h-6" />,
                title: "Late = Score Drop",
                description: "Late or missed payments reduce your score. It's visible to the whole group — social accountability built in.",
                color: "bg-amber-50 text-amber-600",
              },
              {
                icon: <BarChart3 className="w-6 h-6" />,
                title: "Group Health View",
                description: "Chairpersons can see the group's overall commitment health at a glance. Spot problems before they grow.",
                color: "bg-purple-50 text-purple-600",
              },
            ].map((item, i) => (
              <div key={i} className="card-hover p-6">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${item.color}`}>
                  {item.icon}
                </div>
                <h3 className="font-semibold text-lg text-kasi-charcoal mb-2">{item.title}</h3>
                <p className="text-gray-500 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Score levels */}
        <div className="bg-gray-50 rounded-3xl p-8 md:p-12">
          <h2 className="text-2xl font-bold text-kasi-charcoal mb-8">Score Levels</h2>
          <div className="space-y-4">
            {[
              { range: "90–100", label: "Excellent", color: "bg-emerald-500", textColor: "text-emerald-600", description: "Consistently on time. A pillar of the group." },
              { range: "70–89", label: "Good", color: "bg-blue-500", textColor: "text-blue-600", description: "Mostly reliable with minor lapses." },
              { range: "50–69", label: "Fair", color: "bg-amber-500", textColor: "text-amber-600", description: "Some late or missed payments. Needs attention." },
              { range: "0–49", label: "At Risk", color: "bg-red-500", textColor: "text-red-600", description: "Frequent missed payments. Group may vote on action." },
            ].map((level, i) => (
              <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 flex items-center gap-4">
                <div className={`w-3 h-12 rounded-full ${level.color}`} />
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-bold text-kasi-charcoal">{level.range}</span>
                    <span className={`font-semibold text-sm ${level.textColor}`}>{level.label}</span>
                  </div>
                  <p className="text-gray-500 text-sm">{level.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Why it matters */}
        <div className="text-center py-8">
          <blockquote className="text-xl md:text-2xl font-medium text-kasi-charcoal italic">
            &ldquo;When everyone can see the scores, people pay on time. It&apos;s not about punishment — it&apos;s about accountability.&rdquo;
          </blockquote>
          <p className="text-gray-400 mt-4">— Stokvel Treasurer, Khayelitsha</p>
        </div>
      </div>
    </FeatureLayout>
  );
}
