"use client";

import { Bell, CreditCard, Award, Vote, AlertTriangle, Settings } from "lucide-react";
import { mockNotifications } from "@/lib/mock-data";

const iconMap: Record<string, React.ReactNode> = {
  payment: <CreditCard className="w-4 h-4" />,
  payout: <Award className="w-4 h-4" />,
  vote: <Vote className="w-4 h-4" />,
  reminder: <AlertTriangle className="w-4 h-4" />,
  system: <Settings className="w-4 h-4" />,
};

const colorMap: Record<string, string> = {
  payment: "bg-emerald-100 text-emerald-600",
  payout: "bg-kasi-gold/20 text-kasi-gold-dark",
  vote: "bg-purple-100 text-purple-600",
  reminder: "bg-amber-100 text-amber-600",
  system: "bg-gray-100 text-gray-600",
};

export default function NotificationsPage() {
  const unread = mockNotifications.filter((n) => !n.read);
  const read = mockNotifications.filter((n) => n.read);

  return (
    <div className="max-w-lg mx-auto px-4 pt-12">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-kasi-charcoal">Notifications</h1>
        {unread.length > 0 && (
          <span className="bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
            {unread.length} new
          </span>
        )}
      </div>

      {unread.length > 0 && (
        <div className="mb-6">
          <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">New</h3>
          <div className="space-y-2">
            {unread.map((notification) => (
              <div key={notification.id} className="card border-l-4 border-l-kasi-green">
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${colorMap[notification.type]}`}>
                    {iconMap[notification.type]}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-kasi-charcoal">{notification.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{notification.message}</p>
                    <p className="text-[10px] text-gray-400 mt-1.5">{notification.date}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {read.length > 0 && (
        <div>
          <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">Earlier</h3>
          <div className="space-y-2">
            {read.map((notification) => (
              <div key={notification.id} className="card opacity-70">
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${colorMap[notification.type]}`}>
                    {iconMap[notification.type]}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-kasi-charcoal">{notification.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{notification.message}</p>
                    <p className="text-[10px] text-gray-400 mt-1.5">{notification.date}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {mockNotifications.length === 0 && (
        <div className="text-center py-20">
          <Bell className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-400">No notifications yet</p>
        </div>
      )}
    </div>
  );
}
