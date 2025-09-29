self.addEventListener("push", function (event) {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: "/favicon.png",
      badge: "/apple-touch-icon.png",
      vibrate: [100, 50, 100],
      data: {
        slug: data.slug,
      },
    };
    event.waitUntil(self.registration.showNotification(data.title, options));
  }
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const slug = event.notification.data?.slug ?? "upcoming";
  const urlToOpen = `/rides/${slug}`;

  event.waitUntil(
    self.clients.matchAll({ type: "window" }).then((clientList) => {
      for (const client of clientList) {
        if ("navigate" in client) {
          client.navigate(urlToOpen);
        }
        return client.focus();
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    }),
  );
});
