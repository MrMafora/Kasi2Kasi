"use client";

import { Smartphone, Wifi, WifiOff, Download, Zap, Battery } from "lucide-react";
import FeatureLayout from "@/components/FeatureLayout";

export default function MobilePage() {
  return (
    <FeatureLayout
      icon={<Smartphone className="w-8 h-8" />}
      title="Works on Any Phone"
      subtitle="Lightweight, fast, and low-data friendly. Install it right from your browser — no app store needed."
      gradient="bg-gradient-to-br from-rose-900 via-pink-900 to-rose-800"
      prevFeature={{ href: "/features/democratic-governance", label: "Democratic Governance" }}
      nextFeature={{ href: "/features/digital-constitution", label: "Digital Constitution" }}
    >
      <div className="space-y-16">
        {/* Key benefits */}
        <div>
          <h2 className="text-2xl font-bold text-kasi-charcoal mb-8">Built for South African realities.</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                icon: <Download className="w-6 h-6" />,
                title: "Install from Browser",
                description: "No Play Store or App Store needed. Open the site, tap 'Add to Home Screen', and you've got a full app experience.",
              },
              {
                icon: <Wifi className="w-6 h-6" />,
                title: "Low Data Usage",
                description: "Designed to work on minimal data. Pages load fast even on slower connections — because data costs money.",
              },
              {
                icon: <Battery className="w-6 h-6" />,
                title: "Light on Resources",
                description: "Won't drain your battery or fill up your phone storage. It's a web app, not a 200MB download.",
              },
              {
                icon: <Zap className="w-6 h-6" />,
                title: "Instant Updates",
                description: "No waiting for app store updates. When we improve something, you get it immediately on your next visit.",
              },
            ].map((item, i) => (
              <div key={i} className="card-hover p-6">
                <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
                  {item.icon}
                </div>
                <h3 className="font-semibold text-lg text-kasi-charcoal mb-2">{item.title}</h3>
                <p className="text-gray-500 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Install guide */}
        <div className="bg-gray-50 rounded-3xl p-8 md:p-12">
          <h2 className="text-2xl font-bold text-kasi-charcoal mb-8">How to Install</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold text-lg text-kasi-charcoal mb-4 flex items-center gap-2">
                📱 Android (Chrome)
              </h3>
              <ol className="space-y-3">
                {[
                  "Open kasi2kasi.co.za in Chrome",
                  "Tap the menu (⋮) in the top right",
                  "Tap 'Add to Home Screen'",
                  "Tap 'Add' to confirm",
                  "Done! Find the app on your home screen",
                ].map((step, i) => (
                  <li key={i} className="flex items-start gap-3 text-gray-600">
                    <span className="flex-shrink-0 w-6 h-6 bg-kasi-green text-white rounded-full flex items-center justify-center text-xs font-bold">{i + 1}</span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
            <div>
              <h3 className="font-semibold text-lg text-kasi-charcoal mb-4 flex items-center gap-2">
                🍎 iPhone (Safari)
              </h3>
              <ol className="space-y-3">
                {[
                  "Open kasi2kasi.co.za in Safari",
                  "Tap the Share button (↑) at the bottom",
                  "Scroll down, tap 'Add to Home Screen'",
                  "Tap 'Add' in the top right",
                  "Done! The app appears on your home screen",
                ].map((step, i) => (
                  <li key={i} className="flex items-start gap-3 text-gray-600">
                    <span className="flex-shrink-0 w-6 h-6 bg-kasi-charcoal text-white rounded-full flex items-center justify-center text-xs font-bold">{i + 1}</span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>

        {/* Compatibility */}
        <div className="text-center py-8">
          <h2 className="text-2xl font-bold text-kasi-charcoal mb-4">Works everywhere</h2>
          <p className="text-gray-500 max-w-lg mx-auto">
            Android, iPhone, tablet, laptop — if it has a browser, it runs Kasi2Kasi. 
            No expensive phone required. No app store restrictions.
          </p>
        </div>
      </div>
    </FeatureLayout>
  );
}
