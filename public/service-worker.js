// service-worker.js

const CACHE_NAME = 'yasi-kari-cache-v1';
const OFFLINE_URL = '/offline.html'; // Your offline fallback page

// Archivos a cachear al instalar el Service Worker
const urlsToCache = [
  '/',
  '/offline.html',
  '/manifest.json',
  '/icons/icon-192x192.png', // Asegúrate que este icono existe
  '/icons/icon-512x512.png', // Asegúrate que este icono existe
  // Puedes añadir aquí manualmente rutas a assets importantes que siempre quieras cacheados
  // Por ejemplo: '/_next/static/css/...'
  // '/_next/static/chunks/...'
  // '/_next/static/media/...'
];

self.addEventListener('install', (event) => {
  console.log('[Service Worker] Install event');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Opened cache:', CACHE_NAME);
        // Cachear la página offline es crucial
        return cache.addAll(urlsToCache.concat([OFFLINE_URL]));
      })
      .catch(err => {
        console.error('[Service Worker] Cache addAll failed:', err);
      })
  );
  self.skipWaiting(); // Fuerza al SW a activarse inmediatamente
});

self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activate event');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim(); // Permite al SW tomar control de las pestañas abiertas inmediatamente
});

self.addEventListener('fetch', (event) => {
  // Solo manejar peticiones GET
  if (event.request.method !== 'GET') {
    return;
  }

  // Estrategia: Network falling back to cache, then offline page
  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return fetch(event.request)
        .then((response) => {
          // Si la respuesta es válida, la cacheamos y la devolvemos
          if (response && response.status === 200 && response.type === 'basic') {
            // Solo cachear si es una respuesta exitosa y del mismo origen
            // (evitar cachear respuestas de APIs de terceros por defecto aquí)
            // O si es una petición a Next.js static assets
            if (event.request.url.startsWith(self.origin) || event.request.url.includes('/_next/static/')) {
                 cache.put(event.request, response.clone());
            }
          }
          return response;
        })
        .catch((error) => {
          // Si la red falla, intentamos obtener del caché
          console.log('[Service Worker] Network request failed, trying cache for:', event.request.url, error);
          return cache.match(event.request)
            .then((cachedResponse) => {
              if (cachedResponse) {
                return cachedResponse;
              }
              // Si no está en caché y es una petición de navegación, mostrar la página offline
              if (event.request.mode === 'navigate') {
                return cache.match(OFFLINE_URL);
              }
              // Para otros tipos de recursos no encontrados en caché, simplemente dejamos que falle
              return new Response("Network error and resource not found in cache.", {
                status: 408,
                headers: { 'Content-Type': 'text/plain' },
              });
            });
        });
    })
  );
});


self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push Received.');
  console.log(`[Service Worker] Push had this data: "${event.data ? event.data.text() : 'No data'}"`);

  let title = 'YASI K\'ARI';
  let options = {
    body: 'Tienes una nueva notificación.',
    icon: '/icons/icon-192x192.png', // Icono para la notificación
    badge: '/icons/icon-96x96.png', // Icono pequeño para la barra de estado (Android)
    vibrate: [200, 100, 200],
    data: {
      url: '/', // URL a abrir al hacer clic en la notificación
    }
  };

  if (event.data) {
    try {
      const data = event.data.json();
      title = data.title || title;
      options.body = data.body || options.body;
      options.icon = data.icon || options.icon;
      options.badge = data.badge || options.badge;
      if (data.url) {
        options.data.url = data.url;
      }
    } catch (e) {
      console.error('[Service Worker] Error parsing push data:', e);
      // Usar el texto directamente si no es JSON
      const textData = event.data.text();
      if(textData) options.body = textData;
    }
  }

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notification click Received.');
  event.notification.close();
  const urlToOpen = event.notification.data && event.notification.data.url ? event.notification.data.url : '/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Si hay una pestaña abierta con la misma URL, la enfoca
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      // Si no, abre una nueva pestaña
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
