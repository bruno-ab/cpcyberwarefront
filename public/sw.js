const CACHE = 'cp-storyteller-v3';
const PRECACHE = [
  '/',
  '/book',
  '/sheet',
  '/adventure',
  '/wiki',
  '/achievements',
  '/id-card',
  '/manifest.json',
  '/icons/icon.svg',
];

/** API paths safe to cache for offline book/sheet shell. */
const API_CACHE_MATCH = [
  /\/api\/rules(\/|$|\?)/,
  /\/api\/achievements(\/|$|\?)/,
  /\/api\/adventures(\/|$|\?)/,
  /\/api\/campaigns\/\d+\/wiki/,
  /\/api\/campaigns\/\d+\/recaps/,
  /\/api\/campaigns\/\d+\/achievements/,
  /\/api\/characters\/[^/]+$/,
];

const isCacheableApi = (url) =>
  API_CACHE_MATCH.some((re) => re.test(url.pathname));

/** Next.js app router + CSS chunks must not be cache-first (breaks soft nav). */
const bypassServiceWorker = (url, request) => {
  if (url.pathname.startsWith('/_next/')) return true;
  if (request.mode === 'navigate') return true;
  if (request.headers.get('RSC') === '1') return true;
  if (request.headers.get('Next-Router-Prefetch') === '1') return true;
  if (request.headers.has('Next-Router-State-Tree')) return true;
  const dest = request.headers.get('Accept') || '';
  if (dest.includes('text/x-component')) return true;
  return false;
};

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((c) => c.addAll(PRECACHE))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET') return;

  // Realtime — never cache
  if (url.pathname.includes('socket.io')) return;

  if (bypassServiceWorker(url, event.request)) {
    event.respondWith(fetch(event.request));
    return;
  }

  // Offline-friendly API subset
  if (url.pathname.startsWith('/api')) {
    if (!isCacheableApi(url)) return;
    event.respondWith(
      fetch(event.request)
        .then((res) => {
          if (res.ok) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(event.request, copy));
          }
          return res;
        })
        .catch(() => caches.match(event.request)),
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      const fetched = fetch(event.request)
        .then((res) => {
          if (res.ok) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(event.request, copy));
          }
          return res;
        })
        .catch(() => cached);
      return cached || fetched;
    }),
  );
});
