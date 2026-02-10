"use client";

import { useEffect, useState } from "react";
import { Bell, CreditCard, Award, Vote, AlertTriangle, Settings, CheckCheck } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getNotifications, markAllNotificationsRead, markNotificationRead } from "@/lib/database";
import type { Notification } from "@/lib/types";
import LoadingSpinner from "@/components/LoadingSpinner";

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
  const { user, loading: authLoading } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!user) return;
      try {
        const data = await getNotifications(user.id);
        setNotifications(data);
      } catch (err) {
        console.error("Failed to load notifications:", err);
      } finally {
        setLoading(false);
      }
    }
    if (!authLoading) loadData();
  }, [user, authLoading]);

  const unread = notifications.filter((n) => !n.read);
  const read = notifications.filter((n) => n.read);

  const handleMarkAllRead = async () => {
    if (!user) return;
    await markAllNotificationsRead(user.id);
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  const handleMarkRead = async (id: string) => {
    await markNotificationRead(id);
    setNotifications(notifications.map((n) => n.id === id ? { ...n, read: true } : n));
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString("en-ZA");
  };

  if (authLoading || loading) {
    return (
      <div className="max-w-lg mx-auto pt-20">
        <LoadingSpinner message="Loading notifications..." />
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 pt-12">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-kasi-charcoal">Notifications</h1>
        <div className="flex items-center gap-2">
          {unread.length > 0 && (
            <>
              <button
                onClick={handleMarkAllRead}
                className="text-xs text-kasi-green font-medium flex items-center gap-1 hover:underline"
              >
                <CheckCheck className="w-3.5 h-3.5" /> Mark all read
              </button>
              <span className="bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                {unread.length} new
              </span>
            </>
          )}
        </div>
      </div>

      {unread.length > 0 && (
        <div className="mb-6">
          <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">New</h3>
          <div className="space-y-2">
            {unread.map((notification) => (
              <div
                key={notification.id}
                className="card border-l-4 border-l-kasi-green cursor-pointer"
                onClick={() => handleMarkRead(notification.id)}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${colorMap[notification.type] || colorMap.system}`}>
                    {iconMap[notification.type] || iconMap.system}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-kasi-charcoal">{notification.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{notification.message}</p>
                    <p className="text-[10px] text-gray-400 mt-1.5">{formatDate(notification.created_at)}</p>
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
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${colorMap[notification.type] || colorMap.system}`}>
                    {iconMap[notification.type] || iconMap.system}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-kasi-charcoal">{notification.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{notification.message}</p>
                    <p className="text-[10px] text-gray-400 mt-1.5">{formatDate(notification.created_at)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {notifications.length === 0 && (
        <div className="text-center py-20">
          <Bell className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-400 font-medium">No notifications yet</p>
          <p className="text-gray-300 text-sm mt-1">You&apos;ll be notified about payments, payouts, and votes</p>
        </div>
      )}
    </div>
  );
}
