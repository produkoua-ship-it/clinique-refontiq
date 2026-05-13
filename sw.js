const CACHE_NAME = 'refontiq-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/login.html',
  '/assets/landing-style.css',
  '/assets/premium-style.css',
  '/assets/role-manager.js',
  '/supabase-config.js'
];

// Installation du Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Mise en cache des ressources critiques');
      return cache.addAll(ASSETS_TO_CACHE).catch(err => {
        console.warn('[SW] Échec de la mise en cache de certaines ressources (normal en local)');
      });
    })
  );
});

// Activation
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Suppression de l\'ancien cache');
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Stratégie : Network First (Priorité au réseau, puis cache)
// C'est mieux pour un Dashboard qui bouge souvent
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});
