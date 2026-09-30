/* English Cat Island — service worker (offline + installable PWA) */
const CACHE = "eci-v44-vocab-moe9";
const SHELL = [
  "./",
  "./index.html",
  "./daily.js",
  "./daily.css",
  "./vocab-quest.js",
  "./manifest.webmanifest",
  "./vocab/",
  "./vocab/app.js",
  "./vocab/books.js",
  "./vocab/style.css",
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
    const scope = new URL(self.registration.scope).pathname;
    const isShell = url.pathname === scope || url.pathname === scope + "index.html";
    e.respondWith(
      fetch(req)
        .then((r) => {
          // 只有主站首頁存成 index.html；子頁（例如 vocab/）各自快取，避免蓋掉主站
          const cp = r.clone();
          caches.open(CACHE).then((c) => isShell ? c.put("./index.html", cp) : c.put(req, cp));
          return r;
        })
        .catch(() => isShell
          ? caches.match("./index.html").then((r) => r || caches.match("./"))
          : caches.match(req).then((r) => r || caches.match("./index.html")))
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

  // 即時資料（Supabase 資料庫/登入、字典、發音）一律走網路，不可快取，否則老師後台會看到舊資料
  if (/(^|\.)supabase\.co$|dictionaryapi\.dev$|dict\.youdao\.com$|googleapis\.com$|youglish\.com$|mymemory\.translated\.net$/.test(url.hostname) && !/fonts\.googleapis\.com$/.test(url.hostname)) return;

  // Cross-origin (Google Fonts, cdnjs, YouTube thumbs): cache-first, tolerate opaque.
  e.respondWith(
    caches.match(req).then((cached) => cached || fetch(req).then((r) => {
      try { const cp = r.clone(); caches.open(CACHE).then((c) => c.put(req, cp)); } catch (_) {}
      return r;
    }).catch(() => cached))
  );
});
