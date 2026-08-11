// ============================================
// 张小浪百宝箱 · Service Worker（离线缓存）
// 放网站根目录，和 index.html 同级
// 作用：缓存网页和图标，打开过一次后，
//       再次打开更快，断网也能打开
// ============================================
var CACHE = 'zxl-v1';
var ASSETS = [
  '/',
  '/index.html',
  '/splash.jpg',
  '/icon-192.png',
  '/icon-512.png'
];

// 安装：把网页和图标存进缓存
self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (c) {
      return c.addAll(ASSETS);
    }).then(function () {
      return self.skipWaiting();
    })
  );
});

// 激活：清理旧缓存
self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (k) {
        if (k !== CACHE) return caches.delete(k);
      }));
    }).then(function () {
      return self.clients.claim();
    })
  );
});

// 拦截请求：先看缓存，没有再去网络；断网时返回缓存的首页
self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(function (hit) {
      if (hit) return hit;
      return fetch(e.request).then(function (res) {
        if (res && res.status === 200 && e.request.url.indexOf('http') === 0) {
          var copy = res.clone();
          caches.open(CACHE).then(function (c) { c.put(e.request, copy); });
        }
        return res;
      }).catch(function () {
        if (e.request.mode === 'navigate') return caches.match('/index.html');
        return caches.match('/index.html');
      });
    })
  );
});
