
import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from "@/components/ui/toaster";
import type { ReactNode } from 'react';
import { ClientEffects } from '@/components/layout/ClientEffects';


const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'YASI K\'ARI - Gestión Legal',
  description: 'Sistema inteligente para la gestión de casos legales, recordatorios y notificaciones.',
  applicationName: "YASI K'ARI",
  manifest: '/manifest.json', // Enlace al manifest.json
  appleWebApp: {
    capable: true,
    title: "YASI K'ARI",
    statusBarStyle: "default", // Puedes usar "black-translucent" si tu app tiene fondo oscuro
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    shortcut: "/icons/favicon.ico",
    apple: [ // Apple Touch Icons
      { url: "/icons/icon-152x152.png", sizes: "152x152" },
      { url: "/icons/icon-180x180.png", sizes: "180x180" },
      { url: "/icons/icon-167x167.png", sizes: "167x167" },
      { url: "/icons/icon-192x192.png", sizes: "192x192" }, // Usado también por Android si es "purpose: 'any maskable'"
    ],
    other: [
       { rel: 'icon', type: 'image/png', sizes: '32x32', url: '/icons/favicon-32x32.png' },
       { rel: 'icon', type: 'image/png', sizes: '16x16', url: '/icons/favicon-16x16.png' },
       // Podrías añadir más tamaños o iconos específicos aquí si es necesario
    ]
  },
};

export const viewport: Viewport = {
  themeColor: "#3F51B5", // Color principal de la app para la barra de estado/título del navegador
  colorScheme: "light dark", // Si tu app soporta ambos temas y quieres que el navegador lo sepa
};


export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        {/* Meta tags para PWA y experiencia móvil ya cubiertos por `metadata` y `viewport` */}
        {/* <meta name="theme-color" content="#3F51B5" /> ya en viewport */}
        {/* <link rel="manifest" href="/manifest.json" /> ya en metadata */}
        {/* Apple specific meta tags
        <meta name="apple-mobile-web-app-capable" content="yes" /> ya en metadata.appleWebApp
        <meta name="apple-mobile-web-app-status-bar-style" content="default" /> ya en metadata.appleWebApp
        <meta name="apple-mobile-web-app-title" content="YASI K'ARI" /> ya en metadata.appleWebApp
        */}
        <meta name="msapplication-TileColor" content="#3F51B5" />
        <meta name="msapplication-config" content="/icons/browserconfig.xml" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AuthProvider>
          <ClientEffects />
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
