"use client";

import { CheckCircle2, FileText, UserCheck, Lock, Pen } from "lucide-react";
import FeatureLayout from "@/components/FeatureLayout";

export default function DigitalConstitutionPage() {
  return (
    <FeatureLayout
      icon={<CheckCircle2 className="w-8 h-8" />}
      title="Digital Constitution"
      subtitle="Your group rules, formalized digitally. Every member reads and signs off before joining — no surprises, no excuses."
      gradient="bg-gradient-to-br from-teal-900 via-cyan-900 to-teal-800"
      prevFeature={{ href: "/features/mobile", label: "Works on Any Phone" }}
    >
      <div className="space-y-16">
        {/* Key benefits */}
        <div>
          <h2 className="text-2xl font-bold text-kasi-charcoal mb-8">Rules everyone agreed to.</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                icon: <FileText className="w-6 h-6" />,
                title: "Written Rules",
                description: "The chairperson sets the group's constitution — contribution amounts, penalties, payout order, and any custom rules.",
              },
              {
                icon: <UserCheck className="w-6 h-6" />,
                title: "Member Sign-Off",
                description: "Before joining a group, every member must read and accept each rule. It's a digital handshake.",
              },
              {
                icon: <Lock className="w-6 h-6" />,
                title: "Permanently Recorded",
                description: "Who accepted what, and when — it's all tracked. No 'I didn't know that was a rule' arguments.",
              },
              {
                icon: <Pen className="w-6 h-6" />,
                title: "Amendable by Vote",
                description: "Rules aren't set in stone. The group can vote to change them through the democratic governance system.",
              },
            ].map((item, i) => (
              <div key={i} className="card-hover p-6">
                <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center mb-4">
                  {item.icon}
                </div>
                <h3 className="font-semibold text-lg text-kasi-charcoal mb-2">{item.title}</h3>
                <p className="text-gray-500 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Example constitution */}
        <div className="bg-gray-50 rounded-3xl p-8 md:p-12">
          <h2 className="text-2xl font-bold text-kasi-charcoal mb-6">Example Constitution</h2>
          <p className="text-gray-500 mb-8">Here's what a typical Stokvel constitution might look like:</p>
          <div className="space-y-3">
            {[
              { title: "Monthly Contribution", description: "Each member contributes R500 on or before the 1st of every month." },
              { title: "Late Payment Penalty", description: "Payments received after the 3rd incur a R50 late fee added to the next round." },
              { title: "Missed Payment", description: "Two consecutive missed payments result in automatic suspension pending group vote." },
              { title: "Payout Order", description: "Payout positions are assigned at join time. The order does not change unless voted on." },
              { title: "Emergency Exit", description: "A member may exit early but forfeits any payout not yet received. Contributions are not refunded." },
              { title: "Disputes", description: "All disputes are resolved by majority vote. The chairperson has a tiebreaker vote." },
            ].map((rule, i) => (
              <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100">
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-8 h-8 bg-teal-100 text-teal-600 rounded-lg flex items-center justify-center text-sm font-bold">
                    {i + 1}
                  </span>
                  <div>
                    <h3 className="font-semibold text-kasi-charcoal mb-1">{rule.title}</h3>
                    <p className="text-gray-500 text-sm">{rule.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Why it matters */}
        <div className="text-center py-8">
          <blockquote className="text-xl md:text-2xl font-medium text-kasi-charcoal italic">
            &ldquo;When the rules are written down and everyone signed, there&apos;s no fighting. Everyone knows the deal.&rdquo;
          </blockquote>
          <p className="text-gray-400 mt-4">— Stokvel Secretary, Mamelodi</p>
        </div>
      </div>
    </FeatureLayout>
  );
}
