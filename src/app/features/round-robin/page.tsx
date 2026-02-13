"use client";

import { Users, RotateCcw, Calendar, ArrowRightLeft, Zap } from "lucide-react";
import FeatureLayout from "@/components/FeatureLayout";

export default function RoundRobinPage() {
  return (
    <FeatureLayout
      icon={<Users className="w-8 h-8" />}
      title="Round Robin Engine"
      subtitle="Automated payout rotation. The system tracks whose turn it is and calculates everything for you — no spreadsheets needed."
      gradient="bg-gradient-to-br from-blue-900 via-indigo-900 to-blue-800"
      prevFeature={{ href: "/features/virtual-ledger", label: "Virtual Ledger" }}
      nextFeature={{ href: "/features/commitment-score", label: "Commitment Score" }}
    >
      <div className="space-y-16">
        {/* Key benefits */}
        <div>
          <h2 className="text-2xl font-bold text-kasi-charcoal mb-8">Fair rotation, guaranteed.</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                icon: <RotateCcw className="w-6 h-6" />,
                title: "Automatic Rotation",
                description: "Each member gets assigned a payout position when they join. The system advances through rounds automatically.",
              },
              {
                icon: <Calendar className="w-6 h-6" />,
                title: "Flexible Schedules",
                description: "Weekly or monthly contribution cycles. Set what works for your group and the engine handles the rest.",
              },
              {
                icon: <ArrowRightLeft className="w-6 h-6" />,
                title: "Pool Calculation",
                description: "Total payout = contribution × number of members. The math is always right and always visible.",
              },
              {
                icon: <Zap className="w-6 h-6" />,
                title: "Instant Status",
                description: "Always know: what round you're in, who's been paid, who's next, and how much is in the pool.",
              },
            ].map((item, i) => (
              <div key={i} className="card-hover p-6">
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                  {item.icon}
                </div>
                <h3 className="font-semibold text-lg text-kasi-charcoal mb-2">{item.title}</h3>
                <p className="text-gray-500 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Example */}
        <div className="bg-gray-50 rounded-3xl p-8 md:p-12">
          <h2 className="text-2xl font-bold text-kasi-charcoal mb-6">Example: 5 Members, R500/month</h2>
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-6 border border-gray-100">
              <div className="grid grid-cols-3 gap-4 text-center mb-6">
                <div>
                  <p className="text-2xl font-bold text-kasi-green">R500</p>
                  <p className="text-sm text-gray-500">Monthly contribution</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-kasi-gold">R2,500</p>
                  <p className="text-sm text-gray-500">Payout per round</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-kasi-charcoal">5</p>
                  <p className="text-sm text-gray-500">Total rounds</p>
                </div>
              </div>
              <div className="space-y-3">
                {["Thabo gets R2,500", "Nomsa gets R2,500", "Sipho gets R2,500", "Lerato gets R2,500", "You get R2,500"].map((text, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white ${i === 4 ? "bg-kasi-gold" : "bg-gray-300"}`}>
                      {i + 1}
                    </div>
                    <span className={i === 4 ? "font-semibold text-kasi-charcoal" : "text-gray-500"}>
                      Round {i + 1}: {text}
                    </span>
                    {i < 2 && <span className="badge-green ml-auto">✓ Paid</span>}
                    {i === 2 && <span className="badge-gold ml-auto">Current</span>}
                  </div>
                ))}
              </div>
            </div>
            <p className="text-gray-400 text-sm text-center">Every member contributes R2,500 total and receives R2,500 — the benefit is getting it all at once.</p>
          </div>
        </div>
      </div>
    </FeatureLayout>
  );
}
