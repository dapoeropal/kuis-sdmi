const CACHE_NAME = 'kuis-cerdas-v1';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// Saat aplikasi pertama kali diinstall, simpan file-file penting ke memori HP
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache berhasil dibuka');
        return cache.addAll(urlsToCache);
      })
  );
});

// Saat aplikasi berjalan, cek apakah ada file di memori (cache) atau butuh dari internet
self.addEventListener('fetch', event => {
  // PENTING: Jangan cache request ke API Gemini (biarkan selalu ngambil soal baru dari internet)
  if (event.request.url.includes('generativelanguage.googleapis.com')) {
      return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Kembalikan dari cache jika ada, jika tidak, ambil dari internet
        return response || fetch(event.request);
      })
  );
});

// Bersihkan cache lama jika ada update versi baru
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});