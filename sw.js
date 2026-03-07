// Ganti angka versi ini (misal v3, v4) setiap kali kamu melakukan perubahan besar
// pada file HTML, CSS, atau gambar, agar cache lama di HP langsung dibuang.
const CACHE_NAME = 'kuis-cerdas-v2';

const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', event => {
  // Langsung aktifkan service worker baru tanpa menunggu
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache PWA berhasil disimpan Bolo!');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('activate', event => {
  // Ambil alih kontrol dari semua halaman yang sedang terbuka
  event.waitUntil(self.clients.claim());
  
  // Bersihkan semua cache lama yang versinya tidak sama dengan CACHE_NAME
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Menghapus cache PWA versi lama Bolo...');
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Strategi: "Stale-While-Revalidate" (Tampilkan yang ada di memori dulu agar cepat, 
// sambil diam-diam download versi terbaru di belakang layar untuk dibuka berikutnya)
self.addEventListener('fetch', event => {
  // JANGAN cache panggilan API ke Google Gemini (agar soal selalu baru)
  if (event.request.url.includes('generativelanguage.googleapis.com')) {
      return;
  }
  
  event.respondWith(
    caches.open(CACHE_NAME).then(cache => {
      return cache.match(event.request).then(response => {
        const fetchPromise = fetch(event.request).then(networkResponse => {
          // Hanya cache respon yang valid (status 200) dari asal yang sama
          if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
             cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        }).catch(() => {
          // Jika offline dan jaringan gagal, abaikan saja
        });
        
        // Tampilkan dari cache jika ada, jika tidak, tunggu dari internet
        return response || fetchPromise;
      })
    })
  );
});
