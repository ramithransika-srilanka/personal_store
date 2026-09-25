// Keeps the photos, fonts and built JS/CSS on the device after the first visit, so coming back
// shows every photo instantly, even offline or on a weak connection. GitHub Pages only lets
// browsers cache for 10 minutes, after which every file would be re-checked over the network.
//
// - assets/  Vite's output. Every name carries a content hash, so a cached copy is always right.
// - media/   Fixed names (the hero poster): served from the cache, refreshed in the background.
// The page itself and the video are left to the network (the video uses byte-range requests).

const CACHE = 'personal-store-v1';
const MAX_ENTRIES = 150;
const scope = new URL(self.registration.scope).pathname;

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      for (const key of await caches.keys()) if (key !== CACHE) await caches.delete(key);
      await self.clients.claim();
    })(),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  if (request.method !== 'GET' || request.headers.has('range') || url.origin !== location.origin) return;
  if (!url.pathname.startsWith(scope)) return;
  const path = url.pathname.slice(scope.length);

  if (path.startsWith('assets/')) event.respondWith(cacheFirst(request));
  else if (path.startsWith('media/') && !path.endsWith('.mp4')) event.respondWith(staleWhileRevalidate(event));
});

async function cacheFirst(request) {
  const cache = await caches.open(CACHE);
  return (await cache.match(request)) ?? fetchAndStore(cache, request);
}

async function staleWhileRevalidate(event) {
  const cache = await caches.open(CACHE);
  const cached = await cache.match(event.request);
  const fresh = fetchAndStore(cache, event.request);
  if (!cached) return fresh;
  event.waitUntil(fresh.catch(() => {}));
  return cached;
}

async function fetchAndStore(cache, request) {
  const response = await fetch(request);
  if (response.ok && response.type === 'basic') {
    await cache.put(request, response.clone());
    trim(cache);
  }
  return response;
}

// Old builds' hashed files pile up over deploys; drop the oldest once there are too many.
async function trim(cache) {
  const keys = await cache.keys();
  for (const key of keys.slice(0, Math.max(0, keys.length - MAX_ENTRIES))) await cache.delete(key);
}
