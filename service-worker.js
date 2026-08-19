// 大阪2027 旅行小工具 - Service Worker
// 目的：離線時仍可開啟 App、看行程、看所有地圖／照片原圖。
// 每次更新內容（新增地圖、修改行程文字）時，請把 CACHE_NAME 的版本號 +1，
// 這樣 iPhone 上的舊快取才會被換掉。
const CACHE_NAME = 'osaka2027-v2';

const PRECACHE_URLS = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-180.png',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-512-maskable.png',
  './icons/favicon-32.png',
  './assets/d1.png',
  './assets/d2_flag.png',
  './assets/d2_meeting.jpg',
  './assets/d3_umeda.png',
  './assets/d4_fushimi.png',
  './assets/d4_kiyomizu.png',
  './assets/d4_tsutenkaku.png',
  './assets/d5_rinku_1f.png',
  './assets/d5_rinku_2f3f.png',
  './assets/overview.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(
        names.filter((name) => name !== CACHE_NAME)
             .map((name) => caches.delete(name))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req)
        .then((res) => {
          if (res && res.status === 200) {
            const clone = res.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
          }
          return res;
        })
        .catch(() => {
          if (req.mode === 'navigate') return caches.match('./index.html');
        });
    })
  );
});
