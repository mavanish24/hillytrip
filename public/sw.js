// HillyTrip Offline Service Worker for Remote Hill Regions
// Immediately bypass and self-unregister on localhost / development
if (self.location.hostname === 'localhost' || self.location.hostname === '127.0.0.1' || self.location.hostname.includes('preview')) {
  self.addEventListener('install', () => self.skipWaiting());
  self.addEventListener('activate', (e) => {
    e.waitUntil(
      caches.keys()
        .then((keys) => Promise.all(keys.map((k) => caches.delete(k))))
        .then(() => self.registration.unregister())
    );
  });
}

const CACHE_VERSION = 'hillytrip-v3';
const STATIC_CACHE = `hillytrip-static-${CACHE_VERSION}`;
const DATA_CACHE = `hillytrip-data-${CACHE_VERSION}`;
const IMAGE_CACHE = `hillytrip-images-${CACHE_VERSION}`;

const PRECACHE_ASSETS = [
  '/',
  '/index.html',
];

// Install Event: Skip waiting & precache core app shell
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log('[Service Worker] Pre-caching Core App Shell...');
      return cache.addAll(PRECACHE_ASSETS);
    })
  );
});

// Activate Event: Immediately claim clients and purge obsolete caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (
            cacheName !== STATIC_CACHE &&
            cacheName !== DATA_CACHE &&
            cacheName !== IMAGE_CACHE
          ) {
            console.log(`[Service Worker] Pruning obsolete cache: ${cacheName}`);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event Interception
self.addEventListener('fetch', (event) => {
  // Only process standard GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  const url = new URL(event.request.url);

  // 0. Handle page navigation requests for SPA (Browser Router / client-side paths)
  // Network-First strategy ensures users always get fresh index.html with up-to-date Vite chunk manifests
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse.status === 200) {
            const copy = networkResponse.clone();
            caches.open(STATIC_CACHE).then((cache) => cache.put('/', copy));
          }
          return networkResponse;
        })
        .catch(() => {
          console.log('[Service Worker] Device offline, serving cached index.html App Shell for navigation:', url.pathname);
          return caches.match('/') || caches.match('/index.html');
        })
    );
    return;
  }

  // 1. DO NOT cache backoffice or admin endpoints
  if (url.pathname.includes('/api/admin/')) {
    return;
  }

  // 2. Handle Scenic Travel Photos / Unsplash Images
  if (
    url.hostname.includes('unsplash.com') ||
    url.hostname.includes('firebasestorage.googleapis.com') ||
    url.pathname.match(/\.(png|jpg|jpeg|gif|webp|svg)/i)
  ) {
    event.respondWith(
      caches.open(IMAGE_CACHE).then((cache) => {
        return cache.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            fetch(event.request)
              .then((networkResponse) => {
                if (networkResponse.status === 200) {
                  cache.put(event.request, networkResponse.clone());
                }
              })
              .catch(() => { /* Ignore offline update errors for images */ });
            return cachedResponse;
          }

          return fetch(event.request)
            .then((networkResponse) => {
              if (networkResponse.status === 200 || networkResponse.status === 0) {
                cache.put(event.request, networkResponse.clone());
              }
              return networkResponse;
            })
            .catch((err) => {
              console.warn('[Service Worker] Failed to fetch image offline:', url.href);
              return cachedResponse;
            });
        });
      })
    );
    return;
  }

  // 3. Handle Essential Travel Data (Dynamic API Calls)
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      caches.open(DATA_CACHE).then((cache) => {
        return fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse.status === 200) {
              cache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
          })
          .catch(() => {
            console.log(`[Service Worker] Connection offline. Falling back to cached travel data for: ${url.pathname}`);
            return cache.match(event.request).then((cachedResponse) => {
              if (cachedResponse) {
                return cachedResponse;
              }
              
              return new Response(
                JSON.stringify({
                  error: 'Offline Mode Active',
                  message: 'This route data is not cached yet. Please visit this section while connected to save it for offline use.',
                  offline: true,
                }),
                {
                  status: 200,
                  headers: { 'Content-Type': 'application/json' },
                }
              );
            });
          });
      })
    );
    return;
  }

  // 4. Handle Navigation Requests (HTML / Page Routes)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse.status === 200) {
            const copy = networkResponse.clone();
            caches.open(STATIC_CACHE).then((cache) => cache.put(event.request, copy));
          }
          return networkResponse;
        })
        .catch(() => {
          return caches.match(event.request).then((cachedResponse) => {
            return cachedResponse || caches.match('/') || caches.match('/index.html');
          });
        })
    );
    return;
  }

  // 5. Handle Scripts and Styles - NEVER fallback to HTML
  const isScriptOrStyle = event.request.destination === 'script' || 
                         event.request.destination === 'style' ||
                         url.pathname.endsWith('.js') || 
                         url.pathname.endsWith('.mjs') || 
                         url.pathname.endsWith('.css');

  if (isScriptOrStyle) {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse.status === 200) {
            const copy = networkResponse.clone();
            caches.open(STATIC_CACHE).then((cache) => cache.put(event.request, copy));
          }
          return networkResponse;
        })
        .catch(() => {
          return caches.match(event.request);
        })
    );
    return;
  }

  // 6. Handle Standard Shell Files & Other Static Assets
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return cachedResponse || fetch(event.request);
    })
  );
});
