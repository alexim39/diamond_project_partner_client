// Minimal push service worker — no framework, no build step.
// Shows the notification and deep-links into the Center on tap.
self.addEventListener('push', (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (err) {
    try { data = { body: event.data.text() }; } catch (ignored) { /* keep defaults */ }
  }
  event.waitUntil(
    self.registration.showNotification(data.title || 'Diamond Project', {
      body: data.body || '',
      tag: data.tag || 'diamond-project',
      data: { url: data.url || '/dashboard/notifications/center' },
    }),
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || '/dashboard/notifications/center';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      for (const client of list) {
        if ('navigate' in client) return client.navigate(url).then(() => client.focus());
      }
      return clients.openWindow(url);
    }),
  );
});
