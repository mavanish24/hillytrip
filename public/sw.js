// HillyTrip Offline Service Worker for Remote Hill Regions
const CACHE_VERSION = 'hillytrip-v1';
const STATIC_CACHE = `hillytrip-static-${CACHE_VERSION}`;
const DATA_CACHE = `hillytrip-data-${CACHE_VERSION}`;
const IMAGE_CACHE = `hillytrip-images-${CACHE_VERSION}`;

const PRECACHE_ASSETS = [
  '/',
  '/index.html',
];

// Install Event: Pre-cache core shell resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log('[Service Worker] Pre-caching Core App Shell...');
      return cache.addAll(PRECACHE_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activate Event: Cleanup stale caches and claim clients
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

// Helper: Check if request is a static asset bundle
function isStaticAsset(url) {
  return (
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.woff') ||
    url.pathname.endsWith('.woff2') ||
    url.pathname.endsWith('.ttf') ||
    url.pathname.includes('/assets/')
  );
}

// Fetch Event Interception
self.addEventListener('fetch', (event) => {
  // Only process standard GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  const url = new URL(event.request.url);

  // 0. Handle page navigation requests for SPA (Browser Router / client-side paths)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          console.log('[Service Worker] Device offline, serving cached index.html App Shell for navigation:', url.pathname);
          return caches.match('/index.html') || caches.match('/');
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
            // Serve from cache immediately but fetch updated in background (Stale-While-Revalidate)
            fetch(event.request)
              .then((networkResponse) => {
                if (networkResponse.status === 200) {
                  cache.put(event.request, networkResponse.clone());
                }
              })
              .catch(() => { /* Ignore offline update errors for images */ });
            return cachedResponse;
          }

          // Fetch from network and save to cache
          return fetch(event.request)
            .then((networkResponse) => {
              if (networkResponse.status === 200 || networkResponse.status === 0) {
                cache.put(event.request, networkResponse.clone());
              }
              return networkResponse;
            })
            .catch((err) => {
              console.warn('[Service Worker] Failed to fetch image offline:', url.href);
              // Fallback placeholder/offline graphic can be added here
              return cachedResponse;
            });
        });
      })
    );
    return;
  }

  // 3. Handle Essential Travel Data (Dynamic API Calls)
  // Network-First strategy: Always try network to get freshest rates/records, fall back to offline cache
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
              
              // If there's no cache for endpoints like search or booking offline
              // Return a custom offline JSON friendly error
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

  // 4. Handle Standard Shell Files (Web JS, Styles, Index)
  // Stale-While-Revalidate Strategy
  event.respondWith(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.match(event.request).then((cachedResponse) => {
        const fetchPromise = fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse.status === 200) {
              cache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
          })
          .catch((err) => {
            if (cachedResponse) return cachedResponse;
            // Otherwise try falling back to index shell for SPA navigation
            return caches.match('/');
          });

        return cachedResponse || fetchPromise;
      });
    })
  );
});
