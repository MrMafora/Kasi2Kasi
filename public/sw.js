// Kasi2Kasi Service Worker for Push Notifications

self.addEventListener("push", (event) => {
  const defaultData = {
    title: "Kasi2Kasi",
    body: "You have a new notification",
    icon: "/icons/icon-192.png",
    badge: "/icons/icon-72.png",
    url: "/",
  };

  let data = defaultData;
  try {
    if (event.data) {
      data = { ...defaultData, ...event.data.json() };
    }
  } catch {
    if (event.data) {
      data = { ...defaultData, body: event.data.text() };
    }
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon,
      badge: data.badge,
      data: { url: data.url },
      vibrate: [200, 100, 200],
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/";
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      return clients.openWindow(url);
    })
  );
});

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));
