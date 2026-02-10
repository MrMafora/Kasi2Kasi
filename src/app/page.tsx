"use client";

import Link from "next/link";
import Image from "next/image";
import { Shield, Users, BarChart3, Vote, ArrowRight, Smartphone, CheckCircle2 } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image src="/icons/logo.png" alt="K2K" width={36} height={36} className="rounded-xl" />
            <span className="font-bold text-xl text-kasi-charcoal">Kasi2Kasi</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-kasi-charcoal transition-colors px-4 py-2">
              Sign In
            </Link>
            <Link href="/register" className="btn-primary text-sm !py-2 !px-4">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-kasi-green/10 text-kasi-green px-4 py-1.5 rounded-full text-sm font-medium mb-6">
            <Shield className="w-4 h-4" />
            Trusted by Kasi Communities
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-kasi-charcoal leading-tight mb-6">
            Your Stokvel,{" "}
            <span className="text-kasi-green">Digitized.</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            Replace the paper ledger with a secure, transparent platform. 
            Track contributions, automate payouts, and build trust — 
            from <strong className="text-gray-700">Kasi to Kasi</strong>.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register" className="btn-primary text-base flex items-center justify-center gap-2">
              Start Your Stokvel <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/login" className="btn-secondary text-base">
              I Have an Account
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-kasi-charcoal mb-4">
              Everything your Stokvel needs
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Built by the community, for the community. No more paper ledgers, 
              no more &ldquo;who paid what?&rdquo; arguments.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: <BarChart3 className="w-6 h-6" />,
                title: "Virtual Ledger",
                description: "Real-time tracking of every contribution. See exactly who paid, when, and how much — all transparent.",
                color: "bg-emerald-100 text-emerald-600",
              },
              {
                icon: <Users className="w-6 h-6" />,
                title: "Round Robin Engine",
                description: "Automated payout rotation. The system tracks whose turn it is and calculates everything for you.",
                color: "bg-blue-100 text-blue-600",
              },
              {
                icon: <Shield className="w-6 h-6" />,
                title: "Commitment Score",
                description: "Each member gets a trust rating based on payment history. No more guessing who's reliable.",
                color: "bg-amber-100 text-amber-600",
              },
              {
                icon: <Vote className="w-6 h-6" />,
                title: "Democratic Governance",
                description: "Vote on rule changes, swap leadership, and make group decisions — all within the app.",
                color: "bg-purple-100 text-purple-600",
              },
              {
                icon: <Smartphone className="w-6 h-6" />,
                title: "Works on Any Phone",
                description: "Lightweight, fast, and low-data friendly. Install it right from your browser — no app store needed.",
                color: "bg-rose-100 text-rose-600",
              },
              {
                icon: <CheckCircle2 className="w-6 h-6" />,
                title: "Digital Constitution",
                description: "Your group rules, formalized digitally. Every member signs off before joining.",
                color: "bg-teal-100 text-teal-600",
              },
            ].map((feature, i) => (
              <div key={i} className="card-hover">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${feature.color}`}>
                  {feature.icon}
                </div>
                <h3 className="font-semibold text-lg text-kasi-charcoal mb-2">{feature.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-kasi-charcoal mb-4">
              How it works
            </h2>
            <p className="text-gray-500">Three simple steps to get your Stokvel running</p>
          </div>

          <div className="space-y-8">
            {[
              { step: "01", title: "Create Your Group", description: "Sign up, name your Stokvel, and set the contribution amount and cycle length. You become the Chairperson." },
              { step: "02", title: "Invite Members", description: "Share an invite link via WhatsApp or SMS. Members join, accept the digital constitution, and get assigned roles." },
              { step: "03", title: "Track & Grow", description: "Contributions are tracked automatically. Payouts rotate each month. Everyone sees everything — full transparency." },
            ].map((item, i) => (
              <div key={i} className="flex gap-6 items-start">
                <div className="flex-shrink-0 w-14 h-14 bg-kasi-green/10 rounded-2xl flex items-center justify-center">
                  <span className="font-bold text-kasi-green text-lg">{item.step}</span>
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-kasi-charcoal mb-1">{item.title}</h3>
                  <p className="text-gray-500 leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-20 px-4 bg-kasi-charcoal text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Built on Botho</h2>
          <p className="text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Kasi2Kasi doesn&apos;t touch your money. We provide the secure orchestration layer — 
            the digital handshake between members. Your funds stay in your accounts, 
            transferred directly via secure payment gateways.
          </p>
          <div className="grid grid-cols-3 gap-8">
            <div>
              <div className="text-3xl font-bold text-kasi-gold mb-1">R50B+</div>
              <div className="text-sm text-gray-400">SA Stokvel Market</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-kasi-gold mb-1">11.5M</div>
              <div className="text-sm text-gray-400">Stokvel Members in SA</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-kasi-gold mb-1">800K+</div>
              <div className="text-sm text-gray-400">Active Stokvels</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-kasi-charcoal mb-4">
            Ready to digitize your Stokvel?
          </h2>
          <p className="text-gray-500 mb-8">
            Join the movement. Start managing your community savings the modern way.
          </p>
          <Link href="/register" className="btn-primary text-base inline-flex items-center gap-2">
            Get Started Free <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-gray-100">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Image src="/icons/logo.png" alt="K2K" width={28} height={28} className="rounded-lg" />
            <span className="font-semibold text-kasi-charcoal">Kasi2Kasi</span>
          </div>
          <p className="text-sm text-gray-400">
            © 2025 Kasi2Kasi Digital Stokvels. Built for the community.
          </p>
        </div>
      </footer>
    </div>
  );
}
