"use client";

import { BarChart3, Eye, Clock, Shield, CheckCircle2 } from "lucide-react";
import FeatureLayout from "@/components/FeatureLayout";

export default function VirtualLedgerPage() {
  return (
    <FeatureLayout
      icon={<BarChart3 className="w-8 h-8" />}
      title="Virtual Ledger"
      subtitle="Real-time tracking of every contribution. See exactly who paid, when, and how much — all transparent, all the time."
      gradient="gradient-hero"
      nextFeature={{ href: "/features/round-robin", label: "Round Robin Engine" }}
    >
      <div className="space-y-16">
        {/* Key benefits */}
        <div>
          <h2 className="text-2xl font-bold text-kasi-charcoal mb-8">No more paper. No more arguments.</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                icon: <Eye className="w-6 h-6" />,
                title: "Full Transparency",
                description: "Every member can see all contributions in real time. No hidden numbers, no back-room bookkeeping.",
              },
              {
                icon: <Clock className="w-6 h-6" />,
                title: "Payment History",
                description: "Complete transaction history for every member. Know who paid on time, who was late, and who missed — instantly.",
              },
              {
                icon: <Shield className="w-6 h-6" />,
                title: "Tamper-Proof Records",
                description: "Once recorded, transactions can't be edited or deleted. The ledger is the single source of truth.",
              },
              {
                icon: <CheckCircle2 className="w-6 h-6" />,
                title: "Round Tracking",
                description: "See exactly which round you're in, how much has been collected, and who's next for a payout.",
              },
            ].map((item, i) => (
              <div key={i} className="card-hover p-6">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                  {item.icon}
                </div>
                <h3 className="font-semibold text-lg text-kasi-charcoal mb-2">{item.title}</h3>
                <p className="text-gray-500 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* How it works */}
        <div className="bg-gray-50 rounded-3xl p-8 md:p-12">
          <h2 className="text-2xl font-bold text-kasi-charcoal mb-8">How the Ledger Works</h2>
          <div className="space-y-6">
            {[
              { step: "1", title: "Member makes a contribution", description: "When a member pays their contribution, it gets recorded on the ledger with a timestamp and amount." },
              { step: "2", title: "Everyone sees the update", description: "All group members can view the updated ledger in real time from their dashboard." },
              { step: "3", title: "Stats update automatically", description: "Member commitment scores, total pool amounts, and round progress all update instantly." },
              { step: "4", title: "Payout triggers when ready", description: "Once all contributions for a round are in, the system flags the payout as ready for the next member in rotation." },
            ].map((item, i) => (
              <div key={i} className="flex gap-4 items-start">
                <div className="flex-shrink-0 w-10 h-10 bg-kasi-green rounded-xl flex items-center justify-center">
                  <span className="font-bold text-white">{item.step}</span>
                </div>
                <div>
                  <h3 className="font-semibold text-kasi-charcoal mb-1">{item.title}</h3>
                  <p className="text-gray-500">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quote */}
        <div className="text-center py-8">
          <blockquote className="text-xl md:text-2xl font-medium text-kasi-charcoal italic">
            &ldquo;The paper book got lost twice. With Kasi2Kasi, everyone can check the numbers from their phone.&rdquo;
          </blockquote>
          <p className="text-gray-400 mt-4">— Stokvel Chairperson, Soweto</p>
        </div>
      </div>
    </FeatureLayout>
  );
}
