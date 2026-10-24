// Cambia el número de versión cada vez que actualices index.html
const CACHE = 'suchef-control-v8';
const ARCHIVOS = ['./', './index.html', './manifest.json', './nube-config.js', './icon-192.png', './icon-512.png', './apple-touch-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ARCHIVOS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  // La nube (Firebase) va directo a internet: nunca se guarda en caché
  const host = new URL(e.request.url).hostname;
  if (host.endsWith('.googleapis.com') && !host.startsWith('fonts.')) return;
  e.respondWith(
    fetch(e.request).then(r => {
      if (r && r.status === 200) { const copia = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copia)); }
      return r;
    }).catch(() => caches.match(e.request).then(r => r || caches.match('./index.html')))
  );
});
