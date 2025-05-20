// src/components/layout/ClientEffects.tsx
"use client";

import { useEffect } from 'react';

export function ClientEffects() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/service-worker.js')
        .then((registration) => console.log('Service Worker registrado con éxito:', registration))
        .catch((error) => console.error('Error al registrar Service Worker:', error));
    }
  }, []);

  return null; // This component does not render any UI
}
