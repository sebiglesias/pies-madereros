const CACHE_NAME = 'pies-madereros-v1';
const ASSETS = [
  '/pies-madereros/',
  '/pies-madereros/index.html',
  '/pies-madereros/styles.css',
  '/pies-madereros/app.js',
  '/pies-madereros/manifest.json',
  '/pies-madereros/icon.svg'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((k) => k !== CACHE_NAME && caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then((cached) => cached || fetch(e.request).catch(() => caches.match('/pies-madereros/index.html')))
  );
});
