
import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from "@/components/ui/toaster";
import type { ReactNode } from 'react'; // Changed from import React, {useEffect}
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
  title: 'YASI K\'ARI',
  description: 'Gestión de Casos Legales',
  manifest: '/manifest.json',
  applicationName: "YASI K'ARI",
  appleWebApp: {
    capable: true,
    title: "YASI K'ARI",
    statusBarStyle: "default",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    shortcut: "/icons/favicon.ico", // It's good to have a general favicon
    apple: [
      { url: "/icons/icon-192x192.png" }, // General purpose, will be picked by Apple if specific sizes are not found
      { url: "/icons/icon-152x152.png", sizes: "152x152" },
      { url: "/icons/icon-180x180.png", sizes: "180x180" }, // iPhone Retina HD
      { url: "/icons/icon-167x167.png", sizes: "167x167" }, // iPad Retina
    ],
    other: [
       { rel: 'icon', type: 'image/png', sizes: '32x32', url: '/icons/favicon-32x32.png' },
       { rel: 'icon', type: 'image/png', sizes: '16x16', url: '/icons/favicon-16x16.png' },
    ]
  },
};

export const viewport: Viewport = {
  themeColor: "#3F51B5", // Matches primary color
  // colorScheme: "light dark", // If you support both explicitly
};


export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode; // Use ReactNode directly
}>) {
  // useEffect for service worker registration moved to ClientEffects component

  return (
    <html lang="es">
      <head>
        {/* Manifest and theme colors are better handled by Next.js metadata API or directly here if not covered by metadata */}
        {/* <link rel="manifest" href="/manifest.json" /> */}
        {/* <meta name="theme-color" content="#3F51B5" /> */}
        <meta name="msapplication-TileColor" content="#3F51B5" />
        <meta name="msapplication-config" content="/icons/browserconfig.xml" />
        <meta name="mobile-web-app-capable" content="yes" />
        {/* Apple specific meta tags are better handled by metadata.appleWebApp */}
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AuthProvider>
          <ClientEffects /> {/* Add the client-side effects component here */}
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
