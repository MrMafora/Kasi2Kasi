"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, User, Calculator, Bell, Plus, X, Target, UserPlus } from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/groups", label: "Groups", icon: Users },
  { href: "__fab__", label: "", icon: Plus }, // placeholder for FAB
  { href: "/notifications", label: "Alerts", icon: Bell },
  { href: "/profile", label: "Profile", icon: User },
];

export default function BottomNav() {
  const pathname = usePathname();
  const [fabOpen, setFabOpen] = useState(false);

  return (
    <>
      {/* FAB overlay menu */}
      {fabOpen && (
        <div className="fixed inset-0 z-50" onClick={() => setFabOpen(false)}>
          <div className="absolute inset-0 bg-black/30" />
          <div className="absolute bottom-24 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 animate-slide-up">
            <Link
              href="/groups/create?type=goal"
              onClick={() => setFabOpen(false)}
              className="flex items-center gap-2 bg-white shadow-lg rounded-full px-5 py-3 text-sm font-medium text-kasi-charcoal hover:bg-gray-50 transition-colors"
            >
              <Target className="w-4 h-4 text-kasi-gold" />
              Goal Fund
            </Link>
            <Link
              href="/groups/create"
              onClick={() => setFabOpen(false)}
              className="flex items-center gap-2 bg-white shadow-lg rounded-full px-5 py-3 text-sm font-medium text-kasi-charcoal hover:bg-gray-50 transition-colors"
            >
              <UserPlus className="w-4 h-4 text-kasi-green" />
              Stokvel
            </Link>
          </div>
        </div>
      )}

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-50 pb-safe">
        <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
          {navItems.map((item) => {
            if (item.href === "__fab__") {
              return (
                <button
                  key="fab"
                  onClick={() => setFabOpen(!fabOpen)}
                  className="relative -mt-6 w-12 h-12 bg-kasi-green rounded-full flex items-center justify-center shadow-lg shadow-kasi-green/30 transition-transform active:scale-95"
                >
                  {fabOpen ? (
                    <X className="w-5 h-5 text-white" />
                  ) : (
                    <Plus className="w-5 h-5 text-white" />
                  )}
                </button>
              );
            }

            const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors ${
                  isActive
                    ? "text-kasi-green"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
