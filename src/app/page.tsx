"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Shield, Users, BarChart3, Vote, ArrowRight, Smartphone, CheckCircle2, Zap, TrendingUp, ChevronRight } from "lucide-react";

function AnimatedCounter({ target, prefix = "", suffix = "" }: { target: string; prefix?: string; suffix?: string }) {
  const [display, setDisplay] = useState("0");
  useEffect(() => {
    const num = parseFloat(target.replace(/[^0-9.]/g, ""));
    const duration = 2000;
    const steps = 60;
    const increment = num / steps;
    let current = 0;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      current += increment;
      if (step >= steps) {
        setDisplay(target);
        clearInterval(timer);
      } else {
        if (num >= 100) setDisplay(Math.floor(current).toLocaleString());
        else setDisplay(current.toFixed(1));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [target]);
  return <span>{prefix}{display}{suffix}</span>;
}

export default function LandingPage() {
  const [activeFeature, setActiveFeature] = useState(0);

  const features = [
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Virtual Ledger",
      description: "Real-time tracking of every contribution. See exactly who paid, when, and how much — all transparent.",
      color: "from-emerald-500 to-teal-600",
      bgLight: "bg-emerald-50",
      textColor: "text-emerald-600",
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Round Robin Engine",
      description: "Automated payout rotation. The system tracks whose turn it is and calculates everything for you.",
      color: "from-blue-500 to-indigo-600",
      bgLight: "bg-blue-50",
      textColor: "text-blue-600",
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Commitment Score",
      description: "Each member gets a trust rating based on payment history. No more guessing who's reliable.",
      color: "from-amber-500 to-orange-600",
      bgLight: "bg-amber-50",
      textColor: "text-amber-600",
    },
    {
      icon: <Vote className="w-6 h-6" />,
      title: "Democratic Governance",
      description: "Vote on rule changes, swap leadership, and make group decisions — all within the app.",
      color: "from-purple-500 to-violet-600",
      bgLight: "bg-purple-50",
      textColor: "text-purple-600",
    },
    {
      icon: <Smartphone className="w-6 h-6" />,
      title: "Works on Any Phone",
      description: "Lightweight, fast, and low-data friendly. Install it right from your browser — no app store needed.",
      color: "from-rose-500 to-pink-600",
      bgLight: "bg-rose-50",
      textColor: "text-rose-600",
    },
    {
      icon: <CheckCircle2 className="w-6 h-6" />,
      title: "Digital Constitution",
      description: "Your group rules, formalized digitally. Every member signs off before joining.",
      color: "from-teal-500 to-cyan-600",
      bgLight: "bg-teal-50",
      textColor: "text-teal-600",
    },
  ];

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 glass-white border-b border-white/30">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image src="/icons/logo.png" alt="K2K" width={36} height={36} className="rounded-xl" />
            <span className="font-bold text-xl text-kasi-charcoal">Kasi2Kasi</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-kasi-green transition-colors px-4 py-2">
              Sign In
            </Link>
            <Link href="/register" className="btn-primary text-sm !py-2 !px-4">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-28 pb-24 px-4 gradient-hero overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-kasi-green/20 rounded-full blur-3xl animate-float" />
          <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-kasi-gold/15 rounded-full blur-3xl animate-float" style={{ animationDelay: "1.5s" }} />
          <div className="absolute top-1/2 right-1/4 w-64 h-64 bg-kasi-green-light/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "0.8s" }} />
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="animate-slide-up">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white/90 px-5 py-2 rounded-full text-sm font-medium mb-8 border border-white/10">
              <Zap className="w-4 h-4 text-kasi-gold" />
              Trusted by Kasi Communities
            </div>
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white leading-tight mb-6 animate-slide-up" style={{ animationDelay: "0.1s" }}>
            Your Stokvel,{" "}
            <span className="bg-gradient-to-r from-kasi-gold to-kasi-gold-light bg-clip-text text-transparent">
              Digitized.
            </span>
          </h1>

          <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto mb-10 leading-relaxed animate-slide-up" style={{ animationDelay: "0.2s" }}>
            Replace the paper ledger with a secure, transparent platform.
            Track contributions, automate payouts, and build trust —
            from <strong className="text-white/80">Kasi to Kasi</strong>.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up" style={{ animationDelay: "0.3s" }}>
            <Link href="/register" className="btn-primary text-base flex items-center justify-center gap-2 !py-4 !px-8 animate-pulse-glow">
              Start Your Stokvel <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/login" className="btn-outline !border-white/20 !text-white hover:!bg-white/10 hover:!border-white/40 text-base !py-4 !px-8">
              I Have an Account
            </Link>
          </div>

          {/* Mini stat bar */}
          <div className="mt-16 flex items-center justify-center gap-8 md:gap-12 animate-slide-up" style={{ animationDelay: "0.5s" }}>
            {[
              { label: "Active Users", value: "2,400+" },
              { label: "Groups Created", value: "180+" },
              { label: "Total Saved", value: "R1.2M+" },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <p className="text-white font-bold text-lg md:text-xl">{stat.value}</p>
                <p className="text-white/40 text-xs">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-4 gradient-mesh relative">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 animate-slide-up">
            <p className="text-kasi-green font-semibold text-sm uppercase tracking-wider mb-3">Features</p>
            <h2 className="text-3xl md:text-4xl font-bold text-kasi-charcoal mb-4">
              Everything your Stokvel needs
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Built by the community, for the community. No more paper ledgers,
              no more &ldquo;who paid what?&rdquo; arguments.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
            {features.map((feature, i) => (
              <div
                key={i}
                className="card-hover group"
                onMouseEnter={() => setActiveFeature(i)}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-all duration-300 ${activeFeature === i
                  ? `bg-gradient-to-br ${feature.color} text-white shadow-lg`
                  : `${feature.bgLight} ${feature.textColor}`
                  }`}>
                  {feature.icon}
                </div>
                <h3 className="font-semibold text-lg text-kasi-charcoal mb-2 group-hover:text-kasi-green transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">{feature.description}</p>
                <div className={`mt-4 flex items-center gap-1 text-sm font-medium transition-all duration-300 ${activeFeature === i ? "opacity-100 translate-x-0 text-kasi-green" : "opacity-0 -translate-x-2"
                  }`}>
                  Learn more <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-kasi-green font-semibold text-sm uppercase tracking-wider mb-3">How it Works</p>
            <h2 className="text-3xl md:text-4xl font-bold text-kasi-charcoal mb-4">
              Three simple steps
            </h2>
            <p className="text-gray-500">Get your Stokvel running in minutes</p>
          </div>

          <div className="space-y-6 stagger-children">
            {[
              { step: "01", title: "Create Your Group", description: "Sign up, name your Stokvel, and set the contribution amount and cycle length. You become the Chairperson.", gradient: "from-kasi-green to-kasi-green-light" },
              { step: "02", title: "Invite Members", description: "Share an invite link via WhatsApp or SMS. Members join, accept the digital constitution, and get assigned payout positions.", gradient: "from-kasi-gold-dark to-kasi-gold" },
              { step: "03", title: "Track & Grow", description: "Contributions are tracked automatically. Payouts rotate each round. Everyone sees everything — full transparency.", gradient: "from-kasi-green-dark to-kasi-green" },
            ].map((item, i) => (
              <div key={i} className="group flex gap-6 items-start p-6 rounded-2xl hover:bg-gray-50/80 transition-all duration-300 cursor-default">
                <div className={`flex-shrink-0 w-14 h-14 bg-gradient-to-br ${item.gradient} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <span className="font-bold text-white text-lg">{item.step}</span>
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-kasi-charcoal mb-1 group-hover:text-kasi-green transition-colors">{item.title}</h3>
                  <p className="text-gray-500 leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-24 px-4 gradient-hero text-white relative overflow-hidden">
        {/* Decorative */}
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-96 h-96 bg-kasi-gold/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-kasi-green/15 rounded-full blur-3xl" />
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <p className="text-kasi-gold font-semibold text-sm uppercase tracking-wider mb-3">Trust & Transparency</p>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Built on Botho</h2>
          <p className="text-gray-400 max-w-2xl mx-auto mb-14 leading-relaxed">
            Kasi2Kasi doesn&apos;t touch your money. We provide the secure orchestration layer —
            the digital handshake between members. Your funds stay in your accounts,
            transferred directly via secure payment gateways.
          </p>
          <div className="grid grid-cols-3 gap-8">
            {[
              { value: "50", prefix: "R", suffix: "B+", label: "SA Stokvel Market" },
              { value: "11.5", suffix: "M", label: "Stokvel Members" },
              { value: "800", suffix: "K+", label: "Active Stokvels" },
            ].map((stat, i) => (
              <div key={i} className="group">
                <div className="text-3xl md:text-4xl font-bold text-kasi-gold mb-1 group-hover:scale-110 transition-transform duration-300">
                  <AnimatedCounter target={stat.value} prefix={stat.prefix} suffix={stat.suffix} />
                </div>
                <div className="text-sm text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 gradient-mesh relative">
        <div className="max-w-xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-kasi-green/10 text-kasi-green px-4 py-1.5 rounded-full text-sm font-medium mb-6">
            <TrendingUp className="w-4 h-4" /> Join the Movement
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-kasi-charcoal mb-4">
            Ready to digitize your Stokvel?
          </h2>
          <p className="text-gray-500 mb-8 leading-relaxed">
            Join the movement. Start managing your community savings the modern way.
          </p>
          <Link href="/register" className="btn-primary text-base inline-flex items-center gap-2 !py-4 !px-8 animate-pulse-glow">
            Get Started Free <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-4 bg-kasi-charcoal text-white border-t border-white/5">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Image src="/icons/logo.png" alt="K2K" width={28} height={28} className="rounded-lg" />
            <span className="font-semibold">Kasi2Kasi</span>
          </div>
          <div className="flex flex-col md:flex-row items-center gap-6 text-sm text-gray-500">
            <Link href="/contact" className="hover:text-white transition-colors">Contact Support</Link>
            <p>© 2025 Kasi2Kasi Digital Stokvels. Built for the community.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
