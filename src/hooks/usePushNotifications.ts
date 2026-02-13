"use client";

import { useState, useEffect, useCallback } from "react";

export function usePushNotifications() {
  const [supported, setSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    const isSupported = typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
    setSupported(isSupported);
    if (isSupported) {
      setPermission(Notification.permission);
      // Register service worker
      navigator.serviceWorker.register("/sw.js").then((reg) => {
        setRegistration(reg);
      }).catch((err) => {
        console.error("SW registration failed:", err);
      });
    }
  }, []);

  const subscribe = useCallback(async () => {
    if (!supported) return;
    try {
      const perm = await Notification.requestPermission();
      setPermission(perm);
      if (perm === "granted" && registration) {
        // Get subscription (no applicationServerKey yet - will be added when push server is set up)
        const sub = await registration.pushManager.getSubscription();
        if (!sub) {
          // For now just request permission; actual subscription needs VAPID keys from server
          console.log("Push permission granted. Subscription will be created when VAPID keys are configured.");
        }
      }
    } catch (err) {
      console.error("Push subscribe failed:", err);
    }
  }, [supported, registration]);

  const unsubscribe = useCallback(async () => {
    if (!registration) return;
    try {
      const sub = await registration.pushManager.getSubscription();
      if (sub) {
        await sub.unsubscribe();
      }
      // We can't revoke notification permission via JS, but we can indicate state
      setPermission("default");
    } catch (err) {
      console.error("Push unsubscribe failed:", err);
    }
  }, [registration]);

  return { supported, permission, subscribe, unsubscribe, registration };
}
