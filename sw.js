/* PWA Service Worker (offline-first with smart strategies)
   - HTML: network-first (fallback to cache)
   - Assets (images/css/js/audio): stale-while-revalidate
   - Immediate update: skipWaiting + clients.claim
*/
const CACHE_VERSION = 'v1.1.5';
const CACHE_NAME    = `fudotaki-manual-${CACHE_VERSION}`;

/* GitHub Pages での配信パス（絶対パス） */
const CORE = [
  '/fudotaki-manual/',
  '/fudotaki-manual/index.html',
  '/fudotaki-manual/assets/css/theme.css',
  '/fudotaki-manual/assets/img/top/washi-bg.jpg',
  '/fudotaki-manual/assets/img/top/top2.jpg',
  '/fudotaki-manual/manifest.webmanifest',
];

/* ローカル/相対パスでも動くよう最低限の相対パスもプリキャッシュ */
const CORE_LOCAL = [
  './',
  './index.html',
  './assets/css/theme.css',
  './assets/img/top/washi-bg.jpg',
  './assets/img/top/top2.jpg',
  './pages/season-dinner.html',
  './manifest.webmanifest',
];

/* ========== Install: 重要ファイルを確実にキャッシュ & 即時更新準備 ========== */
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll([...CORE, ...CORE_LOCAL]))
      .then(() => self.skipWaiting()) // 新SWを即座に待機解除
  );
});

/* ========== Activate: 旧キャッシュ破棄 & 既存タブへ即反映 ========== */
self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(
      keys
        .filter((k) => k.startsWith('fudotaki-manual-') && k !== CACHE_NAME)
        .map((k) => caches.delete(k))
    );
    await self.clients.claim(); // 既存クライアントに即反映
  })());
});

/* ========== 戦略ヘルパー ========== */
async function networkFirst(request) {
  try {
    const fresh = await fetch(request, { cache: 'no-store' }); // 常に最新
    const cache = await caches.open(CACHE_NAME);
    cache.put(request, fresh.clone());
    return fresh;
  } catch {
    const cache = await caches.open(CACHE_NAME);
    // HTMLは index.html もフォールバックに
    return (await cache.match(request)) || (await cache.match('/fudotaki-manual/index.html')) || (await cache.match('./index.html')) || Response.error();
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  const fetchPromise = fetch(request).then((res) => {
    if (res && res.ok) cache.put(request, res.clone());
    return res;
  }).catch(() => null);
  return cached || await fetchPromise || Response.error();
}

/* ========== Fetch: タイプ別に最適戦略 ========== */
self.addEventListener('fetch', (e) => {
  const req    = e.request;
  const accept = req.headers.get('accept') || '';
  const url    = new URL(req.url);

  // 1) HTML: ネット優先（オフライン時のみキャッシュ）
  if (req.mode === 'navigate' || accept.includes('text/html')) {
    e.respondWith(networkFirst(req));
    return;
  }

  // 2) 静的アセット（画像/CSS/JS/音声/動画 一般）
  if (/\.(png|jpg|jpeg|gif|svg|webp|css|js|mp3|m4a|wav|ogg|mp4|webm)$/i.test(url.pathname)) {
    e.respondWith(staleWhileRevalidate(req));
    return;
  }

  // 3) その他は簡易キャッシュフォールバック
  e.respondWith(
    caches.match(req).then((r) => r || fetch(req).then((n) => {
      if (n && n.ok) caches.open(CACHE_NAME).then((c) => c.put(req, n.clone()));
      return n;
    }).catch(() => caches.match('/fudotaki-manual/index.html') || caches.match('./index.html')))
  );
});
