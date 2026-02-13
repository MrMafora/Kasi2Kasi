"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { ReactNode } from "react";

interface FeatureLayoutProps {
  icon: ReactNode;
  title: string;
  subtitle: string;
  gradient: string;
  children: ReactNode;
  prevFeature?: { href: string; label: string };
  nextFeature?: { href: string; label: string };
}

export default function FeatureLayout({
  icon,
  title,
  subtitle,
  gradient,
  children,
  prevFeature,
  nextFeature,
}: FeatureLayoutProps) {
  return (
    <div className="min-h-screen bg-white">
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

      {/* Hero */}
      <section className={`relative pt-28 pb-20 px-4 overflow-hidden ${gradient}`}>
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-float" />
          <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-white/5 rounded-full blur-3xl animate-float" style={{ animationDelay: "1.5s" }} />
        </div>

        <div className="max-w-4xl mx-auto relative z-10">
          <Link href="/" className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors text-sm mb-8">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center text-white">
              {icon}
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight mb-4">
            {title}
          </h1>
          <p className="text-lg md:text-xl text-white/60 max-w-2xl leading-relaxed">
            {subtitle}
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          {children}
        </div>
      </section>

      {/* Navigation between features */}
      <section className="py-12 px-4 border-t border-gray-100">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          {prevFeature ? (
            <Link href={prevFeature.href} className="flex items-center gap-2 text-gray-500 hover:text-kasi-green transition-colors">
              <ArrowLeft className="w-4 h-4" /> {prevFeature.label}
            </Link>
          ) : <div />}
          {nextFeature ? (
            <Link href={nextFeature.href} className="flex items-center gap-2 text-gray-500 hover:text-kasi-green transition-colors">
              {nextFeature.label} <ArrowRight className="w-4 h-4" />
            </Link>
          ) : <div />}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 gradient-mesh">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-kasi-charcoal mb-4">
            Ready to get started?
          </h2>
          <p className="text-gray-500 mb-8">
            Join Kasi2Kasi and start managing your Stokvel the modern way.
          </p>
          <Link href="/register" className="btn-primary text-base inline-flex items-center gap-2 !py-4 !px-8">
            Start Your Stokvel <ArrowRight className="w-5 h-5" />
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
            <p>© 2026 Kasi2Kasi Digital Stokvels. Built for the community.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
