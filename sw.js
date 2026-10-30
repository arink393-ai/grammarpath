/* English Cat Island — service worker (offline + installable PWA) */
const CACHE = "eci-v116-teacher-delete";
const SHELL = [
  "./",
  "./index.html",
  "./art/cat-dex/meme-cats-atlas.png",
  "./art/cat-dex/meme-cats-atlas-2.png",
  "./art/cat-dex/meme-cats-atlas-3.png",
  "./art/island/cats-1.png",
  "./art/island/cats-2.png",
  "./art/island/cats-3.png",
  "./art/island/cats-4.png",
  "./art/breeds/abyssinian.webp",
  "./art/breeds/american-curl.webp",
  "./art/breeds/american-shorthair.webp",
  "./art/breeds/bengal.webp",
  "./art/breeds/birman.webp",
  "./art/breeds/bombay.webp",
  "./art/breeds/british-longhair.webp",
  "./art/breeds/british-shorthair.webp",
  "./art/breeds/burmese.webp",
  "./art/breeds/cornish-rex.webp",
  "./art/breeds/devon-rex.webp",
  "./art/breeds/egyptian-mau.webp",
  "./art/breeds/exotic-shorthair.webp",
  "./art/breeds/himalayan.webp",
  "./art/breeds/japanese-bobtail.webp",
  "./art/breeds/laperm.webp",
  "./art/breeds/maine-coon.webp",
  "./art/breeds/munchkin.webp",
  "./art/breeds/norwegian-forest-cat.webp",
  "./art/breeds/ocicat.webp",
  "./art/breeds/oriental-shorthair.webp",
  "./art/breeds/persian.webp",
  "./art/breeds/pixie-bob.webp",
  "./art/breeds/ragdoll.webp",
  "./art/breeds/russian-blue.webp",
  "./art/breeds/scottish-fold.webp",
  "./art/breeds/siamese.webp",
  "./art/breeds/siberian.webp",
  "./art/breeds/singapura.webp",
  "./art/breeds/somali.webp",
  "./art/breeds/sphynx.webp",
  "./art/breeds/tonkinese.webp",
  "./art/breeds/turkish-angora.webp",
  "./art/breeds/turkish-van.webp",
  "./daily.css?v=17",
  "./adventure.css?v=5",
  "./lesson-notes.css?v=3",
  "./homework.css?v=8",
  "./progress-sync.js?v=1",
  "./word-checkin.js?v=1",
  "./curriculum-loader.js?v=3",
  "./lesson-notes.js?v=4",
  "./homework.js?v=10",
  "./student-info.js?v=7",
  "./offline-content.js?v=9",
  "./daily.js?v=18",
  "./adventure.js?v=5",
  "./vocab/books.js?v=6",
  "./vocab-quest.js?v=17",
  "./manifest.webmanifest",
  "./vocab/",
  "./vocab/style.css?v=2",
  "./vocab/books.js",
  "./vocab/catalog.js?v=1",
  "./vocab/book-loader.js?v=3",
  "./vocab/account-storage.js?v=2",
  "./vocab/app.js?v=10",
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
