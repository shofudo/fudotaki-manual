/* Simple offline-first Service Worker */
const CACHE_VERSION = 'v1.0.0';
const CACHE_NAME = `fudotaki-manual-${CACHE_VERSION}`;

// 初回に確実に入れておきたい最低限（あとから閲覧したものは自動で増える）
const CORE_ASSETS = [
  './',
  './index.html',
  './pages/season-dinner.html',
  './manifest.webmanifest',
  './assets/img/season-dinner/top2.jpg',
];

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS)));
});

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(
      keys
        .filter((k) => k.startsWith('fudotaki-manual-') && k !== CACHE_NAME)
        .map((k) => caches.delete(k))
    );
    await self.clients.claim();
  })());
});

// HTMLは「オンライン優先→無理ならキャッシュ」／その他(音声・画像等)は「キャッシュ優先」
self.addEventListener('fetch', (e) => {
  const req = e.request;
  const isHTML =
    req.mode === 'navigate' || (req.headers.get('accept') || '').includes('text/html');

  if (isHTML) {
    e.respondWith((async () => {
      try {
        const fresh = await fetch(req);
        const cache = await caches.open(CACHE_NAME);
        cache.put(req, fresh.clone());
        return fresh;
      } catch {
        const cache = await caches.open(CACHE_NAME);
        return (await cache.match(req)) || (await cache.match('./index.html'));
      }
    })());
    return;
  }

  e.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(req);
    if (cached) return cached;
    try {
      const fresh = await fetch(req);
      cache.put(req, fresh.clone());
      return fresh;
    } catch {
      return caches.match('./index.html');
    }
  })());
});
