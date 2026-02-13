const CACHE_NAME = "roasted-shell-v1";
const PRECACHE_URLS = ["/inventory", "/offline"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS)),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key)),
      ),
    ),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") {
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(
      (async () => {
        const cache = await caches.open(CACHE_NAME);
        const cachedShell = await cache.match("/inventory");

        if (cachedShell) {
          return cachedShell;
        }

        try {
          return await fetch(request);
        } catch (error) {
          const fallback = await cache.match("/offline");
          if (fallback) {
            return fallback;
          }
          throw error;
        }
      })(),
    );
  }
});
