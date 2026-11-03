// Cache dell'interfaccia: l'app si apre anche offline, i dati meteo arrivano sempre dalla rete
const CACHE = "pioggia-v10";
const SHELL = ["./", "index.html", "manifest.webmanifest", "icon-192.png", "icon-512.png", "splash.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL))); self.skipWaiting(); });
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener("fetch", e => {
  const u = new URL(e.request.url);
  const shell = u.origin === location.origin || u.host === "cdnjs.cloudflare.com" || u.host.endsWith("fonts.googleapis.com") || u.host === "fonts.gstatic.com";
  if (e.request.method !== "GET" || !shell) return;           // API meteo, radar e mappe: sempre rete
  e.respondWith(fetch(e.request).then(r => {
    const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); return r;
  }).catch(() => caches.match(e.request)));
});
