
// public/service-worker.js
self.addEventListener('push', (event) => {
  let data = { title: 'YASI K\'ARI', body: 'Tienes una nueva notificación.', tag: 'yasi-kari-notification' };
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      console.error('Error al parsear datos del push event:', e);
      // Usar datos por defecto si el parseo falla
    }
  }

  const title = data.title || 'YASI K\'ARI';
  const options = {
    body: data.body || 'Revisa tus recordatorios.',
    icon: '/icons/icon-192x192.png', // Asegúrate de tener este icono en public/icons/
    badge: '/icons/icon-96x96.png',  // Y este en public/icons/
    tag: data.tag || 'yasi-kari-notification', // Etiqueta para agrupar o reemplazar notificaciones
    actions: data.actions || [], // Ejemplo: [{ action: 'view', title: 'Ver Detalles' }]
    data: data.data || {} // Datos adicionales para pasar a la app
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  // Acción por defecto: abrir la URL base o una específica si se proporciona
  let openUrl = '/';
  if (event.notification.data && event.notification.data.url) {
    openUrl = event.notification.data.url;
  } else if (event.action === 'view' && event.notification.data && event.notification.data.url) {
    // Ejemplo de manejo de una acción específica
    openUrl = event.notification.data.url;
  }


  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Si hay una ventana de la app abierta, enfócala
      for (const client of clientList) {
        // Comprueba si la URL del cliente coincide o si es la raíz
        // para evitar enfocar una ventana incorrecta si hay varias abiertas.
        const clientUrl = new URL(client.url);
        const targetUrl = new URL(openUrl, self.location.origin);

        if (clientUrl.pathname === targetUrl.pathname && 'focus' in client) {
          return client.focus();
        }
      }
      // Si no hay ventanas abiertas o ninguna coincide, abre una nueva
      if (clients.openWindow) {
        return clients.openWindow(openUrl);
      }
    })
  );
});

// Instala el service worker inmediatamente y toma control.
// Esto es útil para desarrollo y para asegurar que la última versión del SW esté activa.
self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});
