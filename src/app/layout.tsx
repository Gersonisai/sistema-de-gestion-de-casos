
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
    statusBarStyle: "default", 
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    shortcut: "/icons/favicon.ico",
    apple: [ 
      { url: "/icons/icon-152x152.png", sizes: "152x152" },
      { url: "/icons/icon-180x180.png", sizes: "180x180" },
      { url: "/icons/icon-167x167.png", sizes: "167x167" },
      { url: "/icons/icon-192x192.png", sizes: "192x192" }, 
    ],
    other: [
       { rel: 'icon', type: 'image/png', sizes: '32x32', url: '/icons/favicon-32x32.png' },
       { rel: 'icon', type: 'image/png', sizes: '16x16', url: '/icons/favicon-16x16.png' },
       // PWA icons referenced in manifest.json
       { rel: 'icon', type: 'image/png', sizes: '72x72', url: '/icons/icon-72x72.png' },
       { rel: 'icon', type: 'image/png', sizes: '96x96', url: '/icons/icon-96x96.png' },
       { rel: 'icon', type: 'image/png', sizes: '128x128', url: '/icons/icon-128x128.png' },
       { rel: 'icon', type: 'image/png', sizes: '144x144', url: '/icons/icon-144x144.png' },
       { rel: 'icon', type: 'image/png', sizes: '384x384', url: '/icons/icon-384x384.png' },
       { rel: 'icon', type: 'image/png', sizes: '512x512', url: '/icons/icon-512x512.png' },
    ]
  },
};

export const viewport: Viewport = {
  themeColor: "#3F51B5", 
  colorScheme: "light dark", 
  // Ensure PWA related viewport settings are optimal
  initialScale: 1,
  width: 'device-width',
  viewportFit: 'cover', // Good for edge-to-edge displays on iOS
};


export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning={true}>
      <head>
        {/* Meta tags for PWA and experience móvil are largely covered by `metadata` and `viewport` objects */}
        {/* theme-color is in viewport */}
        {/* manifest link is in metadata */}
        
        {/* Apple specific meta tags are in metadata.appleWebApp */}
        {/* <meta name="apple-mobile-web-app-capable" content="yes" /> */}
        {/* <meta name="apple-mobile-web-app-status-bar-style" content="default" /> */}
        {/* <meta name="apple-mobile-web-app-title" content="YASI K'ARI" /> */}
        
        <meta name="msapplication-TileColor" content="#3F51B5" />
        <meta name="msapplication-config" content="/icons/browserconfig.xml" />
        <meta name="mobile-web-app-capable" content="yes" />

        {/* Additional PWA related tags that might be beneficial */}
        <meta name="HandheldFriendly" content="true" />
        <meta name="description" content={metadata.description || "Gestión Legal Inteligente YASI K'ARI"} />
      </head>
      <body 
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning={true} // Added here as well for good measure, though on html might be enough
      >
        <AuthProvider>
          <ClientEffects />
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
