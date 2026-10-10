// sw.js — membuat Bangun tetap bisa dibuka tanpa internet.
// Naikkan angka VERSI setiap kali index.html diperbarui, supaya HP mengambil versi baru.
const VERSI = "bangun-v7";
const BERKAS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icon-192.png",
  "./icon-512.png",
  "./maskable-512.png",
  "./apple-touch-icon.png"
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(VERSI).then((c) => c.addAll(BERKAS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSI).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Ambil dari cache dulu supaya cepat dan jalan offline, lalu perbarui cache di belakang layar.
self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== self.location.origin) return;
  e.respondWith(
    caches.open(VERSI).then(async (cache) => {
      const lama = await cache.match(req, { ignoreSearch: true });
      const baru = fetch(req)
        .then((res) => { if (res && res.ok) cache.put(req, res.clone()); return res; })
        .catch(() => lama);
      return lama || baru;
    })
  );
});
