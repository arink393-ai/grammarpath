/* English Cat Island — service worker (offline + installable PWA) */
const CACHE = "eci-v61-storybook-talk";
const SHELL = [
  "./",
  "./index.html",
  "./progress-sync.js?v=1",
  "./daily.js?v=17",
  "./curriculum-loader.js?v=1",
  "./offline-content.js?v=1",
  "./daily.css?v=17",
  "./vocab-quest.js?v=12",
  "./manifest.webmanifest",
  "./vocab/",
  "./vocab/account-storage.js?v=2",
  "./vocab/app.js?v=3",
  "./vocab/catalog.js?v=1",
  "./vocab/book-loader.js?v=1",
  "./vocab/books.js?v=6",
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
      .then((keys) => Promise.all(keys.filter((k) => /^eci-v\d+-/.test(k) && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

async function cachedAsset(req){
  const current=await caches.open(CACHE);
  return await current.match(req) || await (await caches.open('eci-offline-v1')).match(req);
}
self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  // Explicit offline downloads must fetch fresh content, not stale cached copies.
  if(req.cache === "reload" && req.mode !== "navigate")return;
  const url = new URL(req.url);

  // Page loads: network-first (always fresh when online), fall back to cached shell offline.
  if (req.mode === "navigate") {
    const scope = new URL(self.registration.scope).pathname;
    const isShell = url.pathname === scope || url.pathname === scope + "index.html";
    e.respondWith(
      fetch(req)
        .then((r) => {
          // 只有主站首頁存成 index.html；子頁（例如 vocab/）各自快取，避免蓋掉主站
          if(!r.ok)throw new Error("Page unavailable");
          const cp = r.clone();
          caches.open(CACHE).then((c) => isShell ? c.put("./index.html", cp) : c.put(req, cp));
          return r;
        })
        .catch(() => isShell
          ? cachedAsset("./index.html").then(r=>r||Response.error())
          : cachedAsset(req).then(async r=>r || (url.pathname===scope+"vocab/" || url.pathname===scope+"vocab/index.html" ? await cachedAsset("./vocab/") : null) || Response.error()))
    );
    return;
  }

  // Same-origin assets (audio, icons, etc.): stale-while-revalidate.
  if (url.origin === location.origin) {
    e.respondWith(
      cachedAsset(req).then((cached) => {
        const net = fetch(req).then((r) => {
          if (r && r.status === 200) { const cp = r.clone(); caches.open(CACHE).then((c) => c.put(req, cp)); }
          return r;
        }).catch(() => cached || Response.error());
        return cached || net;
      })
    );
    return;
  }

  // 即時資料（Supabase 資料庫/登入、字典、發音）一律走網路，不可快取，否則老師後台會看到舊資料
  if (/(^|\.)supabase\.co$|dictionaryapi\.dev$|dict\.youdao\.com$|googleapis\.com$|youglish\.com$|mymemory\.translated\.net$/.test(url.hostname) && !/fonts\.googleapis\.com$/.test(url.hostname)) return;

  // Cross-origin (Google Fonts, cdnjs, YouTube thumbs): cache-first, tolerate opaque.
  e.respondWith(
    cachedAsset(req).then((cached) => cached || fetch(req).then((r) => {
      try { const cp = r.clone(); caches.open(CACHE).then((c) => c.put(req, cp)); } catch (_) {}
      return r;
    }).catch(() => cached || Response.error()))
  );
});
