// AgroGuard AI Service Worker
const CACHE_NAME = 'agroguard-ai-v1.0.0';
const DEBUG_MODE = true;

// Files to cache for offline functionality
const STATIC_CACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/placeholder.svg'
];

// Debug logging
function debugLog(message, data = '') {
  if (DEBUG_MODE) {
    console.log(`[SW] ${message}`, data);
  }
}

// Install event - cache static resources
self.addEventListener('install', (event) => {
  debugLog('Service Worker installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        debugLog('Caching static resources');
        return cache.addAll(STATIC_CACHE_URLS);
      })
      .then(() => {
        debugLog('Service Worker installed successfully');
        return self.skipWaiting();
      })
      .catch((error) => {
        debugLog('Service Worker installation failed', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  debugLog('Service Worker activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              debugLog('Deleting old cache', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        debugLog('Service Worker activated successfully');
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip external requests (API calls, etc.)
  if (url.origin !== location.origin) {
    return;
  }
  
  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          debugLog('Serving from cache', request.url);
          return cachedResponse;
        }
        
        debugLog('Fetching from network', request.url);
        return fetch(request)
          .then((response) => {
            // Don't cache non-successful responses
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // Clone the response for caching
            const responseToCache = response.clone();
            
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(request, responseToCache);
              });
            
            return response;
          })
          .catch((error) => {
            debugLog('Network fetch failed', error);
            
            // Return offline page for navigation requests
            if (request.destination === 'document') {
              return caches.match('/index.html');
            }
            
            throw error;
          });
      })
  );
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  debugLog('Background sync triggered', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Handle offline actions when back online
      handleBackgroundSync()
    );
  }
});

// Push notification handler
self.addEventListener('push', (event) => {
  debugLog('Push notification received', event.data?.text());
  
  const options = {
    body: event.data?.text() || 'New update available',
    icon: '/placeholder.svg',
    badge: '/placeholder.svg',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Open App',
        icon: '/placeholder.svg'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/placeholder.svg'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('AgroGuard AI', options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  debugLog('Notification clicked', event.action);
  
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Handle background sync
async function handleBackgroundSync() {
  try {
    debugLog('Handling background sync...');
    
    // Get stored offline actions from IndexedDB
    // Process any pending uploads, form submissions, etc.
    
    debugLog('Background sync completed');
  } catch (error) {
    debugLog('Background sync failed', error);
  }
}

// Message handler for communication with main app
self.addEventListener('message', (event) => {
  debugLog('Message received from app', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});