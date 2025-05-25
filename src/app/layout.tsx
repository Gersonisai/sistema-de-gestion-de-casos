
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
  manifest: '/manifest.json', // Link to the manifest.json
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
      { url: "/icons/icon-192x192.png", sizes: "192x192" }, // Often used by Android too
    ],
    other: [ // Simplified to essential favicons, PWA icons are in manifest.json
       { rel: 'icon', type: 'image/png', sizes: '32x32', url: '/icons/favicon-32x32.png' },
       { rel: 'icon', type: 'image/png', sizes: '16x16', url: '/icons/favicon-16x16.png' },
    ]
  },
  other: { // Moved meta tags here
    'msapplication-TileColor': '#3F51B5',
    'msapplication-config': '/icons/browserconfig.xml',
    'mobile-web-app-capable': 'yes',
    'HandheldFriendly': 'true',
  }
};

export const viewport: Viewport = {
  themeColor: "#3F51B5",
  colorScheme: "light dark",
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
        {/*
          Next.js will automatically inject tags generated from the `metadata` and `viewport` exports,
          as well as essential stylesheets and scripts.
          The manual <head> section is kept minimal.
        */}
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning={true} // Keep this for browser extension issues
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
