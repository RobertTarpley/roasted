const CACHE_NAME = "roasted-shell-v2";
const OFFLINE_URL = "/offline";
const INVENTORY_URL = "/inventory";
const ASSET_PATHS = ["/_next/static/", "/icons/"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      await cache.add(OFFLINE_URL);

      try {
        const response = await fetch(INVENTORY_URL, {
          credentials: "include",
        });

        if (response.ok) {
          await cache.put(INVENTORY_URL, response.clone());
        }
      } catch {
        // Offline or blocked inventory fetch will fall back at runtime.
      }
    })(),
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
  const url = new URL(request.url);

  if (request.method !== "GET") {
    return;
  }

  const isAssetRequest =
    url.origin === self.location.origin &&
    ASSET_PATHS.some((path) => url.pathname.startsWith(path));

  if (isAssetRequest) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(CACHE_NAME);
        const cached = await cache.match(request);

        if (cached) {
          return cached;
        }

        const response = await fetch(request);
        if (response.ok) {
          await cache.put(request, response.clone());
        }
        return response;
      })(),
    );
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          const response = await fetch(request);
          if (response.ok && url.pathname === INVENTORY_URL) {
            const cache = await caches.open(CACHE_NAME);
            await cache.put(INVENTORY_URL, response.clone());
          }
          return response;
        } catch (error) {
          const cache = await caches.open(CACHE_NAME);
          const cachedShell = await cache.match(INVENTORY_URL);

          if (cachedShell) {
            return cachedShell;
          }

          const fallback = await cache.match(OFFLINE_URL);
          if (fallback) {
            return fallback;
          }

          throw error;
        }
      })(),
    );
  }
});
