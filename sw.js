// Echelon: lets it install as an app and open offline.
// Always tries the internet first so a new version shows up straight away;
// the saved copy is used only when there is no connection.
// It never touches AI, Google or other outside requests.
const CACHE = 'echelon-v5';
const CORE = ['./', './index.html', './manifest.webmanifest', './icons/icon-180.png', './icons/icon-192.png', './icons/icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== CACHE).map(x => caches.delete(x)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET') return;
  const u = new URL(r.url);
  if (u.origin !== location.origin) return;            // AI services, Google, fonts: straight to the internet
  if (u.pathname.endsWith('/version.json') || u.pathname.includes('/watch/')) return;  // always live
  e.respondWith(fetch(r, {cache: 'no-store'}).then(res => {
    if (res.ok) { const cp = res.clone(); caches.open(CACHE).then(c => c.put(r, cp)); }
    return res;
  }).catch(() => caches.match(r, {ignoreSearch: true}).then(m => m || caches.match('./index.html'))));
});
