const CACHE_NAME = "nutritrack-shell-v1";
const APP_SHELL = ["/", "/index.html", "/manifest.webmanifest", "/pwa-icon.svg"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    fetch("/precache-assets.json")
      .then((response) => {
        if (!response.ok) throw new Error("Could not load the offline asset list.");
        return response.json();
      })
      .then((assets) => caches.open(CACHE_NAME).then((cache) => cache.addAll([...APP_SHELL, ...assets])))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith("nutritrack-shell-") && key !== CACHE_NAME)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);

  if (request.method !== "GET" || url.origin !== self.location.origin || url.pathname.startsWith("/api/")) {
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone();
            return caches.open(CACHE_NAME).then((cache) => cache.put("/index.html", copy)).then(() => response);
          }
          return response;
        })
        .catch(async () => {
          const cachedPage = await caches.match("/index.html");
          if (cachedPage) return cachedPage;
          const cachedRoot = await caches.match("/");
          if (cachedRoot) return cachedRoot;
          return Response.error();
        }),
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;

      return fetch(request).then((response) => {
        if (response.ok) {
          const copy = response.clone();
          return caches.open(CACHE_NAME).then((cache) => cache.put(request, copy)).then(() => response);
        }
        return response;
      });
    }),
  );
});
