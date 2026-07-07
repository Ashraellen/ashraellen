const CACHE='error404-reader-v1';
const ASSETS=["./", "./index.html", "./manifest.webmanifest", "./icon.svg", "./marked.min.js", "./E404GNFB1WM-RU_CH-001_v1.md", "./E404GNFB1WM-RU_CH-002_v4.md", "./E404GNFB1WM-RU_CH-003_v2.md", "./E404GNFB1WM-RU_CH-004_v2.md", "./E404GNFB1WM-RU_CH-005_v2.md", "./E404GNFB1WM-RU_CH-006_v1.md", "./E404GNFB1WM-RU_CH-007_v1.md", "./E404GNFB1WM-RU_CH-008_v1.md", "./E404GNFB1WM-RU_CH-009_v1.md", "./E404GNFB1WM-RU_CH-010_v1.md", "./E404GNFB1WM-RU_CH-011_v1.md", "./E404GNFB1WM-RU_CH-012_v1.md", "./E404GNFB1WM-RU_CH-013_v2.md", "./E404GNFB1WM-RU_CH-014_v2.md", "./E404GNFB1WM-RU_CH-015_v2.md", "./E404GNFB1WM-RU_CH-016_v2.md", "./E404GNFB1WM-RU_CH-017_v2.md", "./E404GNFB1WM-RU_CH-018_v2.md", "./E404GNFB1WM-RU_CH-019_v4.md", "./E404GNFB1WM-RU_CH-020_v2.md", "./E404GNFB1WM-RU_CH-021_v4.md", "./E404GNFB1WM-RU_CH-022_v2.md"];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
      const copy = response.clone();
      caches.open(CACHE).then(cache => cache.put(event.request, copy));
      return response;
    }).catch(() => caches.match('./index.html')))
  );
});
