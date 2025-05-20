// public/service-worker.js
self.addEventListener('push', (event) => {
  let data = {};
  try {
    if (event.data) {
      data = event.data.json();
    }
  } catch (e) {
    console.error('Error al parsear los datos del push:', e);
    data = {
      title: 'YASI K\'ARI',
      body: 'Tienes una nueva notificación. Abre la app para más detalles.',
      url: '/',
    };
  }

  const title = data.title || 'YASI K\'ARI';
  const options = {
    body: data.body || 'Tienes una nueva notificación.',
    icon: '/icons/icon-192x192.png', // Icono principal para la notificación
    badge: '/icons/icon-96x96.png',  // Icono pequeño (ej. barra de estado Android)
    // tag: 'yasi-kari-notification-tag', // Opcional: para agrupar o reemplazar notificaciones
    data: { // Datos adicionales que quieres pasar a la app si se abre desde la notif.
      url: data.url || '/', // URL a abrir al hacer clic
    },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close(); // Cierra la notificación

  const urlToOpen = event.notification.data.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // Comprueba si alguna ventana de la app con la URL específica ya está abierta
      const clientToFocus = windowClients.find(
        (wc) => new URL(wc.url).pathname === new URL(urlToOpen, self.location.origin).pathname
      );

      if (clientToFocus) {
        return clientToFocus.focus();
      }
      // Si no, abre una nueva ventana
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// Opcional: Manejar la instalación del Service Worker
self.addEventListener('install', (event) => {
  console.log('Service Worker instalado.');
  // event.waitUntil(self.skipWaiting()); // Forzar activación inmediata del nuevo SW (usar con precaución)
});

// Opcional: Manejar la activación del Service Worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker activado.');
  // event.waitUntil(clients.claim()); // Tomar control inmediato de las páginas (usar con precaución)
});
