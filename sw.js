/* English Cat Island — service worker (offline + installable PWA) */
const CACHE = "eci-v17-modals-unit";
const SHELL = [
  "./",
  "./index.html",
  "./daily.js",
  "./daily.css",
  "./manifest.webmanifest",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/maskable-512.png",
  "./icons/apple-touch-180.png"
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  // Page loads: network-first (always fresh when online), fall back to cached shell offline.
  if (req.mode === "navigate") {
    e.respondWith(
      fetch(req)
        .then((r) => { const cp = r.clone(); caches.open(CACHE).then((c) => c.put("./index.html", cp)); return r; })
        .catch(() => caches.match("./index.html").then((r) => r || caches.match("./")))
    );
    return;
  }

  // Same-origin assets (audio, icons, etc.): stale-while-revalidate.
  if (url.origin === location.origin) {
    e.respondWith(
      caches.match(req).then((cached) => {
        const net = fetch(req).then((r) => {
          if (r && r.status === 200) { const cp = r.clone(); caches.open(CACHE).then((c) => c.put(req, cp)); }
          return r;
        }).catch(() => cached);
        return cached || net;
      })
    );
    return;
  }

  // Cross-origin (Google Fonts, cdnjs, YouTube thumbs): cache-first, tolerate opaque.
  e.respondWith(
    caches.match(req).then((cached) => cached || fetch(req).then((r) => {
      try { const cp = r.clone(); caches.open(CACHE).then((c) => c.put(req, cp)); } catch (_) {}
      return r;
    }).catch(() => cached))
  );
});
