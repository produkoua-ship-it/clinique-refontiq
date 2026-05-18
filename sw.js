const CACHE_NAME = 'refontiq-v4';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/login.html',

  // Styles & Scripts principaux
  '/assets/landing-style.css',
  '/assets/premium-style.css',
  '/assets/mobile.css',
  '/assets/ai-assistant.css',
  '/assets/role-manager.js',
  '/assets/ai-assistant.js',
  '/assets/barcode-scanner.js',
  '/supabase-config.js',

  // Pages de l'application
  '/app/dashboard.html',
  '/app/patients.html',
  '/app/consultations.html',
  '/app/rendez-vous.html',
  '/app/finance.html',
  '/app/stocks.html',
  '/app/messagerie.html',
  '/app/alertes.html',
  '/app/parametres.html',
  '/app/hospitalisation.html',
  '/app/reporting.html',
  '/app/vitals-tablet.html',
  '/app/dossier-patient.html',

  // Composants Sidebar
  '/app/components/sidebar-medecin.html',
  '/app/components/sidebar-infirmiere.html',
  '/app/components/sidebar-reception.html',

  // Manifest PWA & Service Worker
  '/manifest.json',
  '/sw.js',

  // Polices Google Fonts (Inter + Space Grotesk)
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap',
  'https://fonts.gstatic.com/s/inter/v18/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa1ZL7.woff2',
  'https://fonts.gstatic.com/s/spacegrotesk/v21/V8mDoQDjQSkFtomMMQKjE5Y.woff2',

  // Font Awesome
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/webfonts/fa-solid-900.woff2',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/webfonts/fa-regular-400.woff2',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/webfonts/fa-brands-400.woff2',

  // Bibliothèques JS externes
  'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2',
  'https://cdn.jsdelivr.net/npm/chart.js'
];

// Installation du Service Worker
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Mise en cache de toutes les ressources...');
      return Promise.allSettled(
        ASSETS_TO_CACHE.map(url =>
          cache.add(url).catch(err => {
            console.warn('[SW] Échec de mise en cache:', url, err.message);
          })
        )
      );
    })
  );
});

// Activation et nettoyage des anciens caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('[SW] Suppression de l\'ancien cache', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
    ])
  );
});

// Stratégie adaptative selon le type de ressource
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorer les requêtes Supabase (API) et non-GET
  if (request.method !== 'GET' || url.hostname.includes('supabase.co') || url.hostname.includes('supabase')) {
    return;
  }

  // Pour les ressources statiques (CSS, JS, polices, images) -> Cache First
  if (
    url.hostname === 'fonts.googleapis.com' ||
    url.hostname === 'fonts.gstatic.com' ||
    url.hostname === 'cdnjs.cloudflare.com' ||
    url.hostname === 'cdn.jsdelivr.net' ||
    request.destination === 'style' ||
    request.destination === 'script' ||
    request.destination === 'font' ||
    request.destination === 'image'
  ) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) return cachedResponse;
        return fetch(request).then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        }).catch(() => {
          // Fallback silencieux pour les ressources qui ne sont pas en cache
          return new Response('', { status: 408, statusText: 'Offline' });
        });
      })
    );
    return;
  }

  // Pour les pages HTML -> Network First
  if (request.destination === 'document' || request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => {
          return caches.match(request).then((cached) => {
            if (cached) return cached;
            return caches.match('/login.html');
          });
        })
    );
    return;
  }

  // Pour tout le reste -> Network First
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      })
      .catch(() => caches.match(request))
  );
});