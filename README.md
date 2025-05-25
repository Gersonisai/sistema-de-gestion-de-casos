# YASI K'ARI - Gestión Legal Inteligente

Este es un proyecto Next.js para YASI K'ARI, una aplicación de gestión de casos legales.

## Descripción

YASI K'ARI es una aplicación web diseñada para ayudar a abogados y bufetes a gestionar sus casos legales de manera eficiente. Ofrece funcionalidades para el seguimiento de casos, gestión de recordatorios, y está preparada para notificaciones push. La aplicación utiliza Firebase para la autenticación de usuarios y Genkit para futuras funcionalidades de IA.

Está construida como una Progressive Web App (PWA), lo que permite a los usuarios instalarla en sus dispositivos para una experiencia más integrada.

## Empezando

Para iniciar el proyecto localmente:

1.  **Clonar el repositorio (si aplica) o tener los archivos del proyecto.**
2.  **Instalar dependencias:**
    ```bash
    npm install
    # o
    yarn install
    ```
3.  **Configurar Variables de Entorno:**
    Cree un archivo `.env.local` en la raíz del proyecto y añada las siguientes variables con sus valores correspondientes de su proyecto de Firebase:
    ```env
    NEXT_PUBLIC_FIREBASE_API_KEY=TU_API_KEY_DE_FIREBASE
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=TU_AUTH_DOMAIN_DE_FIREBASE
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=TU_PROJECT_ID_DE_FIREBASE
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=TU_STORAGE_BUCKET_DE_FIREBASE
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=TU_MESSAGING_SENDER_ID_DE_FIREBASE
    NEXT_PUBLIC_FIREBASE_APP_ID=TU_APP_ID_DE_FIREBASE
    # Opcional, pero recomendado para notificaciones push:
    NEXT_PUBLIC_VAPID_PUBLIC_KEY=TU_CLAVE_PUBLICA_VAPID_DE_FIREBASE_MESSAGING
    ```
    Asegúrese de habilitar Firebase Authentication (con proveedor Email/Contraseña) y Firebase Cloud Messaging (para obtener la clave VAPID) en su consola de Firebase.

4.  **Ejecutar el servidor de desarrollo:**
    ```bash
    npm run dev
    # o
    yarn dev
    ```
    Abra [http://localhost:9002](http://localhost:9002) (o el puerto que esté configurado) en su navegador.

5.  **Credenciales de prueba (si usa `mockData.ts` para roles iniciales):**
    *   Admin: `admin@lexcase.com` / `password`
    *   Abogado: `abogado1@lexcase.com` / `password`

## Stack Tecnológico

*   **Next.js** (Framework React)
*   **React** (Librería UI)
*   **TypeScript**
*   **Tailwind CSS** (Estilos)
*   **ShadCN UI** (Componentes UI)
*   **Firebase Authentication** (Autenticación de usuarios)
*   **Genkit (Google AI)** (Para funcionalidades de IA, ej: generación de texto de notificaciones)
*   **Progressive Web App (PWA)**

## Estado Actual del Prototipo

La aplicación es un prototipo funcional. La mayoría de los datos de la aplicación (casos, recordatorios, perfiles de usuario detallados más allá de la autenticación básica) se gestionan actualmente con datos de prueba en `src/data/mockData.ts`. Para una aplicación de producción, estos datos deberían migrarse a una base de datos persistente como Firebase Firestore.

El envío real de notificaciones push requiere la implementación de un backend que gestione la lógica de envío y se integre con Firebase Cloud Messaging. El frontend está preparado para recibir y mostrar estas notificaciones.

## Próximos Pasos (Conceptuales para Producción)

*   Migrar datos de `mockData.ts` a una base de datos persistente (ej. Firestore).
*   Implementar un backend para la lógica de negocio avanzada, incluyendo:
    *   Gestión de roles de usuario robusta.
    *   Envío de notificaciones push a través de FCM.
    *   Procesamiento seguro de datos.
*   Si se desea publicar en tiendas de aplicaciones:
    *   Para Android: Empaquetar la PWA usando Trusted Web Activity (TWA).
    *   Para iOS: Investigar opciones de empaquetado o publicación directa de PWAs (puede ser más limitado).
*   Implementar el modelo de suscripción y pagos si se evoluciona a un SaaS.
*   Desarrollar la personalización por consorcio (marca blanca, etc.).
```