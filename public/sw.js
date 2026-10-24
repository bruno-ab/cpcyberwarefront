const CACHE = 'cp-storyteller-v2';
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
